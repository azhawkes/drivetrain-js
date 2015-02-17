var drivetrain = require("../drivetrain");

drivetrain.configure({
    // settings
});

drivetrain.run([
    drivetrain.get('http://www.loadsterperformance.com').withResources([
        '/main.css',
        '/main.js',
        '/favicon.ico'
    ]).validateBodyContains("Loadster").validateHeaderContains("Content-Type", "html").validateBodyAsString(function (body) {
        return body.length > 200 && body.indexOf("Booyah") >= 0;
    }).inspect(function (context, headers, body) {
    }),

    drivetrain.wait(3000),

    drivetrain.post('http://www.loadsterperformance.com/login').withFormBody({
        j_username: "andy@andyhawkes.com",
        j_password: "asdf12345"
    })
], function () {
    console.log("Done!");
});
