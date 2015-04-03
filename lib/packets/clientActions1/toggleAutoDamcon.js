// Toggles the DAMCON team autonomy
exports.name = 'toggleAutoDamcon';
exports.type = 0x3c821d3c;
exports.subtype = 0x0c;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { autonomous: data.readShort() };
};