/**************************** Main *********************************/

// Global Port
process.env.PORT = "3000";

// All the imports

var debug = require('debug')('server')

const express = require('express');
const app = express();

var path = require('path');
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');

dotenv.config();
process.env.TOKEN_SECRET;



// Routers
const productRouter = require("./routers/productsRouter");
const basketRouter = require("./routers/basketRouter");
const orderRouter = require("./routers/orderRouter");
const userRouter = require("./routers/userRouter");
const adminRouter = require("./routers/adminRouter");


const admins = require("./controllers/users/admins/admins");
const {firebase, admin, db} = require("./utils/admin");


const firebaseConfig = require("./utils/config");
firebase.initializeApp(firebaseConfig);



app.use(cookieParser());
app.use(express.static('views'));
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())




// Web Frontend spesific routes

// Users are directed to their home or signin page
app.get("/", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.redirect("/home");
    })
    .catch((error) => {
      console.log(error)
      res.redirect("/html/signin.html");
    });
});

// Users can login
app.post("/logingin", (req, res) => {
  const idToken = req.body.idToken.toString();
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  debug(idToken)
  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: false, secure: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({status: "success", session: sessionCookie}));
      },
      (error) => {
        console.log(error)
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

// Users can log out
app.post('/sessionLogout', (req, res) => {
  const sessionCookie = req.cookies.session || '';
  debug(sessionCookie)
  res.clearCookie('session', {domain: 'localhost', path: '/'});
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
      debug(error)
      res.redirect('/html/signin.html');
    });
});


// Web users are provided the home page
app.all("/home", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.sendFile(path.join(__dirname + "/views/html/home.html"));
    })
    .catch((error) => {
      console.log(error)
      res.redirect('/html/signin.html');
    });

});


/************************** API Routers *********************************/
// These routes connect the endpoints to the controllers


// Routes related to products (get, get with pid, etc...)
app.use('/products', productRouter);

// Routes related to basket (get basket, add to basket, etc...)
app.use('/basket', basketRouter);

// Routes related to user (get user info, create user, etc...)
app.use('/user', userRouter);

// Routes related to order (get prev orders, create order, etc...)
app.use('/order', orderRouter);

// Routes related to admin (admin login, change delivery status, etc...)
app.use('/admin', adminRouter);



app.listen(process.env.PORT, () => {
  console.log(`Ecommerce app listening at http://localhost:${process.env.PORT}`)
});


// Automatically remove expired discounts
setInterval(admins.removeExpired, 10000); //time is in ms
