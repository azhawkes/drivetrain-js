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
        drivetrain.assertContains(response.body, "I'm Feeling Lucky");
        drivetrain.assert(response.body.length > 2000);
    }),

    drivetrain.wait(3000),

    drivetrain.get('https://www.google.com/search?q=lolcats').withHeaders({
        "Referer": "https://www.google.com"
    }).inspect(function (response) {
        drivetrain.assertMatches(response.body, /Cheezburger/i);
    })
], function () {
    console.log("Done!");
});
