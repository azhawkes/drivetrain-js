//
// This example shows how to configure Drivetrain with a custom error handler
// and result handler. These are optional. Without them, Drivetrain will throw
// an error for any assertion failures, and to log all results to stdout as
// JSON.
//

var drivetrain = require("../index");

drivetrain.configure({

    // Here's how to define a custom error handler.
    // This one simply logs them and adds them to the result's errors array.
    // We could just as well write it to a database or something, or if
    // it's fatal, throw it again so it will stop script execution.
    errorHandler: function (command, result, err) {
        console.log("Oop, looks like we got a non-fatal error: " + err);

        result.errors.push(err);
    },

    // Here's how to define a custom result handler.
    // We're just pretty-printing them as JSON, but could just as well use
    // a different format, pipe them to another stream, write them to a
    // database, etc.
    resultHandler: function (command, result) {
        console.log(JSON.stringify(result, null, '\t'));
    }

});

drivetrain.run([
    drivetrain.get('https://www.google.com').inspect(function (response) {
        drivetrain.assert(response.statusCode == 205);
    })
]);
