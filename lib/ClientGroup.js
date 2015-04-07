/**
 * A client groups manages a group of clients, allowing emitting to multiple clients, and
 * handling clients leaving/joining
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Server = require('./Server');
var debug = require('debug')('artemis:group');

function ClientGroup(clients) {
    EventEmitter.call(this);

    this.clients = [];
    if (clients) this.addClients(clients);
}
util.inherits(ClientGroup, EventEmitter);

module.exports = ClientGroup;

/**
 * Send a packet to all clients in the group.
 *
 * @param {String} packetName The name of the packet
 * @param {Object|Function} data An object to send, or a function to compute the value
 * @returns {ClientGroup} this
 */
ClientGroup.prototype.send = function(packetName, data) {
    // If there are no clients, no point in sending anything
    if (!this.clients.length) return this;

    // Creates a buffer to send by calling the function
    function createBuffer(client) {
        return Server.packPacket(packetName, data(client));
    }

    // If data is not a function, we only need to create the buffer once
    // instead of packing for every client, as the data will always be
    // the same
    if (typeof data !== "function") {
        var buffer = Server.packPacket(packetName, data);
        createBuffer = function(client) {
            return buffer;
        };
    }

    var i, clientsLength = this.clients.length, client;
    for (i = 0; i < clientsLength; i++) {
        client = this.clients[i];
        client.sendBuffer(createBuffer(client));
    }
    return this;
};

/**
 * Switch all clients to the state
 *
 * @param {String|Function} name The name of the state, or a function to compute the value
 * @returns {ClientGroup} this
 */
ClientGroup.prototype.switchTo = function(name) {
    if (typeof name !== "function") {
        var oldName = name;
        name = function() { return oldName; }
    }
    var i, client;
    for (i = 0; i < this.clients.length; i++) {
        client = this.clients[i];
        client.switchTo(name(client));
        if (this.clients[i] !== client) i--;
    }
    return this;
};

/**
 * Adds a set of clients to the group
 *
 * @param {Array<Client>|ClientGroup} clients
 * @returns {ClientGroup} this
 */
ClientGroup.prototype.addClients = function(clients) {
    if (clients instanceof ClientGroup) clients = clients.clients; // um...
    if (clients.length == null) throw new TypeError('clients is not an array-like');
    for (var i = 0; i < clients.length; i++) this.addClient(clients[i]);
    return this;
};

/**
 * Add a single client to the group
 *
 * @param {Client} client
 * @returns {ClientGroup} this
 */
ClientGroup.prototype.addClient = function(client) {
    // To avoid EventEmitters complaining, let the client handle the connection
    client.emit('joinGroup', this);
    return this;
};

/**
 * Removes a single client from the group
 *
 * @param {Client} client
 * @returns {ClientGroup} this
 */
ClientGroup.prototype.removeClient = function(client) {
    // To avoid EventEmitters complaining, let the client handle the disconnection
    client.emit('leaveGroup', this);
    return this;
};

/**
 * Creates a new client group containing all clients in this group but not in the other group
 *
 * @param {ClientGroup} group
 * @returns {ClientGroup}
 */
ClientGroup.prototype.not = function(group) {
    return this.filter(function(client) {
        return group.clients.indexOf(client) === -1;
    });
};

/**
 * Creates a new client group containing all clients in both groups
 *
 * @param {ClientGroup} group
 * @returns {ClientGroup}
 */
ClientGroup.prototype.in = function(group) {
    return this.filter(function(client) {
        return group.clients.indexOf(client) !== -1;
    });
};

/**
 * Calls the function for each client and returns a group containing all clients where the function returned true
 *
 * @param {Function} func
 * @returns {ClientGroup}
 */
ClientGroup.prototype.filter = function(func) {
    var clients = [];
    for (var i = 0; i < this.clients.length; i++) {
        var client = this.clients[i];
        if (func(client)) clients.push(client);
    }
    return new ClientGroup(clients);
};