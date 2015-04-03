// Provides an update on the status of the player ship
var setUpdateProps = require('./setUpdateProps');

exports.name = 'engineeringUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x03;
exports.subtypeLength = 1;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);

    setUpdateProps(writer, data, 4, {
        heatBeams:          [7, 'float'],
        heatTorpedos:       [6, 'float'],
        heatSensors:        [5, 'float'],
        heatManeuver:       [4, 'float'],
        heatImpulse:        [3, 'float'],
        heatWarp:           [2, 'float'],
        heatForShields:     [1, 'float'],
        heatAftShields:     [0, 'float'],

        energyBeams:        [15, 'float'],
        energyTorpedos:     [14, 'float'],
        energySensors:      [13, 'float'],
        energyManeuver:     [12, 'float'],
        energyImpulse:      [11, 'float'],
        energyWarp:         [10, 'float'],
        energyForShields:   [9,  'float'],
        energyAftShields:   [8,  'float'],

        coolantBeams:       [23, 'byte'],
        coolantTorpedos:    [22, 'byte'],
        coolantSensors:     [21, 'byte'],
        coolantManeuver:    [20, 'byte'],
        coolantImpulse:     [19, 'byte'],
        coolantWarp:        [18, 'byte'],
        coolantForShields:  [17, 'byte'],
        coolantAftShields:  [16, 'byte']
    });
};
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong(0);

    var bits = data.readBitArray(4);

    if (bits.get(7)) unpacked.heatBeams             = data.readFloat();
    if (bits.get(6)) unpacked.heatTorpedos          = data.readFloat();
    if (bits.get(5)) unpacked.heatSensors           = data.readFloat();
    if (bits.get(4)) unpacked.heatManeuver          = data.readFloat();
    if (bits.get(3)) unpacked.heatImpulse           = data.readFloat();
    if (bits.get(2)) unpacked.heatWarp              = data.readFloat();
    if (bits.get(1)) unpacked.heatForShields        = data.readFloat();
    if (bits.get(0)) unpacked.heatAftShields        = data.readFloat();

    if (bits.get(15)) unpacked.energyBeams          = data.readFloat();
    if (bits.get(14)) unpacked.energyTorpedos       = data.readFloat();
    if (bits.get(13)) unpacked.energySensors        = data.readFloat();
    if (bits.get(12)) unpacked.energyManeuver       = data.readFloat();
    if (bits.get(11)) unpacked.energyImpulse        = data.readFloat();
    if (bits.get(10)) unpacked.energyWarp           = data.readFloat();
    if (bits.get(9))  unpacked.energyForShields     = data.readFloat();
    if (bits.get(8))  unpacked.energyAftShields     = data.readFloat();

    if (bits.get(23)) unpacked.coolantBeams         = data.readByte();
    if (bits.get(22)) unpacked.coolantTorpedos      = data.readByte();
    if (bits.get(21)) unpacked.coolantSensors       = data.readByte();
    if (bits.get(20)) unpacked.coolantManeuver      = data.readByte();
    if (bits.get(19)) unpacked.coolantImpulse       = data.readByte();
    if (bits.get(18)) unpacked.coolantWarp          = data.readByte();
    if (bits.get(17)) unpacked.coolantForShields    = data.readByte();
    if (bits.get(16)) unpacked.coolantAftShields    = data.readByte();

    return unpacked;
};