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
const jwt = require('jsonwebtoken');
const Cookies = require('cookies');
const cookieParser = require("cookie-parser");
const multer = require('multer')
const dotenv = require('dotenv');
dotenv.config();
process.env.TOKEN_SECRET;

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

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
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// Users are directed to their home or signin page
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

// Users can login
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

// Users can log out
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


// Web users are provided the home page
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

// Users can see all of the products in database
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


// Users can get the product information with its pid
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


/************ Users Can search and filter ***************/ 
app.get('/api/search', function (req, res) {

  var query = req.param("query");
  var pros = user.search(query).then(()=>{
    res.jsonp(pros);
  }).catch((error) => {
    res.status(400).send("Error: " + error);
  });

});

app.get('/api/getCats',function (req, res) {
  
  products.getProducts().then((pros) => {
    var catArr = [];
    pros.arr.forEach((product) => {
      catArr.push(product.category)
    })
    var categories = [...new Set(catArr)];

    categories = categories.filter(String);

    res.jsonp({
      categories:categories
    })
  })

});



app.get('/api/getByCat', async function (req, res) {
  
  var cat = req.param("cat");

  var proJson = await user.getByCat(cat);

  res.jsonp(proJson);

});

/********************************************************/ 

// Users can see the products in their basket
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

// Users can decrement the product from their basket
app.get("/api/decrementFromBasket", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    user.decrementFromBasket(email, pid)
    res.jsonp({
      status: true
    })
  })
})


// Users can remove all of the product using pid from their basket
app.get("/api/removeFromBasket", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    user.removeFromBasket(email, pid)
  })
})

// Users can add products with their pid to the basket
app.put("/api/add2basket", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    var pid = req.param("pid");
    if (user.add2basket(email, pid)) {
      res.jsonp({
        status: true
      })
    }
    else {
      res.jsonp({
        status: false
      })
    }

  }).catch(() => {
    console.log("no cookie")
  }
  )
});

// Users can place order the products in their basket
app.get("/api/order", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then(async (decodedClaims) => {
    var email = decodedClaims["email"];
    var cardNo = req.param("cardNo");
    var oid = await user.order(email);
    res.jsonp(
      {
        oid: oid
      }
    )
  })
});

// Users can see their previous orders
app.get("/api/getOrders", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
    var email = decodedClaims["email"];
    user.retrieveOrders(email, res).then((orders) => {
    });

  })

})

// Users can create their account with their information
app.put("/api/createAccount", function (req, res) {
  var params = req.query;
  user.createAccount(params.email, params.firstName, params.lastName, params.address, params.phone, params.gender, params.bio).then(() => {
    console.log("Account created successfully");
  })
    .catch((error) => {
      res.end("Error: " + error);
    });
});

// Users can get their information
app.get("/api/getProfile", function (req, res) {
  var params = req.query;

  user.getProfile(params.email).then((profile) => {
    res.jsonp({
      profile: profile
    })
  }).catch((error) => {
    res.end("Error: " + error);
  });
});

// Admins can login with their special username and password
app.post("/adminLogin", async function (req, res) {
  var username = req.body["username"];
  var pass = req.body["pass"];

  var adminSwitch = await admins.login(username, pass);

  if (adminSwitch == true) { // True means pm, false means sm
    res.sendFile(path.join(__dirname + "/models/users/admins/static/pm.html"))
  }
  else if (adminSwitch == false) {
    res.sendFile(path.join(__dirname + "/models/users/admins/static/sm.html"))
  }
})




/*********************************** Admin Page *************************************/

// To temporarily store files
const upload = multer({
  storage: multer.memoryStorage()
})

// Admin can add products
app.post('/admin/addProduct', upload.single('image'), (req, res) => {

  if (!req.file) {
    res.status(400).send("Error: No files found")
  } else {
    admins.addProduct(req.file, req.body)
    res.status(200).send("Product Added!")
  }
});


// Pm Review Invoices
app.post("/admin/getInvoices", async function (req, res) {

  var invoiceArr = await admins.getInvoices().catch((error) => {
    res.status(400).send("Error" + error);
  });

  res.jsonp(invoiceArr);

});






// Pm Review Delivery List 




app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
});
