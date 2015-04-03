// Sends a COMMs message to the server
exports.name = 'commsOutgoing';
exports.type = 0x574c4c4b;
exports.subtype = null;
exports.pack = null;
exports.unpack = function(data) {
    return {
        recipientType:  data.readLong(),
        recipientID:    data.readLong(),
        message:        data.readLong(),
        targetID:       data.readLong(),
        unknown1:       data.readLong()
    };
};