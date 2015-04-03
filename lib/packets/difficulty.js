// Difficulty packet
exports.name = 'difficulty';
exports.type = 0x3de66711;
exports.subtype = null;
exports.pack = function(writer, data) {
    writer.writeLong(data.difficulty);
    writer.writeLong(data.gameType);
};
exports.unpack = function(data) {
    // Possible values for gameType are:
    //  0 - Siege
    //  1 - Single front
    //  2 - Double front
    //  3 - Deep strike
    //  4 - Peacetime
    //  5 - Border war
    // Values are only meaningful for Solo and Coop games.

    return {
        difficulty: data.readLong(),
        gameType: data.readLong()
    };
};