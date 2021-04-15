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

  firebase.auth.Auth.Persistence.LOCAL;

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

  $("#btn-logout").click(function()
  {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
  });

  $("#btn-resetPassword").click(function()
  {
    var auth = firebase.auth();
    var email = $("#email").val();

    if(email != "")
    {
        auth.sendPasswordResetEmail(email).then(function()
        {
            window.alert("Email has been sent to your account, Please check and verify!");
        })
        .catch(function(error)
        {
            var errorCode = error.code;
            var errorMessage = error.message;
            
            window.alert("Message: " + errorMessage);
        });
        
    }
    else
    {
        window.alert("Please write your email first!");
    }
  });

  
  $("#btn-update").click(function()
  {
    var phone = $("#phone").val();
    var address = $("#address").val();
    var bio = $("#bio").val();
    var fName = $("#firstName").val();
    var lName = $("#lastName").val();
    var country = $("#country").val();
    var gender = $("#gender").val();

    var rootRef = firebase.database().ref().child("Users");
    var userID = firebase.auth().currentUser.uid;
    var usersRef = rootRef.child(userID);

    if(fName != "" && lName != "" && phone != "" && country != "" && gender != "" && bio != "" && address != "" )
    {
        var userData = 
        {
            "phone": phone,
            "address": address,
            "bio": bio,
            "firstName": fName,
            "lastName": lName,
            "country": country,
            "gender": gender,
        };

        usersRef.set(userData, function(error)
        {
            if(error)
            {
                var errorCode = error.code;
                var errorMessage = error.message;
                
                window.alert("Message: " + errorMessage);
            }
            else
            {
                window.location.href = "MainPage.html";
            }

        });

    }
    else
    {
        window.alert("Form Incomplete! Please fill out all fields!");
    }
  });
  