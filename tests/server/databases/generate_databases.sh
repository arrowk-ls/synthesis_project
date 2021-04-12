cd ./server/databases || return

# mysql
cd ./mysql || return
sudo mysql -e "DROP DATABASE IF EXISTS db_test;"
sudo mysql -e "CREATE DATABASE db_test;"
sudo mysql -u root db_test < database_scheme.sql && echo "MySQL database generated"

echo "=============================="

# sqlite
cd ../sqlite || return
rm -rf sqlite_test.db
sqlite3 sqlite_test.db < database_scheme.sql && chmod 777 -R . && echo "SQLite database generated"

echo "=============================="
