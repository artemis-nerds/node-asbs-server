// Key capture packet
exports.name = 'keyCapture';
exports.type = 0xf754c8fe;
exports.subtype = 0x11;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeByte(data.capture);
};
exports.unpack = function(data) {
    var capture = data.readByte();
    return { capture: capture };
};