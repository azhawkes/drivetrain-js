var Request = require("request");
var Streams = require("./streams");
var Qs = require('qs');

//
// An HTTP command.
//
function http(drivetrain, method, url) {
    var self = {
        drivetrain: drivetrain,
        method: method,
        url: url,
        query: {},
        resources: [],
        validators: [],
        inspectors: [],
        formBody: null,
        rawBody: null,
        jsonBody: null,
        headers: {},
        withResources: function (resources) {
            self.resources = self.resources.concat(resources);

            return self;
        },
        withQueryString: function (query) {
            if (typeof(query) == 'string') {
                self.query = Qs.parse(query);
            } else {
                self.query = query;
            }

            return self;
        },
        withFormBody: function (body) {
            self.formBody = body;

            return self;
        },
        withJsonBody: function (body) {
            self.jsonBody = body;

            return self;
        },
        withBody: function (body) {
            self.rawBody = body;

            return self;
        },
        withHeaders: function (headers) {
            for (var name in headers) {
                if (headers.hasOwnProperty(name)) {
                    self.headers[name] = headers[name];
                }
            }

            return self;
        },
        withContentType: function (contentType) {
            return self.withHeaders({"Content-Type": contentType});
        },
        inspect: function (f) {
            self.inspectors.push(f);

            return self;
        },
        run: function (callback) {
            if (typeof(self.next) === 'object') {
                runCommand(self, function () {
                    runCommand(self.next, callback);
                });
            } else if (typeof(self.next) === 'function') {
                runCommand(self, function () {
                    self.next(callback);
                });
            } else {
                runCommand(self, callback);
            }
        },
        then: function (next) {
            self.next = next;

            return self;
        }
    };

    return self;
}

//
// Runs an HTTP command with context.
//
function runCommand(command, callback) {
    var result = {
        type: "http",
        method: command.method,
        url: command.url,
        startTime: command.drivetrain.getTime(),
        errors: [],
        warnings: []
    };

    var countingStream = new Streams.CountingStream(command);
    var aggregatingStream = new Streams.AggregatingStream();
    var url = command.url;

    url = replaceVariablesInString(url, command.drivetrain);

    if (url.indexOf('http://') != 0 && url.indexOf('https://') != 0) {
        url = command.drivetrain.configuration.baseUrl + url;
    }

    if (command.drivetrain.configuration.acceptCookies && !command.drivetrain.configuration.cookieJar) {
        command.drivetrain.configuration.cookieJar = Request.jar();
    }

    var request = Request({
        method: command.method,
        url: url,
        qs: command.query,
        headers: command.headers,
        body: command.rawBody || command.jsonBody || null,
        form: command.formBody || null,
        json: command.jsonBody ? true : false,
        jar: command.drivetrain.configuration.cookieJar
    }).on('response', function (response) {
        result.requestHeaderSize = response.req._header.length;
        result.requestBodySize = response.request.body ? response.request.body.length : 0;
        result.responseHeaderSize = calculateHeaderByteSize(response.headers);
        result.responseBodySize = response.headers["content-length"];
        result.statusCode = response.statusCode;
    }).on('end', function () {
        var rawResponse = this.response;

        downloadResources(command, function() {
            result.endTime = command.drivetrain.getTime();
            result.responseTrailerSize = calculateHeaderByteSize(rawResponse.trailers);
            result.validationResults = [];

            var response = {
                statusCode: result.statusCode,
                headers: rawResponse.headers,
                body: aggregatingStream.data
            };

            inspect(command, result, response);

            command.drivetrain.configuration.resultHandler(command, result);

            if (typeof(callback) === 'function') {
                callback();
            }
        });
    });

    request.pipe(countingStream);

    if (aggregatingStream) {
        request.pipe(aggregatingStream);
    }
}

//
// Downloads a command's page resources in parallel, if there are any.
//
function downloadResources(command, callback) {
    var resources = command.resources.slice(0);
    var done = false;
    var resourcesStartTime = command.drivetrain.getTime();

    var downloadNextResource = function () {
        var resource = resources.shift();

        if (resource) {
            resource = replaceVariablesInString(resource, command.drivetrain);

            if (resource.indexOf('http://') != 0 && resource.indexOf('https://') != 0) {
                resource = getProtocolHostAndPort(command.url) + resource;
            }

            Request.get(resource, { }, function(error, response, body) {
                var resourceTime = command.drivetrain.getTime() - resourcesStartTime;
                console.log("***** finished resource " + resource + " after " + resourceTime);

                downloadNextResource();
            });
        } else if (!done && typeof(callback) === 'function') {
            done = true;

            callback();
        }
    };

    for (var i = 0; i < command.drivetrain.configuration.parallelResourceDownloads; i++) {
        downloadNextResource();
    }
}

//
// Inspects a response, passing any errors to the error handler if there is one, otherwise bubbling them up.
//
function inspect(command, result, response) {
    for (var i = 0; i < command.inspectors.length; i++) {
        var inspector = command.inspectors[i];

        if (typeof(command.drivetrain.configuration.errorHandler) === 'function') {
            try {
                inspector(response);
            } catch (err) {
                command.drivetrain.configuration.errorHandler(command, result, err);
            }
        } else {
            inspector(response);
        }
    }
}

//
// Calculates the expected number of bytes for a set of headers.
//
function calculateHeaderByteSize(headers) {
    var bytes = 0;

    for (var header in headers) {
        if (header && headers.hasOwnProperty(header)) {
            bytes += header.length + headers[header].length + 4;
        }
    }

    return bytes;
}

//
// Returns just the protocol, host, and optional port for a URL.
function getProtocolHostAndPort(url) {
    return /https?:\/\/.*?\//.exec(url);
}

//
// Creates an aggregating stream if necessary for this command.
//
function createAggregatingStreamIfNecessary(command) {
    if (command.inspectors.length > 0) {
        return new Streams.AggregatingStream();
    } else {
        for (var i = 0; i < command.validators.length; i++) {
            if (command.validators[i].type == "body" || command.validators[i].type == "assertion") {
                return new Streams.AggregatingStream();
            }
        }
    }

    return null;
}

//
// Replaces {{variables}} with their values from the context
//
function replaceVariablesInString(string, context) {
    return string.replace(/\{\{(\w+?)\}\}/g, function (substr) {
        var name = substr.replace('{{', '').replace('}}', '');

        return context.getVariable(name);
    });
}

//
// Exports
//
module.exports = {
    get: function (context, url) {
        return http(context, "GET", url);
    },
    post: function (context, url) {
        return http(context, "POST", url);
    },
    put: function (context, url) {
        return http(context, "PUT", url);
    },
    delete: function (context, url) {
        return http(context, "DELETE", url);
    },
    options: function (context, url) {
        return http(context, "OPTIONS", url);
    },
    trace: function (context, url) {
        return http(context, "TRACE", url);
    },
    method: function (context, method, url) {
        return http(context, method, url);
    }
};
