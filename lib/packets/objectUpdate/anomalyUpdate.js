// Provides an update on the status of an anomaly
var getUpdateProps = require('./getUpdateProps');

exports.name = 'anomalyUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x08;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong(0);

    var bits = data.readBitArray(1);
    getUpdateProps(unpacked, data, bits);

    return unpacked;
};