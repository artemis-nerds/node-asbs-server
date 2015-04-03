/**
 * Helper class for reading/writing packets
 *
 * Based on ArtemisGlitter's artemisBufferRead class:
 * https://github.com/IvanSanchez/artemis-glitter/blob/master/artemisBufferReader.js
 */

var bitarray = require('node-bitarray');

function BufferReader(buffer) {
    this.buffer = buffer;
    this.pointer = 0;
}

/**
 * Reads a UTF-16 formatted string
 *
 * @returns {string}
 */
BufferReader.prototype.readString = function() {
    var strLen = this.buffer.readUInt32LE(this.pointer) * 2;
    var str = this.buffer.toString('utf16le', this.pointer + 4, this.pointer + strLen + 2);
    this.pointer += 4 + strLen;
    return str;
};

/**
 * Reads an ASCII formatted string
 *
 * @returns {string}
 */
BufferReader.prototype.readAsciiString = function() {
    var strLen = this.buffer.readUInt32LE(this.pointer);
    var str = this.buffer.toString('ascii', this.pointer + 4, this.pointer + strLen + 4);
    this.pointer += 4 + strLen;
    return str;
};

/**
 * Reads a byte
 *
 * @returns {Number}
 */
BufferReader.prototype.readByte = function() {
    var number = this.buffer.readUInt8(this.pointer);
    this.pointer++;
    return number;
};

/**
 * Reads a short uint
 *
 * @returns {Number}
 */
BufferReader.prototype.readShort = function() {
    var number = this.buffer.readUInt16LE(this.pointer);
    this.pointer += 2;
    return number;
};

/**
 * Reads a long uint
 *
 * @returns {Number}
 */
BufferReader.prototype.readLong = function() {
    var number = this.buffer.readUInt32LE(this.pointer);
    this.pointer += 4;
    return number;
};

/**
 * Reads a float
 *
 * @returns {Number}
 */
BufferReader.prototype.readFloat = function() {
    var number = this.buffer.readFloatLE(this.pointer);
    this.pointer += 4;
    return number;
};

/**
 * Reads a bit array
 *
 * @param bytes
 * @returns {Array}
 */
BufferReader.prototype.readBitArray = function(bytes) {
    var slice = this.buffer.slice(this.pointer, this.pointer + bytes);
    var bits = bitarray.fromBuffer(slice);
    this.pointer += bytes;
    return bits;
};

/**
 * Like readByte, but doesn't advance the pointer
 *
 * @returns {Number}
 */
BufferReader.prototype.peekByte = function() {
    return this.buffer.readUInt8(this.pointer);
};

/**
 * Like readShort, but doesn't advance the pointer
 *
 * @returns {Number}
 */
BufferReader.prototype.peekShort = function() {
    return this.buffer.readUInt16LE(this.pointer);
};

/**
 * Like readLong, but doesn't advance the pointer
 *
 * @returns {Number}
 */
BufferReader.prototype.peekLong = function() {
    return this.buffer.readUInt32LE(this.pointer);
};

/**
 * Like readFloat, but doesn't advance the pointer
 *
 * @returns {Number}
 */
BufferReader.prototype.peekFloat = function() {
    return this.buffer.readFloatLE(this.pointer);
};

BufferReader.prototype.writeByte = function(data) {
    var number = this.buffer.writeUInt8(data, this.pointer);
    this.pointer += 1;
    return number;
};

BufferReader.prototype.writeShort = function(data) {
    var number = this.buffer.writeUInt16LE(data, this.pointer);
    this.pointer += 2;
    return number;
};

BufferReader.prototype.writeLong = function(data) {
    var number = this.buffer.writeUInt32LE(data, this.pointer);
    this.pointer += 4;
    return number;
};

BufferReader.prototype.writeFloat = function(data) {
    var number = this.buffer.writeFloatLE(data, this.pointer);
    this.pointer += 4;
    return number;
};

BufferReader.prototype.writeString = function(data) {
    var strLen = data.length;
    this.buffer.writeUInt32LE(strLen + 1, this.pointer);
    this.pointer += 4;

    this.buffer.write(data, this.pointer, strLen * 2, 'utf16le');
    this.pointer += strLen * 2;
    this.buffer.writeUInt16LE(0, this.pointer);
    this.pointer += 2;
};

BufferReader.prototype.writeAsciiString = function(data) {
    var strLen = data.length;
    this.buffer.writeUInt32LE(strLen, this.pointer);
    this.buffer.write(data, this.pointer + 4, strLen, 'ascii');
    this.pointer += 4 + strLen;
};

/**
 * Writes a bit array
 *
 * @param {Array} offsets
 * @param {Number} bytes
 */
BufferReader.prototype.writeBitArray = function(offsets, bytes) {
    var ba = bitarray.fromOffsets(offsets).fill(bytes * 8);
    ba.toBuffer().copy(this.buffer, this.pointer, 0, bytes);
    this.pointer += bytes;
};

module.exports = BufferReader;