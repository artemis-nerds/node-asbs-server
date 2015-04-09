// Not ready packet
exports.name = 'ready2';
exports.type = 0x4c821d3c;
exports.subtype = 0x19;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(0);
};
exports.unpack = function(data) {
    return {}
};