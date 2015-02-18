var drivetrain = require("../drivetrain");
var vehicleId = "";

drivetrain.configure({
//    baseUrl: "https://portal.vn.teslamotors.com",
    baseUrl: "https://private-93316-timdorr.apiary-mock.com",
    acceptCookies: true
});

drivetrain.run([
    drivetrain.get("/login"),

    drivetrain.post("/login").withFormBody({
        "user_session[email]": "andy@andyhawkes.com",
        "user_session[password]": "iforgot"
    }).validateStatus(302).validateBodyContains("Welcome"),

    drivetrain.wait(3000),

    drivetrain.get("/vehicles").inspect(function (context, headers, body) {
        var json = JSON.parse(body);

        vehicleId = json[0].vehicle_id;
    }).then(function() {
        drivetrain.get("/vehicles/" + vehicleId + "/command/honk_horn").validateBodyAsJson(function (body) {
            var honked = body.result;

            console.log("horn honked? " + honked);

            return honked;
        }).run();
    })
]);
