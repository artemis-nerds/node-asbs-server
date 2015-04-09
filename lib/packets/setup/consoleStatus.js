// Console status packet
exports.name = 'consoleStatus';
exports.type = 0x19c6e2d4;
exports.subtype = null;
exports.pack = function(writer, data) {
    // Values for playerShip are 1 to 8
    // Values for availability are: 0 = available, 1 = mine, 2 = unavailable
    writer.writeLong(data.playerShip);
    writer.writeByte(data.mainScreen);
    writer.writeByte(data.helm);
    writer.writeByte(data.weapons);
    writer.writeByte(data.engineering);
    writer.writeByte(data.science);
    writer.writeByte(data.communications);
    writer.writeByte(data.data);
    writer.writeByte(data.observer);
    writer.writeByte(data.captainsMap);
    writer.writeByte(data.gameMaster);
};
exports.unpack = function(data) {
    // Values for playerShip are 1 to 8
    // Values for availability are: 0 = available, 1 = mine, 2 = unavailable
    return {
        playerShip      : data.readLong(),
        mainScreen      : data.readByte(),
        helm            : data.readByte(),
        weapons         : data.readByte(),
        engineering     : data.readByte(),
        science         : data.readByte(),
        communications  : data.readByte(),
        data            : data.readByte(),
        observer        : data.readByte(),
        captainsMap     : data.readByte(),
        gameMaster      : data.readByte()
    };
};