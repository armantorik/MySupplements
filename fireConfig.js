// Firebase App (the core Firebase SDK) is always required and must be listed first
var firebase = require("firebase/app");
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
require("firebase/analytics");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXC-zH_VU7hjRYuRoA-DoizGN8ndGIJ8M",
  authDomain: "ecommerce-ca57f.firebaseapp.com",
  databaseURL: "https://ecommerce-ca57f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ecommerce-ca57f",
  storageBucket: "ecommerce-ca57f.appspot.com",
  messagingSenderId: "450193218046",
  appId: "1:450193218046:web:ed740c91c94096998288af",
  measurementId: "G-SV0VSC22KY"
};


!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app()