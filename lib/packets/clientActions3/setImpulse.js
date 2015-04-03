// Sets impulse velocity
exports.name = 'setImpulse';
exports.type = 0x0351a5ac;
exports.subtype = 0x00;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        velocity: data.readFloat()
    };
};