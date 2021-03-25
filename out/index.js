"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const auth = require("authorize");
var http = require('http');
var fs = require('fs');
var login = http.createServer(function (req, res) {
    fs.readFile('dummylogin.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
}).listen(800);
login.post('/add', function (req, res) {
    auth.signin(email, password);
});
//# sourceMappingURL=index.js.map