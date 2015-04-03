// Pretty much a duplicate of destroyObject, for no reason

exports.name = 'destroyUpdate';
exports.type = 0x80803df9;
exports.subtype = 0x00;
exports.subtypeLength = 1;
exports.pack = null; // todo
exports.unpack = function(data) {
    return {
        entityType: data.readLong(),
        id: data.readLong()
    };
};