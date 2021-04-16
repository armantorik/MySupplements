      window.addEventListener("DOMContentLoaded", () => {

        document.getElementById("login").addEventListener("submit", (event) => {
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
          });

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
      