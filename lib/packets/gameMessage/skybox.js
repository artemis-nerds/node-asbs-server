// Skybox packet
// Upon starting a game, tells the client which skybox to use as a background
exports.name = 'skybox';
exports.type = 0xf754c8fe;
exports.subtype = 0x09;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.skyboxID);
};
exports.unpack = function(data) {
    return {
        skyboxID: data.readLong()
    };
};