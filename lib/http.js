var Request = require("request");
var Streams = require("./streams");
var Qs = require('qs');

//
// An HTTP command.
//
function http(context, method, url) {
    var self = {
        context: context,
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
            self.resources.push(resources);

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
        validateStatus: function (statusCode) {
            self.validators.push({
                type: "response",
                validate: function (response) {
                    return response.statusCode == statusCode;
                }
            });

            return self;
        },
        validateHeaders: function (f) {
            self.validators.push({
                type: "header",
                validate: f
            });

            return self;
        },
        validateHeaderEquals: function (header, value) {
            self.validateHeaders(function (headers) {
                return headers[header.toLowerCase()] == value;
            });

            return self;
        },
        validateHeaderContains: function (header, value) {
            self.validateHeaders(function (headers) {
                return headers[header.toLowerCase()].indexOf(value) >= 0;
            });

            return self;
        },
        validateBodyContains: function (str) {
            self.validateBodyAsString(function (body) {
                return body.indexOf(str) >= 0;
            });

            return self;
        },
        validateBodyAsString: function (f) {
            self.validators.push({
                type: "body",
                validate: f
            });

            return self;
        },
        validateBodyAsJson: function (f) {
            self.validators.push({
                type: "body",
                validate: function (body) {
                    var json = {};

                    try {
                        json = JSON.parse(body);
                    } catch (err) {
                        return false;
                    }

                    return f(json);
                }
            });

            return self;
        },
        inspect: function (f) {
            self.inspectors.push({
                inspect: f
            });

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
        startTime: command.context.getTime(),
        errors: [],
        warnings: []
    };

    var countingStream = new Streams.CountingStream(command);
    var aggregatingStream = createAggregatingStreamIfNecessary(command);
    var url = command.url;

    if (url.indexOf('http://') != 0 && url.indexOf('https://') != 0) {
        url = command.context.config.baseUrl + url;
    }

    if (command.context.config.acceptCookies && !command.context.config.cookieJar) {
        command.context.config.cookieJar = Request.jar();
    }

    var request = Request({
        method: command.method,
        url: url,
        qs: command.query,
        headers: command.headers,
        body: command.rawBody || command.jsonBody || null,
        form: command.formBody || null,
        json: command.jsonBody ? true : false,
        jar: command.context.config.cookieJar
    }).on('response', function (response) {
        result.requestHeaderSize = response.req._header.length;
        result.requestBodySize = response.request.body ? response.request.body.length : 0;
        result.responseHeaderSize = calculateHeaderByteSize(response.headers);
        result.responseBodySize = response.headers["content-length"];
        result.statusCode = response.statusCode;
    }).on('end', function () {
        result.endTime = command.context.getTime();
        result.responseTrailerSize = calculateHeaderByteSize(this.response.trailers);
        result.validationResults = [];

        for (var i = 0; i < command.validators.length; i++) {
            var validator = command.validators[i];

            if (validator.type == "response") {
                result.validationResults.push({
                    type: validator.type,
                    valid: validator.validate(this.response)
                });
            } else if (validator.type == "header") {
                result.validationResults.push({
                    type: validator.type,
                    valid: validator.validate(this.response.headers)
                });
            } else if (validator.type == "body" && aggregatingStream) {
                result.validationResults.push({
                    type: validator.type,
                    valid: validator.validate(aggregatingStream.data)
                });
            } else {
                console.log("unable to run validator " + i);
            }
        }

        for (var i = 0; i < command.inspectors.length; i++) {
            command.inspectors[i].inspect(command.context, this.response.headers, aggregatingStream.data);
        }

        command.context.config.resultHandler(result);

        if (typeof(callback) === 'function') {
            callback();
        }
    });

    request.pipe(countingStream);

    if (aggregatingStream) {
        request.pipe(aggregatingStream);
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
// Creates an aggregating stream if necessary for this command.
//
function createAggregatingStreamIfNecessary(command) {
    if (command.inspectors.length > 0) {
        return new Streams.AggregatingStream();
    } else {
        for (var i = 0; i < command.validators.length; i++) {
            if (command.validators[i].type == "body") {
                return new Streams.AggregatingStream();
            }
        }
    }

    return null;
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
