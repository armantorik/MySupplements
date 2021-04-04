// Main Script

// Global Port
process.env.PORT = "3000";


// All the imports

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false});

const {firebase, admin, db } = require("./utils/admin");
const firebaseConfig = require("./utils/config");
firebase.initializeApp(firebaseConfig);


const http = require('http');
const fs = require('fs');
const logger = require('morgan');
const Cookies = require('cookies');
const csrf = require('csurf');
const cookieParser = require("cookie-parser");
var path = require('path');
const csrfMiddleware = csrf({cookie: true});
const products = require("./products");

// Script

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

//app.use(logger());

app.use(express.static('views'));

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
      res.redirect("/loginpage.html");
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
      products.retrieveAll;
      res.render("home.html");
    })
    .catch((error) => {
      res.redirect("/login");
      res.send("Error: " + error);
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
})