var drivetrain = require('../index');
var assert = require('assert');

describe('http', function () {
    var harness;

    before(function (done) {
        var express = require('express');
        var bodyParser = require('body-parser');
        var multer = require('multer');
        var reloader = require('connect-livereload');
        var app = express();

        app.use(reloader());
        app.use(bodyParser.raw());
        app.use(bodyParser.text());
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
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

        app.get('/echo_x_headers', function (req, res) {
            for (var name in req.headers) {
                if (req.headers.hasOwnProperty(name) && name.indexOf("x-") == 0) {
                    res.header(name, req.headers[name.toLowerCase()])
                }
            }

            res.send("Sending you some headers");
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
            drivetrain.get('http://localhost:4000/hello').inspect(function (response) {
                assert.equal(response.body, 'Hello');
                done();
            })
        ]);
    });

    it('should be able to do a GET with inline query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello?name=Andy').inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a GET with text query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString('name=Andy').inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a GET with object query string', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with form body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withFormBody({name: 'Andy'}).inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with manual form body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withBody('name=Andy').withContentType("application/x-www-form-urlencoded").inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with JSON body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/hello').withJsonBody({name: 'Andy'}).inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');
                done();
            })
        ]);
    });

    it('should be able to do a POST with plain text body', function (done) {
        drivetrain.run([
            drivetrain.post('http://localhost:4000/echo').withBody('asdf').withContentType('text/plain').inspect(function (response) {
                assert.equal(response.body, 'asdf');
                done();
            })
        ]);
    });

    it('should be able to do a POST with binary body', function (done) {
        var buf = new Buffer(8);

        buf.fill(29320);

        drivetrain.run([
            drivetrain.post('http://localhost:4000/echo').withBody(buf).withContentType('application/octet-stream').inspect(function (response) {
                assert.equal(response.body, buf);
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
            drivetrain.options('http://localhost:4000/options').inspect(function (response) {
                assert.equal(response.body, "options");

                done();
            })
        ]);
    });

    it('should be able to do TRACE', function (done) {
        drivetrain.run([
            drivetrain.trace('http://localhost:4000/trace').inspect(function (response) {
                assert.equal(response.body, "trace");

                done();
            })
        ]);
    });

    it('should be able to do custom verbs', function (done) {
        drivetrain.run([
            drivetrain.method('PATCH', 'http://localhost:4000/patch').inspect(function (response) {
                assert.equal(response.body, "patch");

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
        drivetrain.run([
            drivetrain.get('http://localhost:4000/echo_x_headers').withHeaders({
                "X-Foo": "Bar",
                "X-Bar": "Foo"
            }).inspect(function (response) {
                try {
                    drivetrain.assertEqual(response.headers["x-foo"], "Bar");
                    drivetrain.assertEqual(response.headers["x-bar"], "Foo");

                    done();
                } catch (e) {
                    done(e);
                }
            })
        ]);
    });

    it('should pass true assertions', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (response) {
                try {
                    drivetrain.assert(response.statusCode == 200);

                    done();
                } catch (e) {
                    done(e);
                }
            })
        ]);
    });

    it('should fail false assertions', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (response) {
                try {
                    drivetrain.assert(response.statusCode == 700);
                } catch (e) {
                    done();
                }
            })
        ]);
    });

    it('should pass equal assertions', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (response) {
                try {
                    drivetrain.assertEqual(response.statusCode, 200);

                    done();
                } catch (e) {
                    done(e);
                }
            })
        ]);
    });

    it('should fail unequal assertions', function (done) {
        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello').withQueryString({name: 'Andy'}).inspect(function (response) {
                try {
                    drivetrain.assertEqual(response.statusCode, 700);
                } catch (e) {
                    done();
                }
            })
        ]);
    });

    it('should be able to interpolate context variables', function (done) {
        drivetrain.setVariable('name', 'Andy');

        drivetrain.run([
            drivetrain.get('http://localhost:4000/hello?name={{name}}').inspect(function (response) {
                assert.equal(response.body, 'Hello Andy');

                done();
            })
        ]);
    });

    after(function (done) {
        harness.server.close(done);
    });
});

