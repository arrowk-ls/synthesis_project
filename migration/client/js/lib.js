$(document).ready(function() {

    /**
     * Run mysql tests
     */
    $('#run_mysql_test').on('click', function() {

        let el = $('#results-mysql');

        el.empty()
        el.append("<br><p class='text-danger'><b>Mysql test is running...</b></p>")

        $.ajax({
            url: '/',
            type: 'post',
            data: 'action=run_mysql_test',
            success: response => {
                if (response.error) {
                    el.append("<span class='text-danger'>" + response.error + "</span>")
                } else {
                    el.append("<span class='text-success'>Total response time : " + response.insertResponseTimeTotal + " ms<br>" +
                        "Average response time per requests : " + response.insertResponseTimeAverage.toFixed(3) + " ms<br><br>" +
                        "Select response time : " + response.selectResponseTimeTotal + " ms<br>" +
                        "Average response time per select : " + response.selectResponseTimeAverage.toFixed(3) + " ms<br></span>")
                }},
            error: error => {
                el.append("<span class='text-danger'>" + JSON.stringify(error) + "</span>")
            }
        })

    })

    /**
     * Run sqlite tests
     */
    $('#run_sqlite_test').on('click', function() {

        let el = $('#results-sqlite');

        el.empty()
        el.append("<br><p class='text-danger'><b>Sqlite test is running...</b></p>")

        $.ajax({
            url: '/',
            type: 'post',
            data: 'action=run_sqlite_test',
            success: response => {
                if (response.error) {
                    el.append("<span class='text-danger'>" + response.error + "</span>")
                } else {
                    el.append("<span class='text-success'>Total response time : " + response.insertResponseTimeTotal + " ms<br>" +
                        "Average response time per requests : " + response.insertResponseTimeAverage.toFixed(3) + " ms<br><br>" +
                        "Select response time : " + response.selectResponseTimeTotal + " ms<br>" +
                        "Average response time per select : " + response.selectResponseTimeAverage.toFixed(3) + " ms<br></span>")
                }},
            error: error => {
                el.append("<span class='text-danger'>" + JSON.stringify(error) + "</span>")
            }
        })

    })

    /**
     * Run local storage tests
     */
    $('#run_local_storage_test').on('click', function() {

        let el = $('#results-local-storage');

        el.empty()
        el.append("<br><p class='text-danger'><b>Local storage test is running...</b></p>")

        const LocalStorageTest = function() {
            this.insert = function (email, table, firstname, lastname, birthday, gender, height, weight, pwd) {
                localStorage.setItem(email, JSON.stringify({table: table, firstname: firstname, lastname: lastname, birthday: birthday, gender: gender, height: height, weight: weight, pwd: pwd}))
            }

            this.findByEmail = function(table, email, callback) {
                let item = localStorage.getItem(email);
                callback(email, item)
            }
        }

        // test with 1000 insertions
        insert_nb = 1000;
        date = new Date();
        localStorage_test = new LocalStorageTest();
        for (i = 1; i <= insert_nb; i++) {
            localStorage_test.insert(i + '@a.a', 'test_rows', 'mateo', 'castella', '07/07/01', 'homme', 175, 60, 'blablabla')
        }
        insertResponseTimeTotal = new Date() - date;
        insertResponseTimeAverage = insertResponseTimeTotal/insert_nb;
        date = new Date();
        for (i = 1; i <= 100; i++) {
            localStorage_test.findByEmail('test_rows', i + '@a.a', function(key, value) {
                console.log(key + ", " + value)
            })
        }
        selectResponseTimeTotal = new Date() - date;
        selectResponseTimeAverage = selectResponseTimeTotal/100;
        el.append("<p>Test with 1000 data :</p>")
        el.append("<span class='text-success'>Total response time : " + insertResponseTimeTotal + " ms<br>" +
            "Average response time per requests : " + insertResponseTimeAverage.toFixed(3) + " ms<br><br>" +
            "Select response time : " + selectResponseTimeTotal + " ms<br>" +
            "Average response time per select : " + selectResponseTimeAverage.toFixed(3) + " ms<br><br></span>")

        // test insertion until storage is full
        is_full = false;
        insertion = 999;
        date = new Date();
        while (!is_full) {
            try {
                localStorage_test.insert(insertion + '@a.a', 'mateo', 'castella', '07/07/01', 'homme', 175, 60, 'blablabla')
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    is_full = true
                    insertResponseTimeTotal = new Date() - date + insertResponseTimeTotal;
                    insertResponseTimeAverage = insertResponseTimeTotal/insertion;
                    el.append("<p>Test until local storage is full :</p>")
                    el.append("<span class='text-success'>Total response time : " + insertResponseTimeTotal + " ms<br>" +
                        "Average response time per insert : " + insertResponseTimeAverage.toFixed(3) + " ms<br></span>")
                    el.append("<span class='text-danger'>Local storage is full after " + insertion + " insertion.</span>")
                }
            }
            insertion++
        }

    })

    /**
     * Run mongodb tests
     */
    $('#run_mongodb_test').on('click', function() {

        let el = $('#results-mongodb');

        el.empty()
        el.append("<br><p class='text-danger'><b>MongoDB test is running...</b></p>")

        $.ajax({
            url: '/',
            type: 'post',
            data: 'action=run_mongodb_test',
            success: response => {
                if (response.error) {
                    el.append("<span class='text-danger'>" + response.error + "</span>")
                } else {
                    el.append("<span class='text-success'>Total response time : " + response.insertResponseTimeTotal + " ms<br>" +
                        "Average response time per requests : " + response.insertResponseTimeAverage.toFixed(3) + " ms<br><br>" +
                        "Select response time : " + response.selectResponseTimeTotal + " ms<br>" +
                        "Average response time per select : " + response.selectResponseTimeAverage.toFixed(3) + " ms<br></span>")
                }},
            error: error => {
                el.append("<span class='text-danger'>" + JSON.stringify(error) + "</span>")
            }
        })

    })

    /**
     * Run redis tests
     */
    $('#run_redis_test').on('click', function() {

        let el = $('#results-redis');

        el.empty()
        el.append("<br><p class='text-danger'><b>Redis test is running...</b></p>")

        $.ajax({
            url: '/',
            type: 'post',
            data: 'action=run_redis_test',
            success: response => {
                if (response.error) {
                    el.append("<span class='text-danger'>" + response.error + "</span>")
                } else {
                    el.append("<span class='text-success'>Insert response time : " + response.insertResponseTimeTotal + " ms<br>" +
                        "Average response time per insert : " + response.insertResponseTimeAverage.toFixed(3) + " ms<br><br>" +
                        "Select response time : " + response.selectResponseTimeTotal + " ms<br>" +
                        "Average response time per select : " + response.selectResponseTimeAverage.toFixed(3) + " ms<br></span>")
                }},
            error: error => {
                el.append("<span class='text-danger'>" + JSON.stringify(error) + "</span>")
            }
        })

    })

})