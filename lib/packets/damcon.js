// Damcon packet
// Updates damage to the various system grids on the ship and DAMCON team locations and status.
exports.name = 'damcon';
exports.type = 0x077e9f3c;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeByte(data.unknown);

    var i, node, team;
    for (i = 0; i < data.nodes.length; i++) {
        node = data.nodes[i];
        writer.writeByte(node.x);
        writer.writeByte(node.y);
        writer.writeByte(node.z);
        writer.writeFloat(node.damage);
    }
    writer.writeByte(0xff);

    for (i = 0; i < data.teams.length; i++) {
        team = data.teams[i];
        writer.writeByte(team.teamID);
        writer.writeLong(team.goalX);
        writer.writeLong(team.goalY);
        writer.writeLong(team.goalZ);
        writer.writeLong(team.x);
        writer.writeLong(team.y);
        writer.writeLong(team.z);
        writer.writeFloat(team.progress);
        writer.writeLong(team.members);
    }
    writer.writeByte(0xfe);

};
exports.unpack = function(data) {
    var unpacked = {
        unknown: data.readByte(),
        nodes: [],
        teams: []
    };

    var byte;
    while ((byte = data.readByte()) !== 0xff) {
        unpacked.nodes.push({
            x: byte,
            y: data.readByte(),
            z: data.readByte(),
            damage: data.readFloat()
        });
    }

    while ((byte = data.readByte()) !== 0xfe) {
        unpacked.teams.push({
            teamID: byte,
            goalX: data.readLong(),
            goalY: data.readLong(),
            goalZ: data.readLong(),
            x: data.readLong(),
            y: data.readLong(),
            z: data.readLong(),
            progress: data.readFloat(),
            members: data.readLong()
        });
    }

    return unpacked;
};