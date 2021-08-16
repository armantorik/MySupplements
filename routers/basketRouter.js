const user = require("../controllers/users/users");
var debug = require('debug')('bskRouter');
const {admin} = require("../utils/admin");

const express = require("express");
const router = express.Router();
var path = require('path');

// Users can see the products in their basket
router.all('/', function (req, res) {
    const sessionCookie = req.cookies.session || "";
    console.log(sessionCookie)
    admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
      var email = decodedClaims["email"];
      debug(email)
      user.getProductsFromBasket(email).then(function (jsonProducts) {
  
        res.jsonp({
          jsonProducts
        })
      }
      )
    }
  
    ).catch((error) => {
      debug(error)
      res.status(401).redirect('../html/signin.html');
    });
  
  
  });


    // Users can add products with their pid to the basket
    router.get("/product", function (req, res) {
      var pid = req.param("pid");
      if (!pid){
        res.status(400).send("Bad Request, please make sure you set the pid correct")
        return
      }
      const sessionCookie = req.cookies.session || "";
      admin.auth().verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
        var email = decodedClaims["email"];
        debug(pid)
        
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
    
      }).catch((error) => {
        debug(error)
        res.sendFile(path.join(__dirname + "/../views/html/signin.html"));
      }
      )
    });

  
  // Users can decrement the product from their basket
  router.patch("/product/decrement", function (req, res) {
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
  router.delete("/product", function (req, res) {
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, true).then(async (decodedClaims) => {
      var email = decodedClaims["email"];
      var pid = req.param("pid");
      user.removeFromBasket(email, pid).then(()=>{
        res.send("Success")
      }).catch(error => {
        res.send(error)
      })
      
    }).catch(error => {
      res.send(error)
    })
  })
  

  
  module.exports = router;
