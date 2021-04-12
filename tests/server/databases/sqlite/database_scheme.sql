DROP TABLE IF EXISTS test_rows;

CREATE TABLE test_rows
(
    email VARCHAR(50) CONSTRAINT pk_email PRIMARY KEY,
    firstName VARCHAR2(30),
    lastName  VARCHAR2(30),
    birthday date,
    gender VARCHAR(50),
    height double CONSTRAINT ck_height CHECK (height > 0),
    weight double CONSTRAINT ck_weight CHECK (weight > 0),
    pwd VARCHAR(100) not null
);