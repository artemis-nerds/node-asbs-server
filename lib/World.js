var entities = require('./entities');
var util = require('util');
var debug = require('debug')('artemis:world');

/**
 * A representation of all of the entities in the world
 *
 * @param {Server} server
 * @constructor
 */
function World(server) {
    entities.Entity.apply(this, arguments);

    var self = this;
    server.on('tick', function(delta) {
        self.emit('tick', delta);
    });

    // FIXME: randomly select a skybox - will need to be fixed in the future
    // skybox indexes are between 10 and 29
    this.skybox = Math.floor(Math.random() * 30) + 10;
    this.difficulty = 1; // todo
    this.gameType = 0; // todo

    this.width = 100000;
    this.height = 100000;
}
util.inherits(World, entities.Entity);

World.prototype.entityName = 'world';
World.prototype.entityType = false;

module.exports = World;

