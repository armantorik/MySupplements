      function googleSignin(){
        var provider = new firebase.auth.GoogleAuthProvider();
    
        firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = result.credential;
      
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          window.location.href = "/home";

        }).catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert("Error " + errorCode + ": " + errorMessage);
        });
      }
      

      function signinDefault(event){
        event.preventDefault();
        const login = event.target.email.value;
        const password = event.target.password.value;
        firebase.auth().signInWithEmailAndPassword(login, password)
          .then(({ user }) => {
            return user.getIdToken().then((idToken) => {
              return fetch("/logingin", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken }),
              });
            });
          })
          // .then(() => {
          //   return firebase.auth().signOut();
          // })
          .then(() => {
            window.location.href = "/html/home.html";
          });
        return false;

        }

      window.addEventListener("DOMContentLoaded", () => {

        document.getElementById("login").addEventListener("submit", (event) => signinDefault(event));

        $("#directSubmit").click(function() {

          firebase.auth().signInAnonymously()
            .then(() => {
              return user.getIdToken().then((idToken) => {
                return fetch("/logingin", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                  },
                  body: JSON.stringify({ idToken }),
                });
              });
            }).then(()=> {
              var result = await makeGetRequest("/api/createAccount?");
              console.log(result);
              window.location.href = "/home";
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
            });
          })

      });
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          console.log("hello user");
        }
        else {
          console.log("no user")
        }
      })
      