window.addEventListener("DOMContentLoaded", () => {

    $("#btn-signup").click(async function () {

        var email = $("#email").val();
        var password = $("#password").val();
        var cpassword = $("#confirmPassword").val();

        if (email != "" && password != "" && cpassword != "") {
            if (password == cpassword) {
                if (email.includes('@')){
                    await firebase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
                        alert(error)
                        window.location.href = "/html/signup.html";
                    }).then(()=>{
                        window.location.href = "/html/accountSettings.html?email=" + email;

                    });
                }
                else{
                    alert("Please type your email address!")
                }
              
            }
            else {
                window.alert("Passwords do not match!");
            }
        }
        else {
            window.alert("Form Incomplete! Please fill out all fields!");
        }
    });
});

