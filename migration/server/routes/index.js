var express = require('express');
var router = express.Router();
const oracle = require('oracledb');
const mysql = require('mysql');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {

    if (req.body.action === "migrate") {

        let oracle_hostname = req.body.oracle_hostname,
            oracle_user = req.body.oracle_user,
            oracle_password = req.body.oracle_password,
            oracle_port = req.body.oracle_port,
            oracle_database = req.body.oracle_database;

        let mysql_hostname = req.body.mysql_hostname,
            mysql_user = req.body.mysql_user,
            mysql_password = req.body.mysql_password,
            mysql_port = req.body.mysql_port,
            mysql_database = req.body.mysql_database;

        const oracle_config = {
            hostname : oracle_hostname,
		    user : oracle_user,
		    password : oracle_password,
		    port : oracle_port,
		    database : oracle_database
        }

        const mysql_config = {
            hostname : mysql_hostname,
		    user : mysql_user,
		    password : mysql_password,
		    port : mysql_port,
		    database : mysql_database,
		    bDebug : true
        }

        let mysql_connection = mysql.createConnection(mysql_config);
        mysql_connection.connect();

        let mysql_tables = [];

        // Construct mysql schema based on oracle schema
        oracle.getConnection(oracle_config, function (err, oracle_connection) {
            if (err) res.send({error: 'Error : connection to oracle database failed'});

            oracle_connection.execute("SELECT DISTINCT OBJECT_NAME FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE'", {}, {
               outFormat: oracle.OBJECT
            }, function (err, tables) {

                for (let i = 0; i < tables.length; i++) {
                    let table = tables[i].object_name;

                    let mysql_table = 'CREATE TABLE ' + table + ' (',
                        mysql_table_id = table,
                        mysql_table_dependence = [];

                    oracle_connection.execute("DESCRIBE " + table, {}, {
                        outFormat: oracle.OBJECT
                    }, function (err, columns) {
                        for (let j = 0; j < columns.length; j++) {
                            let column_name = columns[j].column,
                                column_type = columns[j].type;
                            if (column_type.contains('VARCHAR2')) {
                                column_type = column_type.replace(/VARCHAR2/i, 'VARCHAR')
                            } else if (column_type.contains('NUMBER')) {
                                column_type = column_type.replace(/NUMBER/i, 'NUMERIC')
                            } else if (column_type.contains('DATE')) {
                                column_type = column_type.replace(/DATE/i, 'DATETIME')
                            }
                            mysql_table += column_name + ' ' + column_type + ', ';
                        }

                        oracle_connection.execute("SELECT CONSTRAINT_NAME, COLUMN_NAME FROM User_cons_columns WHERE TABLE_NAME='" + table + "'", {}, {
                            outFormat: oracle.OBJECT
                        }, function (err, constraint_names) {
                            for (let k = 0; k < constraint_names.length; k++) {
                                let constraint_name = constraint_names[k].constraint_name,
                                    column_name = constraint_names[k].column_name;
                                oracle_connection.execute("select CONSTRAINT_TYPE, Search_condition, R_CONSTRAINT_NAME from user_constraints where TABLE_NAME='" + table + "' AND CONSTRAINT_NAME='" + constraint_name + "'", {}, {
                                    outFormat: oracle.OBJECT
                                }, function (err, constraint_types) {
                                    for (let l = 0; l < constraint_types.length; l++) {
                                        let constraint_type = constraint_types[l].constraint_type,
                                            constraint_condition = constraint_types[l].search_condition,
                                            relation_name = constraint_types[l].r_constraint_name;
                                        if (constraint_type === 'P') {
                                            mysql_table += 'CONSTRAINT ' + constraint_name + ' PRIMARY KEY (' + column_name + '), ';
                                        } else if (constraint_type === 'U') {
                                            mysql_table += 'CONSTRAINT ' + constraint_name + ' UNIQUE (' + column_name + ')';
                                        } else if (constraint_type === 'C' && constraint_condition.contains('IS NOT NULL')) {
                                            mysql_table += 'CONSTRAINT ' + constraint_name + ' NOT NULL (' + column_name + ')';
                                        } else if (constraint_type === 'C' && !constraint_condition.contains('IS NOT NULL')) {
                                            mysql_table += 'CONSTRAINT ' + constraint_name + ' CHECK (' + constraint_condition + ')';
                                        } else if (constraint_type === 'R') {
                                            oracle_connection.execute("select COLUMN_NAME from User_cons_columns where CONSTRAINT_NAME='" + relation_name + "'", {}, {
                                                outFormat: oracle.OBJECT
                                            }, function (err, relation_infos) {
                                                let relation_table = relation_infos[0].table_name,
                                                    relation_column = relation_infos[0].column_name;
                                                mysql_table += 'CONSTRAINT ' + constraint_name + ' FOREIGN KEY (' + column_name + ') REFERENCES ' + relation_table + '(' + relation_column + '), ';
                                                mysql_table_dependence.push(relation_table);
                                            });
                                        }
                                    }
                                })
                            }
                        })

                    })

                    mysql_table = mysql_table.slice(0, -2);
                    mysql_table += ');';
                    mysql_tables.push({id: mysql_table_id, dependence: mysql_table_dependence, weight: 0, script: mysql_table});

                }

            });
        });

        // Calculate weight of a table by checking how many times this table appear in other table dependencies.
        // This weight determine the order of tables creation.
        for (let i = 0; i < mysql_tables.length; i++) {
            for (let j = 0; j < mysql_tables.length; j++) {
                if (mysql_tables[j].dependence.includes(mysql_tables[i].id)) {
                    let new_object = mysql_tables[i];
                    new_object.weight++;
                    mysql_tables[i] = new_object;
                }
            }
        }

        // Sorting from largest to smallest table weight.
        mysql_tables.sort(function(a, b) {
            if (a.weight < b.weight) return 1
            else if (a.weight > b.weight) return -1
            else return 0;
        })

        // Create tables in mysql database
        for (let i = 0; i < mysql_tables.length; i++) {
            mysql_connection.query(mysql_tables[i].script, function (err, rows) {
                if (err) console.log('Error in mysql table creation : ' + err);
            })
        }

    } else {

        res.send({error: 'Error : invalid action requested.'})

    }

});

module.exports = router