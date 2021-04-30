<<<<<<< HEAD
<<<<<<< Updated upstream
$("#btn-resetPassword").click(function()
=======
$("#btn-resetPassword").click(function ()
>>>>>>> Stashed changes
=======
$("#btn-resetPassword").click(function ()
>>>>>>> bfcebcb6282863657c8b5c72ede9b113240e1375
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
<<<<<<< HEAD
<<<<<<< Updated upstream
});
=======
});
>>>>>>> Stashed changes
=======
});
>>>>>>> bfcebcb6282863657c8b5c72ede9b113240e1375
