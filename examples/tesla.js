var drivetrain = require("../drivetrain");
var teslaUsername = "rich.guy@teslamotors.com";
var teslaPassword = "iamrich";

drivetrain.configure({
//    baseUrl: "https://portal.vn.teslamotors.com",
    baseUrl: "https://private-93316-timdorr.apiary-mock.com",
    acceptCookies: true
});

var vehicleId = ""; // we'll parse this from a response

drivetrain.run([
    drivetrain.get("/login"),

    drivetrain.post("/login").withFormBody({
        "user_session[email]": teslaUsername,
        "user_session[password]": teslaPassword
    }).validateStatus(302).validateBodyContains("Welcome"),

    drivetrain.wait(3000),

    drivetrain.get("/vehicles").inspect(function (context, headers, body) {
        vehicleId = JSON.parse(body)[0].vehicle_id; // extract our vehicle_id
    }).then(function() {
        drivetrain.get("/vehicles/" + vehicleId + "/command/honk_horn").validateBodyAsJson(function (body) {
            console.log("horn honked? " + body.result);

            return body.result;
        }).run();
    })
]);
