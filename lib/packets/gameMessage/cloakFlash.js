// This looks like the coordinates of enemy vessles when activating special abilities
exports.name = 'cloakFlash';
exports.type = 0xf754c8fe;
exports.subtype = 0x07;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeFloat(data.posX);
    writer.writeFloat(data.posY);
    writer.writeFloat(data.posZ);
};
exports.unpack = function(data) {
    return {
        posX: data.readFloat(),
        posY: data.readFloat(),
        posZ: data.readFloat()
    };
};