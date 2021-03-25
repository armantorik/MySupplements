exports.signin = function (email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
    })
        .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
};
exports.signup = function (name, email, password, phone) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        // ...
    })
        .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
    });
};
exports.signout = function () {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
};
//# sourceMappingURL=authorize.js.map