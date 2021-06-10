const user = require("../controllers/users/users");
var debug = require('debug')('ordRouter');

const express = require("express");
const router = express.Router();

const {admin} = require("../utils/admin");

router.post("/post", function (req, res) {

    const sessionCookie = req.cookies.session || "";
    //debug(sessionCookie)
    admin.auth().verifySessionCookie(sessionCookie, true).then(async (decodedClaims) => {
      var email = decodedClaims["email"];
      var cardNo = req.body["cardNo"];
      var oid = await user.order(email);
      debug(oid)
      res.jsonp({oid})
    }).catch(error => {
      debug("error")
      res.send(error)
    })
  });
  
  // Users can see their previous orders
  router.get("/get", function (req, res) {
  
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
      var email = decodedClaims["email"];
      user.retrieveOrders(email, res);
  
    })
  
  })
  
  module.exports = router;
