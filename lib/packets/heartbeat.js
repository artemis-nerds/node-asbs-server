// Frequent empty packet, probably heartbeat
exports.name = 'heartbeat';
exports.type = 0xf5821226;
exports.subtype = null;
exports.pack = function(writer, data) { };
exports.unpack = function(data) { return {}; };