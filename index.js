var drivetrain = require("./lib/drivetrain");
var http = require("./lib/http");
var wait = require("./lib/wait");

module.exports = {
    configure: drivetrain.configure,

    run: drivetrain.run,

    runParallel: drivetrain.runParallel,

    get: function (url) {
        return http.get(drivetrain.configuration, url);
    },

    post: function (url) {
        return http.post(drivetrain.configuration, url);
    },

    wait: function (ms) {
        return wait.wait(drivetrain.configuration, ms);
    }
};
