var drivetrain = require("./lib/drivetrain");
var http = require("./lib/http");
var wait = require("./lib/wait");

module.exports = {
    configure: drivetrain.configure,

    run: drivetrain.run,

    runParallel: drivetrain.runParallel,

    context: drivetrain.context,

    get: function (url) {
        return http.get(drivetrain, url);
    },

    post: function (url) {
        return http.post(drivetrain, url);
    },

    put: function (url) {
        return http.put(drivetrain, url);
    },

    delete: function (url) {
        return http.delete(drivetrain, url);
    },

    options: function (url) {
        return http.options(drivetrain, url);
    },

    trace: function (url) {
        return http.trace(drivetrain, url);
    },

    method: function (method, url) {
        return http.method(drivetrain, method, url);
    },

    wait: function (ms) {
        return wait.wait(drivetrain, ms);
    },

    assert: drivetrain.assert,

    assertEqual: drivetrain.assertEqual,

    setVariable: drivetrain.setVariable
};
