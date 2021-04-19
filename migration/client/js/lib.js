$(document).ready(function() {

    /**
     * Solution 1 : convert code
     */
    $('#convert').on('click', function() {

        $('#convert').removeClass('btn-dark').addClass('btn-success').text('Converting...');

        let oracle = $('#codeToConvert').val();
        let mysql = '';
        let error = null;

        oracle = oracle.replaceAll('/*', '\n/*');
        let lines = oracle.split('\n');

        for (i = 0; i < lines.length; i++) {

            let l = lines[i];

            if (!l.startsWith('--') && !l.startsWith('/*')) {

                let line = ''

                while (!l.match(/(.*)\);(.*)/)) {
                    line += l + ' '
                    i++
                    if (i >= lines.length) {
                        error = 'Syntax error : missing ";"'
                    } else {
                        l = lines[i];
                    }
                }

                line = line.replace(/ +/g, ' ').trim();
                line = line + l.trim() + '\n';

                if (line.match(/CREATE TABLE (.*) \((.*)\);/i)) {
                    let table_name = line.replace(/CREATE TABLE (.*) \((.*)\);/, '$1').replaceAll('"', '');
                    let columns = line.replace(/CREATE TABLE (.*) \((.*)\);/, '$2').split(" ");
                    let converted_columns = '';
                    let index = 0;

                    for (j = 0; j < columns.length; j++) {
                        let c = columns[j];
                        if (index === 0) {
                            converted_columns += c.replaceAll('"', '') + ' ';
                        } else if (index === 1) {
                            if (c.match(/VARCHAR2/)) {
                                converted_columns += c.replace(/VARCHAR2/i, 'VARCHAR');
                            } else if (c.match(/NUMBER/)) {
                                converted_columns += c.replace(/NUMBER/i, 'NUMERIC');
                            } else if (c.match(/DATE/)) {
                                converted_columns += c.replace(/DATE/i, 'DATETIME');
                            }
                        } else {
                            converted_columns += ' ' + c;
                        }

                        if (c.endsWith(',') && j !== columns.length - 1) {
                            converted_columns += ' '
                            index = 0
                        } else {
                            index++
                        }
                    }

                    line = line.replace(/CREATE TABLE (.*) \((.*)\);/i, "CREATE TABLE " + table_name + " (" + converted_columns.replace('\n', '') + ");");
                    line = line.replace('\n', '');
                }

                mysql += line;

            } else {

                if (l.startsWith('/*')) {

                    while (!l.endsWith('*/')) {
                        mysql += l + '\n';
                        i++
                        l = lines[i];
                    }

                    mysql += l + '\n';

                } else {

                    mysql += l + '\n';

                }

            }
        }

        mysql = mysql.replaceAll('\n/*', '/*')
        if (error != null) {
            $('#convertError').text(error)
        } else {
            $('#convertedCode').text(mysql)
        }

        $('#convert').removeClass('btn-success').addClass('btn-dark').text('Convert');

    })

    /**
     * Solution 2 : migrate rows
     */
    $('#migrate').on('click', function () {

        let o_hostname = $('#oracle_hostname').val(),
            o_user = $('#oracle_user').val(),
            o_password = $('#oracle_password').val(),
            o_port = $('#oracle_port').val(),
            o_database = $('#oracle_database').val(),
            m_hostname = $('#mysql_hostname').val(),
            m_user = $('#mysql_user').val(),
            m_password = $('#mysql_password').val(),
            m_port = $('#mysql_port').val(),
            m_database = $('#mysql_database').val();

        $.ajax({
            url: '/',
            type: 'post',
            data: 'action=migrate&oracle_hostname=' + o_hostname + '&oracle_user=' + o_user + '&oracle_password=' + o_password + '&oracle_port=' + o_port + '&oracle_database=' + o_database +
                '&mysql_hostname=' + m_hostname + '&mysql_user=' + m_user + '&mysql_password=' + m_password + '&mysql_port=' + m_port + '&mysql_database=' + m_database,
            success: response => {
                if (response.success) {
                } else if (response.error) {
                    $('#migrateError').text(response.error)
                }
            },
            error: error => {
                $('#migrateError').text(error)
            }
        })

    })

})