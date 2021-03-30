// Main Script

// Global Port
process.env.PORT = "3000";


// All the imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false});

const firebase = require('firebase');

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

const http = require('http');
const fs = require('fs');
const logger = require('morgan');
const Cookies = require('cookies');
const csrf = require('csurf');
const cookieParser = require("cookie-parser");

const csrfMiddleware = csrf({cookie: true});


// Script

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecommerce-ca57f-default-rtdb.europe-west1.firebasedatabase.app"
});

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

//app.use(logger());

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.get("/login", function (req, res) {
  res.render("dummylogin.html");
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

app.get("/", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.redirect("/home");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/home", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("home.html");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});


app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
})