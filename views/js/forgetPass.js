$("#btn-resetPassword").click(function ()
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
