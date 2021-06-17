
function delete_cookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

function logout(){
    window.localStorage.clear();
    delete_cookie("token")
    window.location.href = '../html/signin.html';
}


$("#signout").click(function () {


  firebase.auth().onAuthStateChanged(async user => {
    if (user) {
    const token = await user.getIdToken()
    
    fetch("/sessionLogout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token
      },
      body: firebase.auth().currentUser.email
    });
    firebase.auth().signOut().then(() => {
        window.localStorage.clear();
        delete_cookie("session")
        window.location.href = '../html/signin.html';
    }).catch((error) => {
      window.alert("Error: " + error);
    });
  } else {
    window.localStorage.clear();
    window.sessionStorage.clear();

    window.location.href = '../html/signin.html';
  }
})
  })