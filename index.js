

var port = 700;
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/dummylogin.html");
});
app.post('/logingin', urlencodedParser, function (req, res) {
    var response = { email: req.body.email, pass: req.body.pass };
    auth.signIn(response.email, response.pass);
});
if (auth.loggedIN) {
    console.log("Success");
    app.get("/home", function (req, res) {
        res.sendFile(__dirname + "/home.html");
    });
}
else {
    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/dummylogin.html");
    });
}
app.listen(port, function () {
    console.log("Ecommerce app listening at http://localhost:" + port);
});
//# sourceMappingURL=index.js.map