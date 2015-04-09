// Causes the ship to climb or dive
exports.name = 'climbDive';
exports.type = 0x4c821d3c;
exports.subtype = 0x1b;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { direction: data.readLong() };
};