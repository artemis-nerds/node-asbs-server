// Initiates a jump
exports.name = 'jump';
exports.type = 0x0351a5ac;
exports.subtype = 0x04;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        bearing: data.readFloat(),
        distance: data.readFloat()
    };
};