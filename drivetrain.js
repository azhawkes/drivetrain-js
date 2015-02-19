var drivetrain = require("./lib/drivetrain");
var http = require("./lib/http");
var wait = require("./lib/wait");

module.exports = {
    configure: drivetrain.configure,

    run: drivetrain.run,

    runParallel: drivetrain.runParallel,

    context: drivetrain.context,

    get: function (url) {
        return http.get(drivetrain.context, url);
    },

    post: function (url) {
        return http.post(drivetrain.context, url);
    },

    put: function (url) {
        return http.put(drivetrain.context, url);
    },

    delete: function (url) {
        return http.delete(drivetrain.context, url);
    },

    options: function (url) {
        return http.options(drivetrain.context, url);
    },

    trace: function (url) {
        return http.trace(drivetrain.context, url);
    },

    method: function (method, url) {
        return http.method(drivetrain.context, method, url);
    },

    wait: function (ms) {
        return wait.wait(drivetrain.context, ms);
    }
};
