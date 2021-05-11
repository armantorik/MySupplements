$("#btn-update").click(function () {
    function makeGetRequest(path) {
        return new Promise(function (resolve, reject) {
            
            axios.put(path).then(
                (response) => {
                    var result = response.data;
                    console.log('Processing Request');
                    resolve(result);

                },
                (error) => {
                    reject(error);
                }
            );


        });
    };


        var phone = $("#phone").val();
        var address = $("#address").val();
        var bio = $("#bio").val();
        var fName = $("#firstName").val();
        var lName = $("#lastName").val();
        var country = $("#country").val();
        var gender = $("#gender").val();

        const url = window.location.search;
        var email;
        firebase.auth().onAuthStateChanged(async(user) => {
            if (user) {
              email = firebase.auth().currentUser.email;
            }
            else {
                email = new URLSearchParams(url).get('email');
            }


            if (fName != "" && lName != "" && phone != "" && country != "" && gender != "" && bio != "" && address != "") {
                address = country + ", " + address;
                var data = {
                    "email": email,
                    "phone": phone,
                    "address": address,
                    "bio": bio,
                    "firstName": fName,
                    "lastName": lName,
                    "gender": gender,
                };
                var param = new URLSearchParams(data).toString();

                var result = await makeGetRequest("/api/createAccount?" + param);
                console.log(result);
            }
    
        })
        //window.location.href = "/html/home.html";

});
