var Request = require("request");
var Streams = require("./streams");
var Qs = require('qs');

//
// An HTTP command.
//
function http(config, method, url) {
    var self = {
        config: config,
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
        inspect: function (f) {
            self.inspectors.push({
                inspect: f
            });

            return self;
        },
        run: function (context, callback) {
            runCommand(self, context, callback);
        }
    };

    return self;
}

//
// Runs an HTTP command with context.
//
function runCommand(command, context, callback) {
    var result = {
        type: "http",
        method: command.method,
        url: command.url,
        startTime: context.getTime(),
        errors: [],
        warnings: []
    };

    var countingStream = new Streams.CountingStream(command);
    var aggregatingStream = createAggregatingStreamIfNecessary(command);

    var request = Request({
        method: command.method,
        url: command.url,
        qs: command.query,
        headers: command.headers,
        body: command.rawBody || command.jsonBody || null,
        form: command.formBody || null,
        json: command.jsonBody ? true : false
    }).on('response', function (response) {
        result.requestHeaderSize = response.req._header.length;
        result.requestBodySize = response.request.body ? response.request.body.length : 0;
        result.responseHeaderSize = calculateHeaderByteSize(response.headers);
        result.responseBodySize = response.headers["content-length"];
        result.statusCode = response.statusCode;
    }).on('end', function () {
        result.endTime = context.getTime();
        result.responseTrailerSize = calculateHeaderByteSize(this.response.trailers);
        result.validationResults = [];

        for (var i = 0; i < command.validators.length; i++) {
            var validator = command.validators[i];

            if (command.validators[i].type == "header") {
                result.validationResults.push({
                    type: validator.type,
                    valid: validator.validate(this.response.headers)
                });
            } else if (command.validators[i].type == "body" && aggregatingStream) {
                result.validationResults.push({
                    type: validator.type,
                    valid: validator.validate(aggregatingStream.data)
                });
            } else {
                console.log("unable to run validator " + i);
            }
        }

        for (var i = 0; i < command.inspectors.length; i++) {
            command.inspectors[i].inspect(context, this.response.headers, aggregatingStream.data);
        }

        command.config.resultHandler(result);

        callback();
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
            if (!aggregatingStream && command.validators[i].type == "body") {
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
    get: function (config, url) {
        return http(config, "GET", url);
    },
    post: function (config, url) {
        return http(config, "POST", url);
    }
};
