// Main Script


// Global Port
process.env.PORT = "3000";
var debug = require('debug')('server')

// All the imports

const express = require('express');
const app = express();

var path = require('path');
const http = require('http');
const fs = require('fs');

const Cookies = require('cookies');
const cookieParser = require("cookie-parser");
const multer = require('multer')
//custom modules
const products = require("./models/products/products");
const user = require("./models/users/users");
const admins = require("./models/users/admins/admins");
const { firebase, admin, db } = require("./utils/admin");


const firebaseConfig = require("./utils/config");
firebase.initializeApp(firebaseConfig);

// Script
app.use(cookieParser());

app.use(express.static('views'));
app.use(express.static('assets'));
app.use(express.urlencoded({extended:true}))
app.use(express.json())


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

app.post('/sessionLogout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    res.clearCookie('session');
    admin
      .auth()
      .verifySessionCookie(sessionCookie)
      .then((decodedClaims) => {
        return admin.auth().revokeRefreshTokens(decodedClaims.sub);
      })
      .then(() => {
        res.redirect('/html/signin.html');
      })
      .catch((error) => {
        res.redirect('/html/signin.html');
      });
  });
  

app.all("/home", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then((decodedClaims) => {
      console.log(decodedClaims)
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

app.all('/api/basketQuery.json', function (req, res) {
  const sessionCookie = req.cookies.session || "";
  debug(sessionCookie)
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {

    var email = decodedClaims["email"];
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
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    user.decrementFromBasket(email, pid)
    res.jsonp({
      status:true
    })
  })
})

app.get("/api/removeFromBasket", function (req, res){
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    user.removeFromBasket(email, pid)
  })
})

app.put("/api/add2basket", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    if (user.add2basket(email, pid))
    {
      res.jsonp({
        status:true
      })
    }
    else{
      res.jsonp({
        status:false
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
  admin.auth().verifySessionCookie(sessionCookie, true).then(async (decodedClaims) => {
    var email = decodedClaims["email"];
    var cardNo = req.param("cardNo");
    var oid = await user.order(email);
    res.jsonp(
      {
        oid:oid
      }
    )
  })
});

app.get("/api/getOrders", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    user.retrieveOrders(email, res).then((orders)=>{
    });

  })

})

app.put("/api/createAccount", function (req, res) {
  var params = req.query;
  user.createAccount(params.email, params.firstName, params.lastName, params.address, params.phone, params.gender, params.bio).then(() => {
    console.log("Account created successfully");
  })
    .catch((error) => {
      res.end("Error: " + error);
    });
});


app.get("/api/getProfile", function (req, res) {
  var params = req.query;

  user.getProfile(params.email).then((profile) => {
    res.jsonp({
      profile:profile
    })
  }).catch((error) => {
      res.end("Error: " + error);
    });
});

app.post("/adminLogin", async function(req, res) {
  var username = req.body["username"];
  var pass = req.body["pass"];

  var adminSwitch = await admins.login(username, pass); 

  if (adminSwitch == true){ // True means pm, false means sm
    res.sendFile(path.join(__dirname + "/models/users/admins/static/pm.html"))
  }
  else if (adminSwitch == false){
    res.sendFile(path.join(__dirname + "/models/users/admins/static/sm.html"))
  }
})




/*********************************** Admin Page *************************************/

// To temporarily store files
const upload = multer({
  storage: multer.memoryStorage()
})


app.post('/admin/addProduct', upload.single('image'), (req, res) => {

  if(!req.file) {
    res.status(400).send("Error: No files found")
  } else{
      admins.addProduct(req.file, req.body)
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
});
