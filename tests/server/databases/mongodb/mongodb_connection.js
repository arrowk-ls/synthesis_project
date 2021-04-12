const mongoClient = require('mongodb').MongoClient;

var _db;

const connect = (callback) => {
    mongoClient.connect('mongodb://localhost:27017', {useUnifiedTopology: true}, function (err, db) {
        if (err) {
            console.error('Connection error with mongodb : ' + err.message);
            return callback(err)
        } else {
            _db = db.db('db_test')
            console.log('Connected to the mongodb database.');
            return callback(err)
        }
    })
}

const getDB = () => _db;

module.exports = { connect, getDB };