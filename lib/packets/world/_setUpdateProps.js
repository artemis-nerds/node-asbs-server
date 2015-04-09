/**
 * Sets update properties
 *
 * @param {BufferReader} writer
 * @param {Object} data
 * @param {Number} bytes
 * @param {Object} map
 */
module.exports = function(writer, data, bytes, map) {
    //var bits = [], has = [];
    var offsets = [], has = [];
    Object.keys(map).forEach(function(name) {
        var index = map[name][0];
        if (data.hasOwnProperty(name)) {
            has.push(name);
            offsets.push(index);
        }
    });
    writer.writeBitArray(offsets, bytes);
    has.forEach(function(name) {
        var type = map[name][1];
        var funcName = 'write' + type[0].toUpperCase() + type.substring(1);
        writer[funcName](data[name]);
    });
};