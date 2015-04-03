// All ship settings packet
exports.name = 'allShipSettings';
exports.type = 0xf754c8fe;
exports.subtype = 0x0f;
exports.subtypeLength = 4;
exports.pack = function(writer, data) {
    for (var playerShip = 0; playerShip <= 7; playerShip++) {
        var ship = data[playerShip];
        writer.writeLong(ship.driveType);
        writer.writeLong(ship.type);
        writer.writeLong(ship.unknown);
        writer.writeString(ship.name);
    }
};
exports.unpack = function(data) {
    var unpacked = {};
    for (var playerShip = 0; playerShip <= 7; playerShip++) {
        var driveType   = data.readLong();
        var shipType    = data.readLong();
        var unknown     = data.readLong();
        var name        = data.readString();

        unpacked[playerShip] = {
            shipType:   shipType,
            driveType:  driveType,
            unknown:    unknown,
            name:       name
        };
    }
    return unpacked;
};