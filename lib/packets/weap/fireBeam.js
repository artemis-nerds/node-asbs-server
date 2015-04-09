// A WEAP officer wants to manually fire the beam weapons
exports.name = 'fireBeam';
exports.type = 0xc2bee72e;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);
    writer.writeFloat(data.x);
    writer.writeFloat(data.y);
    writer.writeFloat(data.z);
};
exports.unpack = function(data) {
    return {
        id: data.readLong(),
        x: data.readFloat(),
        y: data.readFloat(),
        z: data.readFloat()
    };
};