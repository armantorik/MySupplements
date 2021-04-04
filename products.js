const {firebase, admin, db } = require("./utils/admin");
const parse = require('node-html-parser').parse;
const fs = require('fs');
const path = require("path");

fs.readFile(path.resolve(__dirname, 'views/home.html'), (err,html)=>{
   if(err){
      throw err;
   }

   const root = parse(html);

   const body = root.querySelector('body');

 });
module.exports = function(){
    
    this.products = db.collection('Products');
    this.retrieveAll() = function(){
        

        const snapshot = this.products.get();
        if (snapshot.empty) {
        console.log('No matching documents.');
        return;
        }  

        snapshot.forEach(doc => {
        
        console.log(doc.id, '=>', doc.data());
        body.appendChild('<p id = ', doc.id, '>',doc.data(),'</p>');
        console.log(root.toString()); // This you can write back to file!
        });


    }
}