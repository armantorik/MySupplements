const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ecommerce-ca57f-default-rtdb.europe-west1.firebasedatabase.app"});



const db = admin.firestore();const firebase = require("firebase");
module.exports = { admin, db,firebase};