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

    put: function (url) {
        return http.put(drivetrain.configuration, url);
    },

    delete: function (url) {
        return http.delete(drivetrain.configuration, url);
    },

    options: function (url) {
        return http.options(drivetrain.configuration, url);
    },

    trace: function (url) {
        return http.trace(drivetrain.configuration, url);
    },

    method: function (method, url) {
        return http.method(drivetrain.configuration, method, url);
    },

    wait: function (ms) {
        return wait.wait(drivetrain.configuration, ms);
    }
};
