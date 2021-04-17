window.addEventListener("DOMContentLoaded", () => {

    $("#btn-signup").click(async function () {

        var email = $("#email").val();
        var password = $("#password").val();
        var cpassword = $("#confirmPassword").val();

        if (email != "" && password != "" && cpassword != "") {
            if (password == cpassword) {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                window.location.href = "/html/accountSettings.html?email=" + email;
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

