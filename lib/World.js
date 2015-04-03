var entities = require('./entities');
var util = require('util');

/**
 * A representation of all of the entities in the world
 *
 * @param {Server} server
 * @constructor
 */
function World(server) {
    entities.Entity.apply(this, arguments);

    var self = this;
    server.on('tick', function() {
        self.emit('tick');
    });

    this.skybox = 10; // todo
    this.difficulty = 1; // todo
    this.gameType = 0; // todo
}
util.inherits(World, entities.Entity);

World.prototype.entityName = 'world';
World.prototype.entityType = false;

module.exports = World;

