window.addEventListener("DOMContentLoaded", () => {

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
        window.location.href = "/html/accountSettings.html?email="+email;
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
});

