// Game master message packet
exports.name = 'gameMasterMessage';
exports.type = 0x809305a7;
exports.subtype = null;
exports.pack = function(writer, data) {
    // Destination:
    //  0 - Comms channel (server generates commsIncoming packet)
    // For destinations 1 - 6, the game server generates a gameMessage packet
    //  1 - Main screen
    //  2 - Helm
    //  3 - Weapons
    //  4 - Engineering
    //  5 - Science
    //  6 - Comms console
    writer.writeLong(0);

    // Who sends the message
    writer.writeString(data.origin);

    // Message body
    writer.writeString(data.body);
};
exports.unpack = function(data) {
    // Destination:
    //  0 - Comms channel (server generates commsIncoming packet)
    // For destinations 1 - 6, the game server generates a gameMessage packet
    //  1 - Main screen
    //  2 - Helm
    //  3 - Weapons
    //  4 - Engineering
    //  5 - Science
    //  6 - Comms console
    /*return {
        destination: data.readByte(),
        origin: data.readString(),
        body: data.readString()
    };*/
    return {};
};