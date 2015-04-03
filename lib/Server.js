var modelo = require('modelo');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var HookEmitter = require('hookjs');
var Promise = require('bluebird');
var debug = require('debug')('artemis:server'), error = require('debug')('artemis:error');
var _ = require('lodash');

var defaultConfig = require('./config');

var packetList = require('./packets');
var entities = require('./entities');
var vesselData = require('./vesselData');
var states = require('./states');

var StateManager = require('./StateManager');
var World = require('./World');
var ClientGroup = require('./ClientGroup');

var knownPackets = {}, knownSubPackets = {}, packetsByName = {};

// Load all packets
recursiveRegisterPacket(packetList);

/**
 * Import known packet types recursively from an object
 *
 * @param {Object} packets
 * @private
 */
function recursiveRegisterPacket(packets) {
    var key, packet;
    for (key in packets) {
        if (!packets.hasOwnProperty(key)) continue;
        packet = packets[key];
        if (packet.doExpand) recursiveRegisterPacket(packet);
        else registerPacketType(packet);
    }
}

/**
 * Registers a new packet type
 *
 * @param {Object} packet
 * @private
 */
function registerPacketType(packet) {
    if (packet.subtype === null) {
        knownPackets[packet.type] = packet;
        knownPackets[packet.type].subpackets = false;
    } else {
        knownPackets[packet.type] = {
            type: packet.type,
            name: 'subpacket',
            subpackets: true,
            subtypeLength: packet.subtypeLength
        };
        if (!knownSubPackets.hasOwnProperty(packet.type)) knownSubPackets[packet.type] = {};
        knownSubPackets[packet.type][packet.subtype] = packet;
    }
    packetsByName[packet.name] = packet;
}

/**
 * An Artemis server
 *
 * @param {Object} config Configuration options for the server
 *
 * @constructor
 * @inherits StateManager
 * @inherits HookEmitter
 */
function Server(config) {
    EventEmitter.call(this);
    HookEmitter.call(this);
    ClientGroup.call(this);

    config = this.config = _.defaults({}, config || {}, defaultConfig);
    this.open = false;
    this.paused = false;

    //this.stateManager = new StateManager('lobby', this);
    this.world = new World(this);

    this.vesselData = vesselData(config);

    //var clients = this.clients = [];
    var server = net.createServer(), self = this;

    this._server = server;

    // Register all entity hooks
    var entityName;
    for (entityName in entities) {
        if (!entities.hasOwnProperty(entityName)) continue;
        entities[entityName].assignHooks(this);
    }
    Client.assignHooks(this);

    // Start loop when the server starts
    server.on('listening', function() {
        self.open = true;
        debug('Server is listening');

        // Start heartbeat loop
        if (config.server.heartbeat) {
            var hbInterval = setInterval(function () {
                if (!self.open) return clearInterval(hbInterval);
                self.send('heartbeat', {});
            }, config.server.heartbeat);
        }

        // Start tick loop
        if (config.server.tickSpeed < 1) throw new Error('Tick speed must be greater than 0');
        var loopSpeed = 1 / config.server.tickSpeed, lastUpdate = process.hrtime();
        function doLoop() {
            if (!self.open) return;

            var deltaHr = process.hrtime(lastUpdate),
                delta = deltaHr[0] * 1000 + (deltaHr[1] / 1000000);

            if (!self.paused) self.emit('tick', delta);

            lastUpdate = process.hrtime();
            setTimeout(doLoop, loopSpeed - delta);
        }
        setTimeout(doLoop, loopSpeed);

        self.emit('listening');
    });

    // Create custom client object on connection
    server.on('connection', function(socket) {
        var client = new Client(socket, self);
        self.addClient(client);

        var remoteAddr = socket.remoteAddress;
        debug('Connection from ' + remoteAddr + ' (id ' + client.id + '), ' + self.clients.length + ' client(s) connected');

        client.on('close', function() {
            debug('Lost connection from ' + remoteAddr + ' (id ' + client.id + '), ' + (self.clients.length - 1) + ' client(s) connected');
        });

        self.emit('connection', client);
    });
    server.on('closed', function(err) {
        self.open = false;
        self.emit('closed', err);
    });

    var totalTries = 3, currentTries = 0;
    function retry(msg, done) {
        if (currentTries >= totalTries) {
            debug('Retrying failed.');
            currentTries = 0;
            return done();
        }

        debug(msg + ', retrying... (' + (++currentTries) + '/' + totalTries + ')');
        setTimeout(function() {
            if (server.open) server.close();
            self.listen();
        }, 1000);
    }

    var currentPortTries = 0;
    server.on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            error('Address in use!');
            retry('Server address or port is in use', function() {
                if (currentPortTries >= totalTries) {
                    debug('Stopping retrying.');
                    currentPortTries = 0;
                    return;
                }

                debug('Incrementing port and trying again... (' + (++currentPortTries) + '/' + totalTries + ')');
                setTimeout(function() {
                    config.server.port++;
                    if (server.open) server.close();
                    self.listen();
                });
            });
        } else debug('Failed due to an unknown error!');
    });

    // Initialize states
    this._def = 'lobby';
    this._stateList = {};
    for (var name in states) {
        if (!states.hasOwnProperty(name)) continue;
        var state = states[name];
        if (typeof state !== 'function') throw new TypeError('Expected state function, got ' + typeof state);
        state._proxy = new StateProxy(name, this);
        this._stateList[name] = state;

        state.call(state._proxy, state._proxy, this);
    }

    if (!this._stateList[this._def]) {
        this._stateList[this._def] = function() {};
    }

    this.switchTo(this._def);
}
modelo.inherits(Server, EventEmitter, HookEmitter, ClientGroup);

Server.knownPackets = knownPackets;
Server.knownSubPackets = knownSubPackets;
Server.packetsByName = packetsByName;

module.exports = Server;

var StateProxy = require('./StateProxy');
var Client = require('./Client');

/**
 * Starts the server listening
 *
 * @param {Function?} started A callback for when the server begins listening for connections
 * @returns {Server} this
 */
Server.prototype.listen = function(started) {
    var self = this, config = this.config;
    debug('Starting listening on port ' + config.server.port);
    this._server.listen(config.server.port, function () {
        if (started) started();
    });
    return this;
};

/**
 * Closes the server
 *
 * @param {Function?} stopped A callback for when the server is closed
 * @returns {Server} this
 */
Server.prototype.close = function(stopped) {
    this._server.close(function() {
        if (stopped) stopped();
    });
    return this;
};

/**
 * Resolves the promise on the next tick
 *
 * @returns {Promise}
 */
Server.prototype.nextTick = function() {
    var self = this;
    return (new Promise(function(resolve, reject) {
        self.once('tick', function(delta) {
            resolve(delta);
        });
    })).bind(this);
};

/**
 * Waits a certain amount of time and then resolves the promise
 *
 * @param {Number} time Time to wait in milliseconds
 * @returns {Promise}
 */
Server.prototype.wait = function(time) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var remainingTime = time, f, finished = false;

        self.on('tick', f = function(delta) {
            remainingTime -= delta;
            if (!finished && remainingTime <= 0) {
                self.removeListener('tick', f);
                finished = true;
                resolve();
            }
        });
    });
};

/**
 * Gets a state. This shouldn't normally be used, and is only available for client state management.
 *
 * @param {String} name
 * @returns {Object}
 * @throws Error if the state doesn't exist
 */
Server.prototype.getState = function(name) {
    if (!this._stateList || !this._stateList[name]) throw new Error('No state called ' + name);
    return this._stateList[name];
};

/**
 * Gets the proxy object for a certain state
 *
 * @param {String} name
 * @returns {StateProxy} proxy
 */
Server.prototype.getProxy = function(name) {
    var state = this.getState(name);
    return state._proxy;
};