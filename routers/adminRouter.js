const admins = require("../controllers/users/admins");
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

  // After they got their token, they can login to their system
  router.get("/login", authenticateToken, async function (req, res) {
    
    if (req.param("pm") == "true") { // True means pm, false means sm
      res.sendFile(path.join(__dirname + "/../privateViews/pm.html"));
    }
    else if (req.param("sm") == "true") {
      res.sendFile(path.join(__dirname + "/../privateViews/sm.html"));
    }
    else {
      res.sendStatus(400);
    }
  })
  
  
  /*********************************** Admin Page *************************************/
  
  
  
  // Pm can add products
  router.get("/getAddProductPage", authenticateToken, async function (req, res) {
    res.sendFile(path.join(__dirname + "/../privateViews/addProduct.html"))
  });


  router.post('/addProduct', authenticateToken, upload.single('image'), (req, res) => {
  
    debug(req.body)
    if (!req.file) {
      res.status(400).send("Error: No files found")
    } else {
      admins.addProduct(req.file, req.body)
      res.status(200).send("Product Added!")
    }
  });
  
// Pm can remove products
  router.post('/rmProduct', authenticateToken, (req, res) => {
  
    var pid = req.param("pid")

    if (pid=null) {
      res.status(400).send("Error: No files found")
    } else {
      admins.removeProduct(pid);
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
  
 // Pm can see orderRefund page
 router.get("/OrderRefundPage", authenticateToken, async function (req, res) {
  res.sendFile(path.join(__dirname + "/../privateViews/orderRefund.html"))
});


    // Pm can see the orders to be cancelled
    router.get("/getOrdersToBeCancelled", authenticateToken, async function (req, res) {
  
      admins.getOrdersToBeCancelled().then(orders => {
        res.send(orders)
      }).catch(error =>{
        res.send(error)
      })
      
    });


      // Pm can see deliveryPage
  router.get("/deliveryPage", authenticateToken, async function (req, res) {
    res.sendFile(path.join(__dirname + "/../privateViews/deliveryPage.html"))
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
  router.get("/getOrders", authenticateToken, async function (req, res) {
      admins.getOrders().then((orders)=> {
        res.send(orders);
      }).catch((error) => {res.send(error)});
  
  });
  
  

  // Pm see unverified comments
  router.get("/getCommentsPage", authenticateToken, async function (req, res) {
    res.sendFile(path.join(__dirname + "/../privateViews/pendingComments.html"));
});

  router.get("/pendingComments", authenticateToken, async function (req, res) {
    admins.pendingComments().then((comments)=> {
      res.send(comments);
    }).catch((error) => {res.send(error)});

});

// Pm verifies comments
router.get("/verifyComments", authenticateToken, async function (req, res) {
  
  var pid = req.param("pid")
  var cid = req.param("cid")

  admins.verify(pid, cid).then(()=> {
    res.send("Success");
  }).catch((error) => {res.send(error)});

});


  // Sales Managers can make temporary discounts
  router.post("/discount", authenticateToken, async function (req, res) {

    admins.changePrice(req.body.pid, req.body.discountRate, req.body.expiresAt).then((returned)=> {
      res.send("Returned: " + returned);
    }).catch((error) => {res.send(error)});
  
  });
  

  router.get("/InvoicePage", authenticateToken, async function (req, res) {
    res.sendFile(path.join(__dirname + "/../privateViews/invoices.html"))
  })

  // Sales Managers can see revenues with range

  router.get("/getRevenues", authenticateToken, async function (req, res) {
  

    admins.getRevenues().then(revenues => {
      var start = new Date(req.query.start);
      var end = new Date(req.query.end);
      
      if (req.query.start == null && req.query.end == null){
        let newArr = revenues.arr.map(e =>{
            var date = e.date.toLocaleDateString();
            e.date = date;
            return e;
        } )
        debug(newArr)
        
          revenues.arr = newArr.reduce((filter, current) => {
          var dk = filter.find(item => item.date === current.date);
          if (!dk) {
            return filter.concat([current]);
          } else {
            return filter;
          }
        }, []);

        res.send(revenues);

      }
        else if (start != null && end != null) {
          debug(revenues)
          debug(start)
          var data = {arr:revenues.arr.filter(ele => {
            var  startObj = new Date(ele.date);
            return startObj >= start && startObj <= end 
          })};
          res.send(data)
        }
    }).catch((error) => {res.send(error)});
  
  });
  
  router.get("/productPage", authenticateToken, async function (req, res) {
    res.sendFile(path.join(__dirname + "/../privateViews/products.html"))
  })


  
  
  module.exports = router;
  