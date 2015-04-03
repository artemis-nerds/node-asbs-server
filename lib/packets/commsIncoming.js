// Incoming comms packet
exports.name = 'commsIncoming';
exports.type = 0xd672c35f;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.priority);
    writer.writeString(data.sender);
    writer.writeString(data.msg);
};
exports.unpack = function(data) {
    // Possible values for 'priority':
    //  0 - We will surrender
    //  1 -
    //  2 -
    //  3 -
    //  4 - We're under attack
    //  5 -
    //  6 - We've produced another missile
    //  7 - Help us help you
    //  8 - Will you surrender?!
    return {
        priority: data.readLong(),
        sender: data.readString(),
        msg: data.readString()
    };
};