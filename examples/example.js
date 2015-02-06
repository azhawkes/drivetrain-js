var drivetrain = require("../index");

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
    }).scan(function (context, headers, body) {
    }),

    drivetrain.wait(3000),

    drivetrain.post('http://www.loadsterperformance.com/login').withBody({
        j_username: "andy@andyhawkes.com",
        j_password: "asdf12345"
    }).withHeaders({
        "Content-Type": "application/x-www-form-urlencoded"
    })
], function () {
    console.log("Done!");
});
