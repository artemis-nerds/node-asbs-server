/**
 * A client groups manages a group of clients, allowing emitting to multiple clients, and
 * handling clients leaving/joining
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Server = require('./Server');
var debug = require('debug')('artemis:group');
var _ = require('lodash');

/**
 * Create a client group
 *
 * @param {Array.<Client>?} clients The default clients
 * @constructor
 */
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
 * @param {Array|ClientGroup} clients
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
    // Make sure we don't actually have this client yet
    if (this.clients.indexOf(client) === -1) {
        // To avoid EventEmitters complaining, let the client handle the connection
        client.emit('joinGroup', this);
    }
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
 * @param {Boolean} dynamic See ClientGroup#dynamicNot
 * @returns {ClientGroup}
 */
ClientGroup.prototype.not = function(group, dynamic) {
    return this.filter(function(client) {
        return group.clients.indexOf(client) === -1;
    }, dynamic);
};

/**
 * Creates a new client group containing all clients in this group but not in the other group
 * The difference between this and ClientGroup#in is that this group
 * will automatically add and remove clients when the base group
 * changes (not the provided group, though)
 *
 * @param {ClientGroup} group
 * @returns {ClientGroup}
 */
ClientGroup.prototype.dynamicNot = function(group) {
    this.not(group, true);
};

/**
 * Creates a new client group containing clients in both groups (opposite of #not)
 *
 * @param {ClientGroup} group
 * @param {Boolean} dynamic See ClientGroup#dynamicIn
 * @returns {ClientGroup}
 */
ClientGroup.prototype.in = function(group, dynamic) {
    return this.filter(function(client) {
        return group.clients.indexOf(client) !== -1;
    }, dynamic);
};

/**
 * Creates a new client group containing clients in both groups (opposite of #not)
 * The difference between this and ClientGroup#in is that this group
 * will automatically add and remove clients when the base group
 * changes (not the provided group, though)
 *
 * @param {ClientGroup} group
 */
ClientGroup.prototype.dynamicIn = function(group) {
    this.in(group, true);
};

/**
 * Joins a set of groups together
 *
 * @param {Boolean?} dynamic
 * @param {ClientGroup|Array.<ClientGroup>} groups
 * @returns {ClientGroup}
 */
ClientGroup.joinAll = function(dynamic, groups) {
    if (typeof dynamic === 'boolean') groups = [].slice.call(arguments, 1);
    else {
        groups = arguments;
        dynamic = false;
    }

    groups = _.flatten(groups);

    var groupLength = groups.length;
    if (!groupLength) return new ClientGroup();

    var newGroup = groups[0];
    for (var i = 1; i < groupLength; i++) {
        newGroup = newGroup.join(groups[i], dynamic);
    }
    return newGroup;
};

/**
 * Join this group with another set of groups.
 *
 * @param {Boolean?} dynamic Whether to dynamically join the groups
 * @param {ClientGroup} group
 */
ClientGroup.prototype.join = function(group, dynamic) {
    var newGroup = new ClientGroup(this.clients);
    newGroup.addClients(group.clients);

    if (dynamic) {
        var add, remove;
        group.on('addClient', add = function (client) {
            newGroup.addClient(client);
        });
        this.on('addClient', add);
        group.on('removeClient', remove = function (client) {
            newGroup.removeClient(client);
        });
        this.on('removeClient', remove);
    }
    return newGroup;
};

/**
 * Join this group with another set of groups.
 * The difference between this and ClientGroup#join is that this group
 * will automatically add and remove clients when the two joined groups
 * change.
 *
 * @param {ClientGroup} group
 * @returns {ClientGroup} The new group
 */
ClientGroup.prototype.dynamicJoin = function(group) {
    this.join(group, true);
};

/**
 * Calls the function for each client and returns a group containing all clients where the function returned true
 *
 * @param {Function} func
 * @param {Boolean} dynamic
 * @returns {ClientGroup}
 */
ClientGroup.prototype.filter = function(func, dynamic) {
    if (dynamic) return this.dynamicFilter(func);

    var clients = [];
    for (var i = 0; i < this.clients.length; i++) {
        var client = this.clients[i];
        if (func(client)) clients.push(client);
    }
    return new ClientGroup(clients);
};

/**
 * Dynamically filters this group, calling the filter function every time a client is added to this group
 *
 * @see ClientGroup#filter
 * @param {Function} func
 * @returns {ClientGroup}
 */
ClientGroup.prototype.dynamicFilter = function(func) {
    var newGroup = this.filter(func);

    this.on('addClient', function(client) {
        if (func(client)) newGroup.addClient(client);
    });
    this.on('removeClient', function(client) {
        newGroup.removeClient(client);
    });

    return newGroup;
};