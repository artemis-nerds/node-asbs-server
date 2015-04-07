// Sets whether to use third- or first- person view on the main screen
exports.name = 'setPerspective';
exports.type = 0xf754c8fe;
exports.subtype = 0x12;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.view);
};
exports.unpack = null;
