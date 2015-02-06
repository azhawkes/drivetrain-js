//
// Utility streams to help with HTTP responses.
//

var Util = require("util");
var Stream = require("stream");

Util.inherits(CountingStream, Stream.Writable);

function CountingStream() {
    this.totalBytes = 0;

    Stream.Writable.call(this, {});
}

CountingStream.prototype._write = function (chunk, enc, callback) {
    this.totalBytes += chunk.length;

    callback();
};

Util.inherits(AggregatingStream, Stream.Writable);

function AggregatingStream() {
    this.data = "";

    Stream.Writable.call(this, {});
}

AggregatingStream.prototype._write = function (chunk, enc, callback) {
    this.data += chunk.toString();

    callback();
};

module.exports = {
    CountingStream: CountingStream,
    AggregatingStream: AggregatingStream
};
