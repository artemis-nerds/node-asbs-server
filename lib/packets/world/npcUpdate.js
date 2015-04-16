// Provides an update on the status of any other ship
var setUpdateProps = require('./_setUpdateProps');

exports.name = 'npcUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x05;
exports.subtypeLength = 1;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);

    setUpdateProps(writer, data, 6, {
        shipName:           [7, 'string'],
        impulse:            [6, 'float'],
        rudder:             [5, 'float'],
        maxImpulse:         [4, 'float'],
        turnRate:           [3, 'float'],
        isEnemy:            [2, 'long'],
        shipType:           [1, 'long'],
        posX:               [0, 'float'],

        posY:               [15, 'float'],
        posZ:               [14, 'float'],
        pitch:              [13, 'float'],
        roll:               [12, 'float'],
        heading:            [11, 'float'],
        velocity:           [10, 'float'],
        surrendered:        [9,  'byte'],
        unknown4:           [8,  'short'],

        forShields:         [23, 'float'],
        forShieldsMax:      [22, 'float'],
        aftShields:         [21, 'float'],
        aftShieldsMax:      [20, 'float'],
        unknown5:           [19, 'short'],
        fleet:              [18, 'byte'],
        eliteBits:          [17, 'long'],
        eliteBitsActive:    [16, 'long'],

        scanned:            [31, 'long'],
        faction:            [30, 'long'],
        unknown7:           [29, 'long'],
        side:               [28, 'byte'],
        unknown9:           [27, 'byte'],
        unknown10:          [26, 'byte'],
        unknown11:          [25, 'byte'],
        unknown12:          [24, 'float'],

        unknown13:          [39, 'long'],
        unknown14:          [38, 'long'],
        damageBeams:        [37, 'float'],
        damageTorpedos:     [36, 'float'],
        damageSensors:      [35, 'float'],
        damageManeuver:     [34, 'float'],
        damageImpulse:      [33, 'float'],
        damageWarp:         [32, 'float'],

        damageForShield:    [47, 'float'],
        damageAftShield:    [46, 'float'],
        shieldFreqA:        [45, 'float'],
        shieldFreqB:        [44, 'float'],
        shieldFreqC:        [43, 'float'],
        shieldFreqD:        [42, 'float'],
        shieldFreqE:        [41, 'float'],
        unused:             [40]
    });
};
exports.unpack = function(data) {
    var unpacked = {};
    unpacked.id = data.readLong();

    var bits = data.readBitArray(6);
    if (bits.get(7)) unpacked.shipName          = data.readString();
    if (bits.get(6)) unpacked.unknown1          = data.readFloat();
    if (bits.get(5)) unpacked.rudder            = data.readFloat();
    if (bits.get(4)) unpacked.impulseMax        = data.readFloat();
    if (bits.get(3)) unpacked.turnRateMax       = data.readFloat();
    if (bits.get(2)) unpacked.isEnemy           = data.readLong();
    if (bits.get(1)) unpacked.shipType          = data.readLong();
    if (bits.get(0)) unpacked.posX              = data.readFloat();

    if (bits.get(15)) unpacked.posY             = data.readFloat();
    if (bits.get(14)) unpacked.posZ             = data.readFloat();
    if (bits.get(13)) unpacked.pitch            = data.readFloat();
    if (bits.get(12)) unpacked.roll             = data.readFloat();
    if (bits.get(11)) unpacked.heading          = data.readFloat();
    if (bits.get(10)) unpacked.velocity         = data.readFloat();
    if (bits.get(9))  unpacked.surrendered      = data.readByte();
    if (bits.get(8))  unpacked.unknown4         = data.readShort(); // maybe surrender chance?

    if (bits.get(23)) unpacked.forShields       = data.readFloat();
    if (bits.get(22)) unpacked.forShieldsMax    = data.readFloat();
    if (bits.get(21)) unpacked.aftShields       = data.readFloat();
    if (bits.get(20)) unpacked.aftShieldsMax    = data.readFloat();
    if (bits.get(19)) unpacked.unknown5         = data.readShort(); // Maybe ShieldsOn
    if (bits.get(18)) unpacked.unknown6         = data.readByte();  // Maybe triggerMines
    if (bits.get(17)) unpacked.eliteBits        = data.readLong();
    if (bits.get(16)) unpacked.eliteBitsActive  = data.readLong();

    if (bits.get(31)) unpacked.scanned          = data.readLong();
    if (bits.get(30)) unpacked.faction          = data.readLong();
    if (bits.get(29)) unpacked.unknown7         = data.readLong();
    if (bits.get(28)) unpacked.unknown8         = data.readByte();
    if (bits.get(27)) unpacked.unknown9         = data.readByte();
    if (bits.get(26)) unpacked.unknown10        = data.readByte();
    if (bits.get(25)) unpacked.unknown11        = data.readByte();
    if (bits.get(24)) unpacked.unknown12        = data.readFloat();

    if (bits.get(39)) unpacked.unknown13        = data.readLong();
    if (bits.get(38)) unpacked.unknown14        = data.readLong();
    if (bits.get(37)) unpacked.damageBeams      = data.readFloat();
    if (bits.get(36)) unpacked.damageTorpedos   = data.readFloat();
    if (bits.get(35)) unpacked.damageSensors    = data.readFloat();
    if (bits.get(34)) unpacked.damageManeuver   = data.readFloat();
    if (bits.get(33)) unpacked.damageImpulse    = data.readFloat();
    if (bits.get(32)) unpacked.damageWarp       = data.readFloat();

    if (bits.get(47)) unpacked.damageForShield  = data.readFloat();
    if (bits.get(46)) unpacked.damageAftShield  = data.readFloat();
    if (bits.get(45)) unpacked.shieldFreqA      = data.readFloat();
    if (bits.get(44)) unpacked.shieldFreqB      = data.readFloat();
    if (bits.get(43)) unpacked.shieldFreqC      = data.readFloat();
    if (bits.get(42)) unpacked.shieldFreqD      = data.readFloat();
    if (bits.get(41)) unpacked.shieldFreqE      = data.readFloat();

    return unpacked;
};