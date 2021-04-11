const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://console.firebase.google.com/u/0/project/ecommerce-ca57f/firestore/",
    storageBucket: "ecommerce-ca57f.appspot.com"
});



const db = admin.firestore();
const firebase = require("firebase");
module.exports = { admin, db, firebase};