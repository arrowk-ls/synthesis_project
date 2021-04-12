const express = require('express');
const path = require("path");

// routes requirements
var indexRouter = require('./routes/index');

// app instantiation
var app = express();

// view engine setup
app.set('views', path.join(__dirname + '/../client'));
app.set('view engine', 'jade')

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname + '/../client')));

// routes
app.use('/', indexRouter);

const http = require('http').createServer(app);
http.listen(3000);
console.log('Server is listening on http://localhost:3000');
