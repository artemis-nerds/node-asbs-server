/**
 * A client groups manages a group of clients, allowing emitting to multiple clients, and
 * handling clients leaving/joining
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

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
    if (typeof data !== "function") {
        var oldData = data;
        data = function() { return oldData; }
    }
    var i, clientsLength = this.clients.length, client;
    for (i = 0; i < clientsLength; i++) {
        client = this.clients[i];
        client.send(packetName, data(client));
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
    var i, clientsLength = this.clients.length, client;
    for (i = 0; i < clientsLength; i++) {
        client = this.clients[i];
        client.switchTo(name(client));
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