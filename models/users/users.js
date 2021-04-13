// Users Module:
// All the functions related to users are implemented here


const {admin,db,firebase} = require('../../utils/admin');

exports.createAccount = async function createAccount(email, fname, lname, address, phone, gender, bio){ 
            
    const data = {
        "fname":fname, 
        "lname":lname, 
        "address":address, 
        "phone":phone, 
        "gender":gender,
        "bio":bio
      };
      var add2DB = await db.collection('users').doc(email).set(data);
      return add2DB;
};