// Products Module:
// getProduct function returns the array consisting all of the products

const {firebase, admin, db } = require("./utils/admin");
const parse = require('node-html-parser').parse;
const fs = require('fs');
const path = require("path");

exports.getProducts = async function getProducts(){
            
            products = db.collection('Products');
        
            const snapshot = await products.get();
            
            if (snapshot.empty) {
                console.log('No matching documents.');
                return;
            }  

            docs = []; 
            snapshot.forEach(doc => {
                docs.push(doc.data());
             });

             return docs;

        };