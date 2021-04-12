const mysql = require('mysql')

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',
    password: 'password',
    database: 'db_test'
});

connection.connect(function (err) {
    if (err) {
        console.error('Connection error with mysql : ' + err.message);
    } else {
        console.log('Connected to the mysql database.');
    }
});

module.exports = connection;

/*var mysql = require('mysql');

var config = mysql.createPool({
        host: 'localhost',
        user: 'newuser',
        password: 'password',
        database: 'db_test'
    })

module.exports = config;*/