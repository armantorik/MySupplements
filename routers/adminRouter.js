const admins = require("../controllers/users/admins/admins");
var debug = require('debug')('admRouter');
var path = require('path');

const express = require("express");
const router = express.Router();

const {authenticateToken, upload, generateAccessToken} = require("../utils/admin");

// Admins have to use their username and password to get their session token
router.post('/getToken', async (req, res) => {
  
    var username = req.body["username"];
    var pass = req.body["pass"];


    var adminSwitch = await admins.login(username, pass);
  
    if (adminSwitch == true){ // it means pm
      const token = generateAccessToken({ username: username });
      res.jsonp({
        token, 
        sm:false,
        pm:true
        }
      );
    }
    else if (adminSwitch == false){ // it means sm
      const token = generateAccessToken({ username: username });
      res.jsonp({
          token, 
          sm:true,
          pm:false
          }
        );
    }
    else if (adminSwitch == null){
      res.status(401).send("Forbidden");
    }
    
  });
  console.log(authenticateToken);
  // After they got their token, they can login to their system
  router.post("/login", authenticateToken, async function (req, res) {
    debug(req.user)
    if (req.body["pm"]) { // True means pm, false means sm
      res.sendFile(path.join(__dirname + "/../controllers/users/admins/static/pm.html"))
    }
    else if (req.body["sm"]) {
      res.sendFile(path.join(__dirname + "/../controllers/users/admins/static/sm.html"))
    }
    else {
      res.sendStatus(400);
    }
  })
  
  
  /*********************************** Admin Page *************************************/
  
  
  
  // Admin can add products
  router.get("/getAddProductPage", authenticateToken, async function (req, res) {
  
      res.sendFile(path.join(__dirname + "/../controllers/users/admins/static/addProduct.html"))
  
  });
  router.post('/addProduct', authenticateToken, upload.single('image'), (req, res) => {
  
    if (!req.file) {
      res.status(400).send("Error: No files found")
    } else {
      admins.addProduct(req.file, req.body)
      res.status(200).send("Product Added!")
    }
  });
  
  
  // Pm Review Invoices
  router.post("/getInvoices", authenticateToken, async function (req, res) {
  
    var invoiceArr = await admins.getInvoices().catch((error) => {
      res.status(400).send("Error" + error);
    });
  
    res.jsonp(invoiceArr);
  
  });
  
  
  // Pm can change status of deliveries
  router.post("/changeDeliveryStatus", authenticateToken, async function (req, res) {
  
    var status = await admins.changeStatus(req.body.oid, req.body.newStatus);
  
    if (status === true)
      res.send("Success");
    else if (status == false)
      res.send("New status should be one of: 'Delivered', 'Processing' or 'In-Transit' ");
    else 
      res.send("Wrong OID")
  });

  
// PMs can cancel orders
router.post("/cancelOrder", authenticateToken, function (req, res){

    var status = admins.cancelOrder(req.body["oid"])
    if (status)
      res.status(200).send("Success!");
    else if (status == false)
      res.status(401);
    else 
      res.send("You can not do that! \n It may be already delivered or cancelled.")
      
  
  });
  // Pm Review Invoices List 
  router.post("/getOrders", authenticateToken, async function (req, res) {
  
      admins.getOrders().then((orders)=> {
        res.send(orders);
      }).catch((error) => {res.send(error)});
  
  });
  
  
  // Sales Managers can make temporary discounts
  router.post("/discount", authenticateToken, async function (req, res) {
  
    admins.changePrice(req.body.pid, req.body.newPrice, req.body.expiresAt).then(()=> {
      res.send("Success");
    }).catch((error) => {res.send(error)});
  
  });
  
  
  module.exports = router;
  