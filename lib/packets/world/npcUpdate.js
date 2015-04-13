// Provides an update on the status of any other ship

exports.name = 'npcUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x05;
exports.subtypeLength = 1;
exports.pack = function(writer, data) {
    var nameMap = {
        shipName:           7,
        unknown1:           6,
        rudder:             5,
        maxImpulse:         4,
        turnRate:           3,
        isEnemy:            2,
        shipType:           1,
        posX:               0,

        posY:               15,
        posZ:               14,
        pitch:              13,
        roll:               12,
        heading:            11,
        velocity:           10,
        surrendered:        9,
        unknown4:           8,

        forShields:         23,
        forShieldsMax:      22,
        aftShields:         21,
        aftShieldsMax:      20,
        unknown5:           19,
        unknown6:           18,
        eliteBits:          17,
        eliteBitsActive:    16,

        scanned:            31,
        faction:            30,
        unknown7:           29,
        unknown8:           28,
        unknown9:           27,
        unknown10:          26,
        unknown11:          25,
        unknown12:          24,

        unknown13:          39,
        unknown14:          38,
        damageBeams:        37,
        damageTorpedos:     36,
        damageSensors:      35,
        damageManeuver:     34,
        damageImpulse:      33,
        damageWarp:         32,

        damageForShield:    47,
        damageAftShield:    46,
        shieldFreqA:        45,
        shieldFreqB:        44,
        shieldFreqC:        43,
        shieldFreqD:        42,
        shieldFreqE:        41
    };

    var bits = '', has = {};
    for (var name in nameMap) {
        if (!nameMap.hasOwnProperty(name)) continue;
        var index = nameMap[name];
        if (data.hasOwnProperty(name)) {
            has[name] = true;
            bits[index] = '1';
        } else {
            has[name] = false;
            bits[index] = '0';
        }
    }

    writer.writeLong(data.id);

    writer.writeBitArray(bits, 6);

    if (has.shipName)           writer.writeString  (data.shipName);
    if (has.unknown1)           writer.writeFloat   (data.unknown1);
    if (has.rudder)             writer.writeFloat   (data.rudder);
    if (has.impulseMax)         writer.writeFloat   (data.impulseMax);
    if (has.turnRateMax)        writer.writeFloat   (data.turnRateMax);
    if (has.isEnemy)            writer.writeLong    (data.isEnemy);
    if (has.shipType)           writer.writeLong    (data.shipType);
    if (has.posX)               writer.writeFloat   (data.posX);

    if (has.posY)               writer.writeFloat   (data.posY);
    if (has.posZ)               writer.writeFloat   (data.posZ);
    if (has.pitch)              writer.writeFloat   (data.pitch);
    if (has.roll)               writer.writeFloat   (data.roll);
    if (has.heading)            writer.writeFloat   (data.heading);
    if (has.velocity)           writer.writeFloat   (data.velocity);
    if (has.surrendered)        writer.writeByte    (data.surrendered);
    if (has.unknown4)           writer.writeShort   (data.unknown4);

    if (has.forShields)         writer.writeFloat   (data.forShields);
    if (has.forShieldsMax)      writer.writeFloat   (data.forShieldsMax);
    if (has.aftShields)         writer.writeFloat   (data.aftShields);
    if (has.aftShieldsMax)      writer.writeFloat   (data.aftShieldsMax);
    if (has.unknown5)           writer.writeShort   (data.unknown5);
    if (has.unknown6)           writer.writeByte    (data.unknown6);
    if (has.eliteBits)          writer.writeLong    (data.eliteBits);
    if (has.eliteBitsActive)    writer.writeLong    (data.eliteBitsActive);

    if (has.scanned)            writer.writeLong    (data.scanned);
    if (has.faction)            writer.writeLong    (data.faction);
    if (has.unknown7)           writer.writeLong    (data.unknown7);
    if (has.unknown8)           writer.writeByte    (data.unknown8);
    if (has.unknown9)           writer.writeByte    (data.unknown9);
    if (has.unknown10)          writer.writeByte    (data.unknown10);
    if (has.unknown11)          writer.writeByte    (data.unknown11);
    if (has.unknown12)          writer.writeFloat   (data.unknown12);

    if (has.unknown13)          writer.writeLong    (data.unknown13);
    if (has.unknown14)          writer.writeLong    (data.unknown14);
    if (has.damageBeams)        writer.writeFloat   (data.damageBeams);
    if (has.damageTorpedos)     writer.writeFloat   (data.damageTorpedos);
    if (has.damageSensors)      writer.writeFloat   (data.damageSensors);
    if (has.damageManeuver)     writer.writeFloat   (data.damageManeuver);
    if (has.damageImpulse)      writer.writeFloat   (data.damageImpulse);
    if (has.damageWarp)         writer.writeFloat   (data.damageWarp);

    if (has.damageForShield)    writer.writeFloat   (data.damageForShield);
    if (has.damageAftShield)    writer.writeFloat   (data.damageAftShield);
    if (has.shieldFreqA)        writer.writeFloat   (data.shieldFreqA);
    if (has.shieldFreqB)        writer.writeFloat   (data.shieldFreqB);
    if (has.shieldFreqC)        writer.writeFloat   (data.shieldFreqC);
    if (has.shieldFreqD)        writer.writeFloat   (data.shieldFreqD);
    if (has.shieldFreqE)        writer.writeFloat   (data.shieldFreqE);
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