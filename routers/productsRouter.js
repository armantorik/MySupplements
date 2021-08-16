const products = require("../controllers/products/products");
const user = require("../controllers/users/users");
var debug = require('debug')('proRouter');

const express = require("express");
const router = express.Router();

// Users can see all of the products in database
router.get('/', function (req, res) {

    products.getProducts().then(function (doc) {
  
      var jsonObject = {};
      var key = 'detail';
      jsonObject[key] = [];
      for (var i = 0; i < doc.arr.length; i++) {
        var details = {
          "id": doc.arr[i].id,
          "name": doc.arr[i].name,
          "quantity": doc.arr[i].quantity,
          "info": doc.arr[i].info,
          "link": doc.arr[i].thumbnailUrl,
          "date": doc.arr[i].publishedDate,
          "price": doc.arr[i].price,
          "distributor": doc.arr[i].distributor,
          "discounted": doc.arr[i].discounted
        };
        jsonObject[key].push(details);
      };
  
      res.jsonp({
        jsonObject
      });
    });
  });
  
  
  // Users can get the product information with its pid
  router.get('/get/:pid', function (req, res) {
    var pid = req.params.pid;
    console.log(pid)
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
  router.get('/search/:query', async function (req, res) {
  
    var query = req.params.query;
    console.log("query")

    var pros = await user.search(query).catch((error) => {
      res.status(400).send("Error: " + error);
    });
      res.jsonp(pros);
      
  });
  
  router.get('/cats',function (req, res) {
    
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
  
  
  
  router.get('/cats/products', async function (req, res) {
    
    var cat = req.param("cat");
  
    var proJson = await user.getByCat(cat);
  
    res.jsonp(proJson);
  
  });
  

  module.exports = router;