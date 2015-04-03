/**
 * A packet header manager
 */

var debug = require('debug')('artemis:packet');

var BufferReader = require('./BufferReader');
var util = require('util');

var Server = require('./Server');

/**
 * A header for a packet
 *
 * @param {Buffer} buffer
 * @param {Client} client
 * @constructor
 */
function PacketHeader(buffer, client) {
    var data = this.data = new BufferReader(buffer);

    this.magic = data.readLong();
    this.packetLength = data.readLong();
    this.origin = data.readLong();
    this.unknown = data.readLong();
    this.bytesRemaining = data.readLong();
    this.type = data.readLong();
    this.subtype = null;

    if (this.magic !== 0xdeadbeef)
        throw new Error('Wrong magic number!');

    if (this.packetLength !== (this.bytesRemaining + 20))
        throw new Error('Packet length and remaining bytes mismatch');

    // Stop parsing if it is an incomplete buffer
    if (buffer.length < this.packetLength) return;

    var packetDef;
    if (Server.knownPackets.hasOwnProperty(this.type)) {
        var packets = [];
        var packetTypes = [];
        var subtypeLength = 0;
        if (Server.knownPackets[this.type].subpackets) subtypeLength = Server.knownPackets[this.type].subtypeLength;

        // One packet may contain several subpackets, just concatenated.
        while (data.pointer < this.packetLength) {
            switch (subtypeLength) {
                case 1: this.subtype = data.readByte(); break;
                case 4: this.subtype = data.readLong(); break;
                case 0: packetDef = Server.knownPackets[this.type]; break;
                default: break; break;
            }
            if (subtypeLength && Server.knownSubPackets[this.type].hasOwnProperty(this.subtype))
                packetDef = Server.knownSubPackets[this.type][this.subtype];

            var packetType;
            if (packetDef) packetType = packetDef.name;
            else throw new Error('Unknown packet!', this.type, this.subtype);

            // Unfortunately, there might be some bugs still present with random
            // crashes involving reading outside the recv buffer, so let's wrap
            // this into a try-catch
            try {
                packetTypes.push(packetType);
                var unpacked = packetDef.unpack(data);
                packets.push(unpacked);

                // Debug: log non-entity-update, non-usually-seen packets
                /*if (this.type !== 0x80803df9) {
                    switch (packetType) {
                        case 'intel':
                        case 'damcon':
                        case 'beamFired':
                        case 'allShipSettings':
                        case 'consoleStatus':
                        case 'soundEffect':
                        case 'commsIncoming':
                        case 'playerShipDamage':
                        case 'destroyObject': break;
                        default: debug(packetType, unpacked);
                    }
                }*/
            } catch(e) {
                debug('Error while parsing packet of type ' + packetType);
                debug(e);
                var str = '';
                for (var i = 0; i < this.packetLength && i < data.buffer.length; i++) {
                    var hex = data.buffer.readUInt8(i).toString(16);
                    if (hex.length < 2) hex = "0" + hex;
                    str += hex + ' ';
                }
                debug('Data was:');
                debug(str);
                break;
            }
        }

        // Some packets such as stationUpdate may return more
        // than one payload
        for (var x = 0; x < packets.length; x++) {
            client.doEmit(packetTypes[x], packets[x]);
        }

        // Packets with 1-byte subtype are packed to 4 bytes.
        // This means the last 00 is really the last 00000000 and
        // we need to advance the pointer a little bit.
        if (subtypeLength === 1) data.pointer += 3;

        // Debug unknown/weird/mishandled packets
        if (data.pointer !== this.packetLength) {
            debug('Mismatching read length and packet length: ' + data.pointer + ' ' + this.packetLength
                + ', data size: ' + data.buffer.length);
            debug('Last packet was: ' + packetTypes[packets.length - 1], packets[packets.length - 1]);

            var dataStr = '';
            for (var y = 0; y < data.pointer && y < data.buffer.length; y++) {
                var errHex = data.buffer.readUInt8(y).toString(16);
                if (errHex.length < 2) errHex = "0" + errHex;
                dataStr += errHex + ' ';
            }
            debug('Data was:');
            debug(dataStr);

            dataStr = '';
            for (var p = data.pointer; p <= this.packetLength && p < data.buffer.length; p++) {
                errHex = data.buffer.readUInt8(p).toString(16);
                if (errHex.length < 2) errHex = "0" + errHex;
                dataStr += errHex + ' ';
            }
            debug('Data ahead is:');
            debug(dataStr);
        }
    } else {
        debug('Unknown packet type: ' + this.type.toString(16) + ', subtype: ' + this.subtype);

        // Display the unknown payload if it's not a magic word
        // marking the start of the next packet.
        if (data.length && data.buffer.readLong(0) !== 0xdeadbeef)
            debug('Unknown payload: ' + data.buffer.slice(0, this.packetLength));
        client.emit('packet', this);
    }
}

module.exports = PacketHeader;