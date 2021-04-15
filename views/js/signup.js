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
});

$("#btn-login").click(function()
{
window.alert("hello");
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


$(document).on('click', '#btn-signup', function() {
 
 var email = $("#email").val();
 var password = $("#password").val();
 var cpassword = $("#confirmPassword").val();

 if(email != "" && password != "" && cpassword != "")
 { 
     if(password == cpassword)
     {
        var result = firebase.auth().createUserWithEmailAndPassword(email, password);
        window.location.href = "/html/loginpage.html";
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



firebase.auth().onAuthStateChanged(function(user)
{
    window.alert("Hey");
    if(user)
    {
        window.location.href = "/html/loginpage.html";
        window.alert(firebase.auth().currentUser);
    }
});
        

