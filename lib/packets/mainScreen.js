// Set the view to display on the main screen
exports.name = 'mainScreen';
exports.type = 0x3c821d3c;
exports.subtype = 0x01;
exports.subtypeLength = 4;
exports.pack = null;
exports.unpack = function(data) {
    return { view: data.readLong() };
};