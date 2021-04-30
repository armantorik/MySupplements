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

    async function main() {

        var phone = $("#phone").val();
        var address = $("#address").val();
        var bio = $("#bio").val();
        var fName = $("#firstName").val();
        var lName = $("#lastName").val();
        var country = $("#country").val();
        var gender = $("#gender").val();
        const url = window.location.search;

        const email = new URLSearchParams(url).get('email');

        if (fName != "" && lName != "" && phone != "" && country != "" && gender != "" && bio != "" && address != "") {

            var data =
            {
                "email": email,
                "phone": phone,
                "address": address,
                "bio": bio,
                "firstName": fName,
                "lastName": lName,
                "country": country,
                "gender": gender,
            };
            var param = new URLSearchParams(data).toString();
            console.log(param);
            var result = await makeGetRequest("/api/createAccount?" + param);
            console.log(result.result);
        }

    };
    main();
    window.location.href = "/html/signin.html";

});
