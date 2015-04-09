var debug = require('debug')('artemis:packet:version');

// Version packet
exports.name = 'version';
exports.type = 0xe548e74a;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.unknown);

    writer.writeFloat(parseFloat(writer.major + '.' + writer.minor));

    writer.writeLong(data.major);
    writer.writeLong(data.minor);
    writer.writeLong(data.patch);
};
exports.unpack = function(data) {
    var unknown1 = data.readLong();
    var versionFloat = data.peekFloat();
    try {
        var unknown2 = data.readLong();
        var major = data.readLong();
        var minor = data.readLong();
        var patch = data.readLong();

        if (major !== 2 || minor !== 1 || patch < 5) debug('Warning: unsupported version of Artemis');

        return {
            unknown1: unknown1,
            unknown2: unknown2,
            major: major,
            minor: minor,
            patch: patch
        };
    } catch (e) {
        debug('Warning: unsupported version of Artemis');
        return {
            unknown1: unknown1,
            major: Math.floor(versionFloat),
            minor: versionFloat % 1,
            patch: null
        };
    }
};