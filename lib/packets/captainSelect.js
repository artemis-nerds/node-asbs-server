// Selects a target on the captains map

exports.name = 'captainSelect';
exports.type = 0x4c821d3c;
exports.subtype = 0x11;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {

};
exports.unpack = function(data) {
    return { target: data.readLong() };
};