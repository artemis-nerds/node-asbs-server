// Set console packet
exports.name = 'setConsole';
exports.type = 0x4c821d3c;
exports.subtype = 0x0e;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    writer.writeLong(data.console);
    writer.writeLong(data.selected);
};
exports.unpack = function(data) {
    return {
        console: data.readLong(),
        selected: data.readLong()
    };
};
