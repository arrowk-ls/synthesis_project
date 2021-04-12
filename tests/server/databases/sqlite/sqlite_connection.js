const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, "./sqlite_test.db"), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Connection error with sqlite : ' + err.message);
    } else {
        console.log('Connected to the sqlite database.');
    }
});

module.exports = db;