const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false});

const auth = require('./authorize');

var http = require('http');
var fs = require('fs');

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/dummylogin.html");
}).listen(800);


app.post('/add', urlencodedParser, function(req,res){
  var response = { email : req.body.email, pass : req.body.pass};
  console.log(response);
  res.end(JSON.stringify(response));
  auth.signIn(response.email, response.pass)
});