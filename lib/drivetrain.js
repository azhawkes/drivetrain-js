var cookieJar = null;

var context = {
    getTime: function () {
        return new Date().getTime();
    },
    getVariable: function (name) {
        return context.variables[name];
    },
    setVariable: function (name, value) {
        context.variables[name] = value;
    },
    config: {
        resultHandler: function (result) {
            console.log(JSON.stringify(result));
        }
    },
    variables: {
    }
};

function configure(config) {
    for (var name in config) {
        if (config.hasOwnProperty(name)) {
            context.config[name] = config[name];
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
        steps[i].run(context, finished);
    }
}

module.exports = {
    context: context,
    configure: configure,
    run: run,
    runParallel: runParallel
};
