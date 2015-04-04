var assert = require('assert');

var variables = {
};

var configuration = {
    parallelResourceDownloads: 3,
    resultHandler: function (command, result) {
        console.log(JSON.stringify(result));
    },
//    errorHandler: function (command, result, err) {
//        console.log("got error: " + err);
//
//        result.errors.push(err);
//    },
    cookieJar: null
};

function assert(condition, message) {
    if (!condition) {
        assert.fail(condition, true, message, '!=');
    }
}

function assertEqual(a, b, message) {
    if (a != b) {
        assert.fail(b, a, message, '!=');
    }
}

function assertContains(haystack, needle, message) {
    if (haystack.indexOf(needle) == -1) {
        assert.fail(haystack, needle, message, 'does not contain')
    }
}

function assertMatches(haystack, regex, message) {
    if (!regex.test(haystack)) {
        assert.fail(haystack, regex, message, 'does not match pattern')
    }
}

function configure(config) {
    for (var name in config) {
        if (config.hasOwnProperty(name)) {
            configuration[name] = config[name];
        }
    }
}

function run(steps, callback) {
    if (steps.length > 0) {
        var i = -1;

        var runNextStep = function () {
            i++;

            if (i >= steps.length) {
                if (typeof(callback) === 'function') {
                    callback();
                }
            } else {
                steps[i].run(runNextStep);
            }
        };

        runNextStep(runNextStep);
    }
}

function runParallel(steps, then) {
    var completed = 0;

    var finished = function () {
        completed++;

        if (typeof(then) === 'function' && completed == steps.length) {
            then();
        }
    };

    for (var i = 0; i < steps.length; i++) {
        steps[i].run(finished);
    }
}

module.exports = {
    configure: configure,
    configuration: configuration,
    run: run,
    runParallel: runParallel,
    assert: assert,
    assertEqual: assertEqual,
    assertContains: assertContains,
    assertMatches: assertMatches,
    getTime: function () {
        return new Date().getTime();
    },
    getVariable: function (name) {
        return variables[name];
    },
    setVariable: function (name, value) {
        variables[name] = value;
    }
};
