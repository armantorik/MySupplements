// Main Script


// Global Port
process.env.PORT = "3000";


// All the imports

const express = require('express');
const app = express();

const {firebase, admin, db } = require("./utils/admin");
const firebaseConfig = require("./utils/config");
firebase.initializeApp(firebaseConfig);

var path = require('path');
const http = require('http');
const fs = require('fs');

const bodyParser = require('body-parser');
const Cookies = require('cookies');
const csrf = require('csurf');
const cookieParser = require("cookie-parser");


const products = require("./models/products/products");
const user = require("./models/users/users");

// Script
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const csrfMiddleware = csrf({cookie: true});
app.use(csrfMiddleware);

app.use(express.static('views'));
app.use(express.static('assets'));


app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.get("/", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.redirect("/home");
    })
    .catch((error) => {
      res.redirect("/html/signin.html");
    });
});


app.post("/logingin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/home", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.redirect("/html/home.html");
    })
    .catch((error) => {
      res.end("Error: " + error);
    });
});


app.get('/api/server-data.json', function(req, res){
  var pid = req.param('pid');

  products.getProducts().then(function(doc){
    
    var jsonObject={};
      var key = 'detail';
      jsonObject[key] = [];
  
    if (pid >= 0)
    {
      if (pid >= doc.length)
      {
        res.send("Wrong pid!")
      }
      else{
        for (var i = 0; i < doc.length; i++){ 
          if (pid == i)
          {
            var details={
              "id":i,
              "name":doc[i].name,
              "info":doc[i].info,
              "link" :doc[i].link,
              "price":doc[i].price
          };
            jsonObject[key].push(details);  
          }
        };
      }
    }
    else
    {
      
      for (var i = 0; i < doc.length; i++){ 
          var details={
              "id":i,
              "name":doc[i].name,
              "info":doc[i].info,
              "link" :doc[i].link,
              "price":doc[i].price
          };
          jsonObject[key].push(details);    
      };
    }
    res.jsonp({
      jsonObject
    });
  })
  
});


app.get("/products", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/html/product.html"));
});


app.get("/accountCreation",function(req, res){
  var params = req.query;
  user.createAccount(params.email, params.firstName, params.lastName, params.address, params.phone, params.gender, params.bio).then(() => {
    console.log("Account created successfully");
  })
  .catch((error) => {
    res.end("Error: " + error);
  });
});


app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
});
