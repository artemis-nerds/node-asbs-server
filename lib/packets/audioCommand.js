// Plays or dismisses an audio message
exports.name = 'audioCommand';
exports.type = 0x6aadc57f;
exports.subtype = null;
exports.pack = null;
exports.unpack = function(data) {
    return {
        id: data.readLong(),
        command: data.readLong()
    };
};