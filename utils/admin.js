const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const multer = require('multer')
const jwt = require('jsonwebtoken');
var path = require('path');

admin.initializeApp({credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://console.firebase.google.com/u/0/project/ecommerce-ca57f/firestore/",
    storageBucket: "ecommerce-ca57f.appspot.com"
});

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[0]
    if (token == null){
      token = req.param('token');
      if (token == null){
        
        token = req.cookies.token;
        if (token == null){
          return res.sendStatus(401)
        }
      }
    }  
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      
  
      if (err) {console.log(err); return res.sendFile(path.join(__dirname + "/../views/html/signin.html"));}
  
      req.user = user
  
      next()
    })
  }
  
// To temporarily store files
const upload = multer({
    storage: multer.memoryStorage()
  })

  
const db = admin.firestore();
const firebase = require("firebase");
module.exports = { admin, db, firebase, generateAccessToken, authenticateToken, upload};