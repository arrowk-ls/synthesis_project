/**
 * Module dependencies.
 */
var Oracle = require('oracle');
var Mysql = require('mysql');
var EventEmitter = require("events").EventEmitter;

function Migrator () {
	this.init.apply(this, arguments);
};

Migrator.prototype = {
	__proto__ : EventEmitter.prototype,

	oracle_infos : {
		hostname : 'localhost',
		user : '',
		password : '',
		port : 1521,
		database : ''
	},
	mysql_infos : {
		hostname : 'localhost',
		user : '',
		password : '',
		port : 3306,
		database : '',
		bDebug : true
	},
	oracle_connection : null,
	mysql_connection : null,

	connectedToOracle : false,
	connectedToMysql : false,

	migrationCount : 0,
	migrationDoneCount : 0,
	migrationResult : {},

	init : function(htOracle, htMysql) {
		this.oracle_infos = htOracle || this.oracle_infos;
		this.mysql_infos = htMysql || this.mysql_infos;

		this._connectToOracle();
		this._connectToMysql();
	},
	
	_connectToOracle : function() {
		var self = this;
		this.connectedToOracle = false;
		Oracle.connect({
		    "hostname": this.oracle_infos.hostname,
		    "user": this.oracle_infos.user,
		    "password": this.oracle_infos.password,
		    "port" : this.oracle_infos.port,
		    "database" : this.oracle_infos.database
		  }, function(err, connection) {
				if (err) {
					throw new Error(err);
					self.connectedToOracle = false;
			  	} else {
			  		self.oracle_connection = connection;
			  		console.log('connected in _connectToOracle, Migrator.js');
			  		self.connectedToOracle = true;
			  		self._checkConnection();
			  	}
		});
	},
	
	_connectToMysql : function() {
		var self = this;

		this.mysql_connection = Mysql.createConnection({
			host : this.mysql_infos.hostname,
			port : this.mysql_infos.port,
			database : this.mysql_infos.database,
			user : this.mysql_infos.user,
			password : this.mysql_infos.password,
			debug : this.mysql_infos.bDebug
		});

		this.mysql_connection.connect(gDomain.bind(function(oErr) {
            //callback(oErr, oMysqlClient);
            console.log('connected in _connectToMysql, Migrator.js');
            self.connectedToMysql = true;
            self._checkConnection();
        }));

        this.mysql_connection.on('close', gDomain.bind(function(oErr) {
        	console.error('close event in _connectToMysql, Migrator.js');
        	//oMysqlClient.end();
        	self.connectedToMysql = false;
        	self.mysql_connection.end();
        	self._connectToMysql();
        }));

        this.mysql_connection.on('error', gDomain.bind(function(oErr) {
        	console.error('error event in _connectToMysql, migration.js');
        	self.emit('error', err);
        	self.connectedToMysql = false;
        	self.mysql_connection.end();
        	self._connectToMysql();
        }));
	},

	_checkConnection : function() {
		if (this.connectedToOracle && this.connectedToMysql) {
			this.emit('connected');
		}
	},

	migrateByQuery : function(sQuery, sToTablename, bTruncate, fCb) {
		var self = this;

		if (this.connectedToOracle === false || this.connectedToMysql === false) {
			if (err) {
				throw new Error('connection falsed');
				return;
			}
			return;
		}

		console.log('Migrate `%s` is just started\n', sQuery);

		this.migrationCount += 1;

		this.oracle_connection.execute(sQuery, [], function(err, aResult) {
			if (err) {
				throw new Error(err);
				return;
			}

			if (bTruncate) {
				self._truncateOnMysql(sToTablename, function() {
					self._insertDataIntoMysql(sQuery, sToTablename, aResult, fCb);
				});
			} else {
				self._insertDataIntoMysql(sQuery, sToTablename, aResult, fCb);
			}
		});
	},

	_truncateOnMysql : function(sToTablename, fCb) {
		this.mysql_connection.query('TRUNCATE ' + sToTablename, [], function(err, result) {
			if (err) {
				throw new Error(err);
				return;
			}
			fCb();
		});
	},

	_insertDataIntoMysql : function(sQuery, sToTablename, aData, fCb) {
		var self = this,
			nSuccessCount = 0,
			nFailureCount = 0;

		for(var i=0, nLen=aData.length; i<nLen; i++) {
			this.mysql_connection.query('INSERT INTO ' + sToTablename + ' SET ?', aData[i], function(err, aInnerResult) {
				if (err) {
					throw new Error(err);
					nFailureCount += 1;
				} else {
					nSuccessCount += 1;
				}

				if ((nSuccessCount+nFailureCount) === nLen) {
					fCb(self.migrationResult[sQuery] = {
						nSuccessCount : nSuccessCount,
						nFailureCount : nFailureCount
					});
					self.migrationDoneCount += 1;
					if (self.migrationCount === self.migrationDoneCount) {
						self.emit('done', self.migrationResult);
					}
				}
			});
		}
	}
};

module.exports = Migrator;

// SELECT DISTINCT OBJECT_NAME
//   FROM USER_OBJECTS
//  	WHERE OBJECT_TYPE = 'TABLE';

// DESCRIBE test;

// select CONSTRAINT_NAME C_NAME,INDEX_NAME,CONSTRAINT_TYPE,Search_condition,R_CONSTRAINT_NAME R_NAME from user_constraints where TABLE_NAME='TEST';

// select CONSTRAINT_NAME ,COLUMN_NAME,POSITION  from  User_cons_columns where TABLE_NAME='TEST';