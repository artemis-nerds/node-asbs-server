// Sets the ships warp factor
exports.name = 'setWarp';
exports.type = 0x4c821d3c;
exports.subtype = 0x00;
exports.pack = null;
exports.unpack = function(data) {
    try {
        return {warp: data.readLong()};
    } catch (ex) {
        // This seems to be a bug that has something to do with the 'ready' packet..
        // todo
        return {};
    }
};