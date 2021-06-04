const user = require("../controllers/users/users");
var debug = require('debug')('usrRouter');
const {admin} = require("../utils/admin");

const express = require("express");
const router = express.Router();


  // Users can get their information
  router.get("/getInfo", function (req, res) {

    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
      user.getProfile(decodedClaims.email).then((profile) => {
        res.jsonp({
          profile: profile
        })
      }).catch((error) => {
        res.jsonp({user:false});
      });
    });
  });


// Users can post comments on products
router.post("/comment/post", function (req, res) {

    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
      var email = decodedClaims["email"];
      var pid = req.body.pid;
      var comment = req.body.comm;

      if (user.postcomment(email, pid, comment)) {
  
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
      console.log("no cookie")
      console.log(error)
    }
    )
  })
  
  // Users can post comments on products
  router.post("/rating/post", function (req, res) {
  
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
      var email = decodedClaims["email"];
      var pid = req.body.pid;
      var rat = req.body.rat;
      if (user.postrating(email, pid, rat)) {
  
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
      console.log("no cookie")
      console.log(error)
    }
    )
  })
  
  // Users can create their account with their information
  router.put("/createAccount", function (req, res) {
    var params = req.query;
    user.createAccount(params.email, params.firstName, params.lastName, params.address, params.phone, params.gender, params.bio).then(() => {
      console.log("Account created successfully");
    })
      .catch((error) => {
        res.end("Error: " + error);
      });
  });
  

  
  
  // Users can request to cancel orders
  router.post("/askForRefund", async function (req, res){
  
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, false).then( async (decodedClaims) => {
      
      var status = await user.askToCancel(decodedClaims.email, req.body["oid"]);
  
      if (status)
        res.status(200).send("Success!");
      else if (status == false)
        res.status(401).send("Forbidden!");
      else 
        res.send("Sorry, you can not do that! \n It may be either already delivered or cancelled.")
    }).catch((error) => {
      console.log(error);
      res.status(401).send("Error: " + error);
    })
  });
  

  module.exports = router;
