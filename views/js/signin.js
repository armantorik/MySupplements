      window.addEventListener("DOMContentLoaded", () => {

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

        firebase.initializeApp(firebaseConfig);

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

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
              .then(() => {
                return firebase.auth().signOut();
              })
              .then(() => {
                window.location.assign("/home");
              });
            return false;
          });


    document.getElementById("directForm").addEventListener("directSubmit", (event) => {
      event.preventDefault();
      firebase.auth().signInAnonymously()
        .then(() => {
          window.location.href = "/home";
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
      })

      });
      