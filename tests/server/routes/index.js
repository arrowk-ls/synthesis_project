var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const bcrypt = require('bcrypt');

const sqlite_db = require('../databases/sqlite/sqlite_connection');
const mysql_db = require('../databases/mysql/mysql_connection');
const mongodb_db = require('../databases/mongodb/mongodb_connection');
const redis_db = require('../databases/redis/redis_connection').client;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {

    if (req.body.action === "run_sqlite_test") {

        const SqliteTest = function () {
            this.insert = function (email, firstname, lastname, birthday, gender, height, weight, pwd, callback) {
                sqlite_db.run("INSERT OR IGNORE INTO test_rows (email, firstName, lastName, birthday, gender, height, weight, pwd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [email, firstname, lastname, birthday, gender, height, weight, bcrypt.hashSync(pwd, 10)], callback);
            };

            this.findByEmail = function (email, callback) {
                sqlite_db.get("SELECT * FROM test_rows WHERE email = ?", [email], callback);
            }
        }

        insert_nb = 1000;
        dateInsert = new Date();
        sqlite_test = new SqliteTest();
        for (i = 1; i <= insert_nb; i++) {
            sqlite_test.insert(i + '@a.a', 'mateo', 'castella', '07/07/01', 'homme', 175, 60, 'blablabla')
        }
        dateInsert = new Date() - dateInsert;

        dateSelect = new Date();
        for (i = 1; i <= insert_nb; i++) {
            sqlite_test.findByEmail(i + '@a.a', function (err, rows) {
                console.log(rows)
            })
        }
        dateSelect = new Date() - dateSelect;
        res.send({insertResponseTimeTotal: dateInsert, insertResponseTimeAverage: dateInsert/insert_nb, selectResponseTimeTotal: dateSelect, selectResponseTimeAverage: dateSelect/insert_nb})

    } else if (req.body.action === "run_mysql_test") {

        const MysqlTest = function () {
            this.insert = function (email, firstname, lastname, birthday, gender, height, weight, pwd) {
                mysql_db.query("INSERT INTO test_rows (email, firstName, lastName, birthday, gender, height, weight, pwd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [email, firstname, lastname, birthday, gender, height, weight, bcrypt.hashSync(pwd, 10)]);

                // mysql async insertion
                /*mysql_db.getConnection(function(err, conn) {
                    conn.query("INSERT INTO test_rows (email, firstName, lastName, birthday, gender, height, weight, pwd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [email, firstname, lastname, birthday, gender, height, weight, bcrypt.hashSync(pwd, 10)], function (err, rows) {
                            conn.release();
                            finalTime = new Date();
                        });
                })*/
            };

            this.findByEmail = function(email, callback) {
                mysql_db.query("SELECT * FROM test_rows WHERE email = ?", [email], callback)
            }
        }

        insert_nb = 1000;
        dateInsert = new Date();
        mysql_test = new MysqlTest();
        for (i = 1; i <= insert_nb; i++) {
            mysql_test.insert(i + '@a.a', 'mateo', 'castella', '07/07/01', 'homme', 175, 60, 'blablabla')
        }
        dateInsert = new Date() - dateInsert;

        dateSelect = new Date();
        for (i = 1; i <= insert_nb; i++) {
            mysql_test.findByEmail(i + "@a.a", function (err, rows) {
                console.log(rows)
            })
        }
        dateSelect = new Date() - dateSelect;
        res.send({insertResponseTimeTotal: dateInsert, insertResponseTimeAverage: dateInsert/insert_nb, selectResponseTimeTotal: dateSelect, selectResponseTimeAverage: dateSelect/insert_nb})

    } else if (req.body.action === "run_mongodb_test") {


        mongodb_db.connect(async (err) => {

            if (err) {
                console.log("ERROR : " + err)
                res.send({error: err})
            }

            const db = mongodb_db.getDB();

            db.collection('test_rows').drop()
                .catch((error) => {})
            db.createCollection('test_rows')

            insert_nb = 1000
            dateInsert = new Date();
            for (i = 1; i <= insert_nb; i++) {
                db.collection('test_rows').insertOne({'id': i + '@a.a', 'firstname': 'mateo', 'lastname': 'castella', 'birthday': '07/07/01', 'gender': 'homme', 'height': 175, 'weight': 60, 'pwd': bcrypt.hashSync('blablabla', 10)})
            }
            dateInsert = new Date() - dateInsert;

            dateSelect = new Date();
            for (i = 1; i <= insert_nb; i++) {
                console.log(db.collection('test_rows').find({'email': i + '@a.a'}))
            }
            dateSelect = new Date() - dateSelect;
            res.send({insertResponseTimeTotal: dateInsert, insertResponseTimeAverage: dateInsert/insert_nb, selectResponseTimeTotal: dateSelect, selectResponseTimeAverage: dateSelect/insert_nb})

        })

    } else if (req.body.action === 'run_redis_test') {

        insert_nb = 1000
        dateInsert = new Date();
        for (i = 1; i <= insert_nb; i++) {
            redis_db.hset([i + '@a.a', 'test_rows', 'mateo', 'castella', '07/07/01', 'homme', 175, 60, 'blablabla'])
        }
        dateInsert = new Date() - dateInsert;

        dateSelect = new Date();
        redis_db.hkeys('test_rows', function (err, replies) {

            replies.forEach(function (reply, i) {
                console.log(reply);
            });

        });
        dateSelect = new Date() - dateSelect;
        res.send({insertResponseTimeTotal: dateInsert, insertResponseTimeAverage: dateInsert/insert_nb, selectResponseTimeTotal: dateSelect, selectResponseTimeAverage: dateSelect/insert_nb})

    } else {
        res.send({error: "Error : invalid action requested."})
    }

});

module.exports = router