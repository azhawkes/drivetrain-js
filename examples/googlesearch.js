//
// Simple example that shows how to run a Google search.
//

var drivetrain = require("../index");

drivetrain.run([
    drivetrain.get('https://www.google.com/').withResources([
        '/images/srpr/logo11w.png',
        '/favicon.ico'
    ]).inspect(function (response) {
        drivetrain.assertEqual(response.statusCode, 200);
        drivetrain.assertEqual(response.headers["content-type"], 'text/html; charset=ISO-8859-1');
        drivetrain.assert(response.body.indexOf("I'm Feeling Lucky") >= 0);
        drivetrain.assert(response.body.length > 2000);
    }),

    drivetrain.wait(3000),

    drivetrain.get('https://www.google.com/search?q=lolcats').withHeaders({
        "Referer": "https://www.google.com"
    }).inspect(function (response) {
        drivetrain.assert(response.body.indexOf("Cheezburger") >= 0);
    })
], function () {
    console.log("Done!");
});
