async function getProducts2js(user) {
    if (user) {
        console.log(firebase.auth().currentUser.email);
        var queryurl = "/api/basketQuery.json?&email=" + firebase.auth().currentUser.email;


        $.get(queryurl).then(response => {
           console.log(response)
        })
    }
    else {
        console.log("no user");
    }
}
firebase.auth().onAuthStateChanged(user => getProducts2js(user));



