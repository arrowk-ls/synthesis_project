var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {

    if (req.body.action === "run_sqlite_test") {

    } else {
        res.send({error: "Error : invalid action requested."})
    }

});

module.exports = router