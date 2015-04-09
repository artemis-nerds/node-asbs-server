// Autonomous damcon packet
exports.name = 'autonomousDamcon';
exports.type = 0xf754c8fe;
exports.subtype = 0x0b;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeByte(data.autonomous);
};
exports.unpack = function(data) {
    return { autonomous: data.readByte() };
};