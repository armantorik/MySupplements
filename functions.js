var firebaseConfig = {
    apiKey: "AIzaSyBXC-zH_VU7hjRYuRoA-DoizGN8ndGIJ8M",
    authDomain: "ecommerce-ca57f.firebaseapp.com",
    databaseURL: "https://ecommerce-ca57f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ecommerce-ca57f",
    storageBucket: "ecommerce-ca57f.appspot.com",
    messagingSenderId: "450193218046",
    appId: "1:450193218046:web:ed740c91c94096998288af",
    measurementId: "G-SV0VSC22KY"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  firebase.auth.Auth.Persistence.NONE;

  $("#btn-login").click(function()
  {

     var email = $("#email").val();
     var password = $("#password").val();

     if(email != "" && password != "")
     {
        var result = firebase.auth().signInWithEmailAndPassword(email, password);

        result.catch(function(error)
        {
            var errorCode = error.code;
            var errorMessage = error.message;
            

            window.alert("Message: " + errorMessage);
        });
     }
     else
     {
         window.alert("Form Incomplete! Please fill out all fields!");
     }
  });

  $("#btn-signup").click(function()
  {
     console.log("success");
     var email = $("#email").val();
     var password = $("#password").val();
     var cpassword = $("#confirmPassword").val();

     if(email != "" && password != "" && cpassword != "")
     { 
         if(password == cpassword)
         {
        var result = firebase.auth().createUserWithEmailAndPassword(email, password);

        result.catch(function(error)
        {
            var errorCode = error.code;
            var errorMessage = error.message;
            

            window.alert("Message: " + errorMessage);
        });
        }
        else
        {
            window.alert("Passwords do not match!");
        }
    }
     else
     {
         window.alert("Form Incomplete! Please fill out all fields!");
     }
  });