var assert = require('assert');
var drivetrain = require('../drivetrain');

describe('http', function () {
    var harness;

    before(function(done) {
        var express = require('express');
        var bodyParser = require('body-parser');
        var multer = require('multer');
        var reloader = require('connect-livereload');
        var app = express();

        app.use(reloader());
        app.use(bodyParser.raw());
        app.use(bodyParser.text());
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
        app.use(multer()); // for parsing multipart/form-data

        app.get('/hello', function (req, res) {
            if (req.query.name) {
                res.send("Hello " + req.query.name);
            } else {
                res.send("Hello");
            }
        });

        app.post('/hello', function (req, res) {
            if (req.body.name) {
                res.send("Hello " + req.body.name);
            } else {
                res.send("Hello");
            }
        });

        app.post('/echo', function (req, res) {
            res.type(req.header("content-type"));
            res.send(req.body);
        });

        app.options('/options', function (req, res) {
            res.type("text/plain");
            res.send("options");
        });

        app.trace('/trace', function (req, res) {
            res.type("text/plain");
            res.send("trace");
        });

        app.patch('/patch', function (req, res) {
            res.type("text/plain");
            res.send("patch");
        });

        harness = app;
        harness.server = harness.listen(4000, '127.0.0.1', done);
    });

    it('should be able to do a simple GET', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').inspect(function (context, headers, body) {
                console.log("got 1");
                assert.equal(body, 'Hello');
                done();
            })
        ]);
    });

    it('should be able to do a GET with inline query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello?name=Andy').inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a GET with text query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString('name=Andy').inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a GET with object query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with form body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withFormBody({name: 'Andy'}).inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with manual form body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withBody('name=Andy').withContentType("application/x-www-form-urlencoded").inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with JSON body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withJsonBody({name: 'Andy'}).inspect(function (context, headers, body) {
                assert.equal(body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with plain text body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/echo').withBody('asdf').withContentType('text/plain').inspect(function (context, headers, body) {
                assert.equal(body, 'asdf');
                done();
            })
        ]);
    });

    it('should be able to do a POST with binary body', function (done) {
        var buf = new Buffer(8);

        buf.fill(29320);

        drivetrain.run([
            drivetrain.post('http://localhost:4000/echo').withBody(buf).withContentType('application/octet-stream').inspect(function (context, headers, body) {
                assert.equal(body, buf);
                done();
            })
        ]);
    });

    it('should be able to do a POST with multipart body', function (done) {
        drivetrain.run([
            // TODO
        ]);
    });

    // TODO - do PUT with all the same bodies as POST

    it('should be able to do OPTIONS', function (done) {
        drivetrain.run([
            drivetrain.options('http://localhost:4000/options').inspect(function (context, headers, body) {
                assert.equal(body, "options");

                done();
            })
        ]);
    });

    it('should be able to do TRACE', function (done) {
        drivetrain.run([
            drivetrain.trace('http://localhost:4000/trace').inspect(function (context, headers, body) {
                assert.equal(body, "trace");

                done();
            })
        ]);
    });

    it('should be able to do custom verbs', function (done) {
        drivetrain.run([
            drivetrain.method('PATCH', 'http://localhost:4000/patch').inspect(function (context, headers, body) {
                assert.equal(body, "patch");

                done();
            })
        ]);
    });

    it('should download 3 page resources in parallel', function (done) {
        // TODO
    });

    it('should download 6 page resources 2 at a time', function (done) {
        // TODO
    });

    it('should send custom headers', function (done) {
        // TODO
    });

    it('should override custom headers when called twice', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('', function (done) {
        // TODO
    });

    it('should validate response header equals', function (done) {
        // TODO
    });

    it('should validate response header contains', function (done) {
        // TODO
    });

    it('should validate response header with a custom function', function (done) {
        // TODO
    });

    it('should validate response body contains', function (done) {
        // TODO
    });

    it('should validate response body as string with a custom function', function (done) {
        // TODO
    });

    it('should inspect response headers', function (done) {
        // TODO
    });

    it('should inspect response bodies', function (done) {
        // TODO
    });

    it('should be able to set context variables when inspecting responses', function (done) {
        // TODO
    });

    after(function(done) {
        harness.server.close(done);
    });
});

