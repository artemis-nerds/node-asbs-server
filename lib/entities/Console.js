var modelo = require('modelo');
var Entity = require('./Entity');
var ClientGroup = require('../ClientGroup');
var enums = require('../enums');

/**
 * A console belonging to a ship
 *
 * @constructor
 * @inherits Entity
 * @inherits ClientGroup
 */
function Console(server, name, clients) {
    Entity.apply(this, arguments);
    ClientGroup.call(this, clients);

    this.name = name;
    this.type = enums.consoleType[name];

    //this.addClients(clients);
}
modelo.inherits(Console, Entity, ClientGroup);

Console.prototype.entityName = 'console';
Console.prototype.entityType = null;

module.exports = Console;

// Assign default handle callbacks
Console.assignHooks = function(server) {
};