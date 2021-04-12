DROP TABLE IF EXISTS test_rows;

CREATE TABLE test_rows
(
    email VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(30),
    lastName  VARCHAR(30),
    birthday DATE,
    gender VARCHAR(50),
    height DOUBLE CHECK(height > 0),
    weight DOUBLE CHECK(weight > 0),
    pwd VARCHAR(100) not null
);