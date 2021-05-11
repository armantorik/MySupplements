// Main Script


// Global Port
process.env.PORT = "3000";
var debug = require('debug')('server')

// All the imports

const express = require('express');
const app = express();

const { firebase, admin, db } = require("./utils/admin");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const csrfMiddleware = csrf({ cookie: true });
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
        const options = { maxAge: expiresIn, httpOnly: false, secure: true };
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
    .then((decodedClaims) => {
      //user.serveContentForUser("/home", req, res, decodedClaims);

      res.sendFile(path.join(__dirname + "/views/html/home.html"));
    })
    .catch((error) => {
      res.redirect('/html/signin.html');
    });


});

app.get("/products", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/html/product.html"));
});




/************************** API START *********************************/


app.get('/api/products', function (req, res) {

  products.getProducts().then(function (doc) {

    var jsonObject = {};
    var key = 'detail';
    jsonObject[key] = [];

    for (var i = 0; i < doc.arr.length; i++) {
      var details = {
        "id": i,
        "name": doc.arr[i].name,
        "quantity": doc.arr[i].quantity,
        "info": doc.arr[i].info,
        "link": doc.arr[i].thumbnailUrl,
        "price": doc.arr[i].price,
        "distributor": doc.arr[i].distributor
      };
      jsonObject[key].push(details);
    };

    res.jsonp({
      jsonObject
    });
  });
});

app.get('/api/products/:pid', function (req, res) {
  var pid = req.params.pid;
  products.getProducts(pid).then(function (doc) {

    var jsonObject = {};
    var key = 'detail';
    jsonObject[key] = [];
    

        var details = {
          "id": pid,
          "quantity": doc.product.quantity,
          "name": doc.product.name,
          "info": doc.product.info,
          "link": doc.product.thumbnailUrl,
          "price": doc.product.price,
          "distributor": doc.product.distributor
        };
        jsonObject[key].push(details);

    res.jsonp({
      jsonObject
    });
  })
});

app.get('/api/basketQuery.json', function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {

    var email = req.param("email");
    user.getProductsFromBasket(email).then(function (jsonProducts) {

      res.jsonp({
        jsonProducts
      })

    }
    )

  }

  ).catch((error) => {
    res.redirect('/html/signin.html');
  });


});


app.get("/api/decrementFromBasket", function (req, res){
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {
    var email = req.param("email");
    var pid = req.param("pid");
    user.decrementFromBasket(email, pid)
  })
})

app.get("/api/removeFromBasket", function (req, res){
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {
    var email = req.param("email");
    var pid = req.param("pid");
    user.removeFromBasket(email, pid)
  })
})

app.put("/api/add2basket", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {
    var email = req.param("email");
    var pid = req.param("pid");
    if (user.add2basket(email, pid))
    {
      res.jsonp({
        ack:true
      })
    }
    else{
      res.jsonp({
        ack:false
      })
    }

  }).catch(()=>
    {
      console.log("no cookie")

    }
  )
});


app.get("/api/order", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {
    var email = req.param("email");
    var cardNo = req.param("cardNo");
    var oid = user.order(email);
    res.jsonp(
      {
        oid:oid,
      }
    )
  })
});

app.get("/api/getOrders", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(() => {
    var email = req.param("email");
    user.retrieveOrders(email, res).then((orders)=>{
    });
    
  })

})

app.put("/api/createAccount", function (req, res) {
  var params = req.query;
  console.log(params)
  user.createAccount(params.email, params.firstName, params.lastName, params.address, params.phone, params.gender, params.bio).then(() => {
    console.log("Account created successfully");
  })
    .catch((error) => {
      res.end("Error: " + error);
    });
});


app.get("/api/getProfile", function (req, res) {
  var params = req.query;

  user.getProfile(params.email).then(() => {
    console.log("Account created successfully");
  })
    .catch((error) => {
      res.end("Error: " + error);
    });
});



app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
});
