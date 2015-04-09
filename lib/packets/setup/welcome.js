// Welcome packet
exports.name = 'welcome';
exports.type = 0x6d04b3da;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeAsciiString(data.str);
};
exports.unpack = function(data) {
    return { str: data.readAsciiString() };
};