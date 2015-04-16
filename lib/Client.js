var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('artemis:client'), error = require('debug')('artemis:error');

var PacketHeader = require('./PacketHeader');
var BufferReader = require('./BufferReader');
var Server = require('./Server');
var StateProxy = require('./StateProxy');

var ids = 0;

// Because I was bored
var messages = [
    'Why would you do this to me?',
    'Mmmmmm.... packets.....',
    'Chunky!',
    'Thats not right!',
    'Dang.'
];

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

        while (groups.length) {
            self.emit('leaveGroup', groups[groups.length - 1]);
        }
    });

    this.ship = 0;
    //this.consoles = [];

    var previousBuffer = null;

    /**
     * Reads a buffer
     *
     * @param buffer
     * @private
     */
    function readBuffer(buffer) {
        try {
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
        } catch (ex) {
            error(messages[Math.floor(Math.random() * messages.length)]);
            //error(ex);
            error(ex.message);
            error(ex.stack);
            error('Kicking client');
            socket.destroy();
        }
    }
    socket.on('data', readBuffer);

    var groups = this._groups = [];
    this.on('joinGroup', function(group) {
        groups.push(group);
        server.triggerHook('client.joinGroup', self, group);
    });
    this.on('leaveGroup', function(group) {
        var groupIndex = groups.indexOf(group);
        if (groupIndex !== -1) {
            groups.splice(groupIndex, 1);
            server.triggerHook('client.leaveGroup', self, group);
        }
    });

    this.on('stateStart', function(state) {
        debug('Client ' + this.id + ' changed to ' + state + ' state');
    });
    this.switchTo(server._def);

    server.triggerHook('client.connect', this);

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
    this.emit('packet', packet, type);

    //console.log("Received", type);
    for (var i = 0; i < this._groups.length; i++) {
        var group = this._groups[i];
        // This prevents events from being emitted twice
        if (group._clientDontEmit) continue;
        group.emit(type, this, packet);
        group.emit('packet', this, packet, type);
    }
};

/**
 * Switches to a state
 *
 * @param {String} name
 * @returns {Client} this
 */
Client.prototype.switchTo = function(name) {
    if (this.current === name) return this;

    var newState = this.server.getState(name);
    if (this._current) {
        //var currentIndex = this._current._proxy._proxyClients.indexOf(this);
        //if (currentIndex !== -1) this._current._proxy._proxyClients.splice(currentIndex, 1);
        this._current._proxy.removeClient(this);
        this.emit('stateStop', name);
        this.emit('stop.' + name);
    }

    this.current = name;
    this._current = newState;
    this._current._proxy.addClient(this);
    this.emit('stateStart', name);
    this.emit('start.' + name);
    if (!this._current._hasTriggered) {
        this._current._hasTriggered = true;
        this.server.triggerHook('{' + name + '}.enable');
    }
    this.server.triggerHook('{' + name + '}.join', this);

    return this;
};

/**
 * Sends a pre-packed buffer to the client
 *
 * @param {Buffer} buffer
 * @returns {Client} this
 */
Client.prototype.sendBuffer = function(buffer) {
    this._socket.write(buffer);
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
    return this.sendBuffer(Server.packPacket(packetName, data));
};

Client.assignHooks = function(server) {
    server.hook('client.connect', function(client, next) {
        //server.nextTick().then(function() {
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
        //});

        // Add ready/not ready handlers
        client.on('ready', function() {
            // Make sure the client isn't ready before triggering
            if (client.ready) return;
            client.ready = true;
            server.triggerHook('client.ready', client);
        });

        // To avoid the handle being cancelled from another client joining, don't wait for the next tick to continue
        next();
    });

    server.hook('client.ready', function(client, next) {
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
