//
// This example uses Drivetrain to log in to your Tesla account, parse a list of your vehicles, and then
// programmatically HONK THE HORN of your Tesla Model S.
//
// We're pointing at a mock API, but if you're lucky enough to own a Model S, try it with your real Tesla
// account!
//

var drivetrain = require("../drivetrain");
var teslaUsername = "rich.guy@teslamotors.com";
var teslaPassword = "iamrich";

drivetrain.configure({
//    baseUrl: "https://portal.vn.teslamotors.com",
    baseUrl: "https://private-93316-timdorr.apiary-mock.com",
    acceptCookies: true
});

drivetrain.run([
    drivetrain.get("/login"),

    drivetrain.post("/login").withFormBody({
        "user_session[email]": teslaUsername,
        "user_session[password]": teslaPassword
    }).validateStatus(302).validateBodyContains("Welcome"),

    drivetrain.wait(3000),

    drivetrain.get("/vehicles").inspect(function (context, headers, body) {
        context.setVariable("vehicleId", JSON.parse(body)[0].id); // save our vehicle id for later use
    }),

    drivetrain.get("/vehicles/{{vehicleId}}/command/honk_horn").validateBodyAsJson(function (body) {
        if (body.result) {
            console.log("your horn just honked!");
        }

        return body.result;
    })
]);
