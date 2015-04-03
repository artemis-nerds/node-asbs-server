// Destroy object packet, notifies the client that an object has been removed from play.
exports.name = 'destroyObject';
exports.type = 0xcc5a3e30;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeByte(data.type);
    writer.writeLong(data.id);
};
exports.unpack = function(data) {
    return {
        type: data.readByte(),
        id: data.readLong()
    };
};