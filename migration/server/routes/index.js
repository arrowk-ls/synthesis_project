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

        let oracle_connection = null;
        let mysql_connection = null;

        try {
            oracle_connection = oracle.getConnection(oracle_config);
            mysql_connection = mysql.createConnection(mysql_config);
            mysql_connection.connect();
        } catch (err) {
            console.log(err)
        }

        res.send({success: 'ok'})

    } else {

        res.send({error: 'Error : invalid action requested.'})

    }

});

module.exports = router