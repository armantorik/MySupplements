// Products Module:
// getProduct function returns the array consisting all of the products

const {firebase, admin, db } = require("../../utils/admin");

exports.getProducts = async function getProducts(pid){
    
        productsJson = {};
        productsArr = []; 

        if(typeof pid == "undefined"){
            let products = db.collection('Products');
            const snapshot = await products.get();
            snapshot.forEach(doc => {
                productsArr.push(doc.data());
                });
            productsJson.arr = productsArr;
        } else {
            let products = await db.collection('Products').doc(pid).get();
            productsJson.product = products.data();
            
            }

            return productsJson;

        };