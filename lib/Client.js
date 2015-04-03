var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('artemis:client');

var PacketHeader = require('./PacketHeader');
var BufferReader = require('./BufferReader');
var Server = require('./Server');

var ids = 0;

/**
 * A client connected to the server
 *
 * @param {Socket} socket
 * @param {Server} server
 * @constructor
 */
function Client(socket, server) {
    EventEmitter.call(this);

    this.open = true;
    this.server = server;
    this.id = ids++;
    this._socket = socket;
    this._current = false;

    this.ready = false;

    var self = this;
    socket.on('error', function(e) {
        debug(e);
    });
    socket.on('close', function() {
        self.open = false;
        server.triggerHook('client.disconnect', self);
        self.emit('close');

        for (var i = 0; i < groups.length; i++) self.emit('leaveGroup', groups[i]);
    });

    this.ship = 0;
    //this.stations = [];

    var previousBuffer = null;

    /**
     * Reads a buffer
     *
     * @param buffer
     * @private
     */
    function readBuffer(buffer) {
        if (previousBuffer) {
            buffer = Buffer.concat([previousBuffer, buffer]);
            previousBuffer = null;
        }
        if (buffer.length < 24) {
            previousBuffer = buffer;
            return;
        }

        var header = new PacketHeader(buffer, self);
        if (buffer.length < header.packetLength) previousBuffer = buffer;

        // Perhaps we still have some data in the same packet
        if (header.data.buffer.length > header.packetLength) readBuffer(header.data.buffer.slice(header.packetLength));
    }
    socket.on('data', readBuffer);

    var groups = [];
    this.on('joinGroup', function(group) {
        groups.push(group);
        server.triggerHook('client.joinGroup', self, group);
    });
    this.on('leaveGroup', function(group) {
        var groupIndex = groups.indexOf(group);
        if (groupIndex !== -1) groups.splice(groupIndex, 1);
        server.triggerHook('client.leaveGroup', self, group);
    });

    server.triggerHook('client.connect', this);

    this.on('stateStart', function(state) {
        debug('Client ' + this.id + ' changed to ' + state + ' state');
    });
    this.switchTo(server._def);

}
util.inherits(Client, EventEmitter);

module.exports = Client;

/**
 * Emits a packet event on the client, server, and any ships
 *
 * @param {String} type
 * @param {Object} packet
 */
Client.prototype.doEmit = function(type, packet) {
    this.emit(type, packet);
    this.server.emit(type, this, packet);
    this.emit('packet', packet, type);
    this.server.emit('packet', this, packet, type);
};

/**
 * Get a state
 *
 * @param {String} name
 * @returns {Object}
 * @private
 */
Client.prototype._get = function(name) {
    if (!this.server._stateList || !this.server._stateList[name]) throw new Error('No state called ' + name);
    return this.server._stateList[name];
};

/**
 * Switches to a state
 *
 * @param {String} name
 * @returns {Client} this
 */
Client.prototype.switchTo = function(name) {
    if (this.current === name) return this;

    var newState = this._get(name);
    if (this._current) {
        if (this._current.stop) this._current.stop.apply(this._current._context, this.server._args);
        this.emit('stateStop', name);
        this.emit('stop.' + name);
    }

    this.current = name;
    var startArgs = this.server._args.slice();
    // Pass the previous context
    startArgs.push(this._current._context);
    this._current = newState;
    if (newState.start) newState.start.apply(newState._context, startArgs);

    this.emit('stateStart', name);
    this.emit('start.' + name);

    return this;
};

/**
 * Sends a packet to the client
 *
 * @param {String} packetName
 * @param {Object} data
 * @returns {Client} this
 */
Client.prototype.send = function(packetName, data) {
    if (!Server.packetsByName.hasOwnProperty(packetName)) return this;

    var packet = Server.packetsByName[packetName];
    if (!packet.pack) return this;

    // Declare a buffer big enough, and wrap it with our helpers
    var writer = new BufferReader(new Buffer(2048));
    writer.writeLong(0xdeadbeef);   // Magic number ("mmmm... deeaaad beeeeef")
    writer.writeLong(0);            // packetLength. Will need to re-write with real length later
    writer.writeLong(1);            // Origin = server
    writer.writeLong(0);            // Padding
    writer.writeLong(0);            // bytesRemaining. Will need to re-write with real length later
    writer.writeLong(packet.type);

    if (packet.subtypeLength === 1) writer.writeByte(packet.subtype);
    else if (packet.subtypeLength === 4) writer.writeLong(packet.subtype);
    packet.pack(writer, data); // todo: optimize

    // Packets with 1-byte subtype are packed to 4 bytes.
    // This means the last 00 is really the last 00000000 and
    // we need to advance the pointer a little bit.
    if (packet.subtypeLength === 1) writer.writeLong(0x00);

    // Rewrite packetLength and bytesRemaining
    writer.buffer.writeUInt32LE(writer.pointer, 4);
    writer.buffer.writeUInt32LE(writer.pointer - 20, 16);

    // Send the useful part of the buffer
    var usefulBuffer = writer.buffer.slice(0, writer.pointer);

    this._socket.write(usefulBuffer);
    return this;
};

Client.assignHooks = function(server) {
    server.hook('client.connect', function(client, next) {
        server.nextTick().then(function() {
            // Send welcome and version message
            var conf = server.config.server;
            debug('Client connected, sending welcome');

            client.send('welcome', { str: conf.welcome });
            client.send('version', {
                unknown: 0,
                major: conf.version.major,
                minor: conf.version.minor,
                patch: conf.version.patch
            });
        });

        // Add ready/not ready handlers
        client.on('ready', function() {
            // Make sure the client isn't ready before triggering
            if (!client.ready) server.triggerHook('client.ready', client);
        });
        /*client.on('notReady', function() {
            // Make sure the client is ready before triggering
            if (client.ready) server.triggerHook('client.notReady', client);
        });*/

        // To avoid the handle being cancelled from another client joining, don't wait for the next tick to continue
        next();
    });

    server.hook('client.ready', function(client, next) {
        client.ready = true;
        next();
    });

    server.hook('client.notReady', function(client, next) {
        client.ready = false;
        next();
    });

    server.hook('client.joinGroup', function(client, group, next) {
        group.clients.push(client);
        group.emit('addClient', client);
        next();
    });

    server.hook('client.leaveGroup', function(client, group, next) {
        var clientIndex = group.clients.indexOf(client);
        if (clientIndex !== -1) group.clients.splice(clientIndex, 1);
        group.emit('removeClient', client);
        next();
    });
};