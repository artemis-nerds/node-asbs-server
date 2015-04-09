// Sets the rate of turn for the ship
exports.name = 'setSteering';
exports.type = 0x0351a5ac;
exports.subtype = 0x01;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return {
        turn: data.readFloat()
    };
};