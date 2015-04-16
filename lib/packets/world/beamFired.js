// Beam fired packet
// Notifies the client that beam weapon has been fired.
exports.name = 'beamFired';
exports.type = 0xb83fd2c4;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.id);
    writer.writeLong(data.unknown1);
    writer.writeLong(data.unknown2);
    writer.writeLong(data.beamPort);
    writer.writeLong(data.unknown3);
    writer.writeLong(data.unknown4);
    writer.writeLong(data.source);
    writer.writeLong(data.target);
    writer.writeFloat(data.impactX);
    writer.writeFloat(data.impactY);
    writer.writeFloat(data.impactZ);
    writer.writeLong(data.mode);
};
exports.unpack = function(data) {
    return {
        // Beams fired have an ID, in the same range as all the other objects
        // (ships, bases, missiles/drones, etc)
        id: data.readLong(),

        // Observed 0 when fired from enemy, 1 when fired from own ship
        unknown2: data.readLong(),

        // Possibly related to beam strength.
        // Perhaps 1200 = light cruiser's 12 damage * 100%
        // Perhaps enemy 100 = kralien's 1 damage * 100%
        unknown3: data.readLong(),

        // Usually 0 is starboard arc and 1 is portside arc
        beamPort: data.readLong(),

        // Observed 4
        unknown5: data.readLong(),

        // Observed 1 and 4.
        unknown6: data.readLong(),

        source: data.readLong(),
        target: data.readLong(),

        impactX: data.readLong(),
        impactY: data.readLong(),
        impactZ: data.readLong(),

        unknown10: data.readLong()
    };
};
