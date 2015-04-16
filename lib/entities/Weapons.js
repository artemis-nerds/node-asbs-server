var util = require('util');
var Entity = require('./Entity');
var enums = require('../enums');

/**
 * The weapons system in a ship
 *
 * @constructor
 * @inherits Entity
 */
function Weapons(server, ship) {
    Entity.apply(this, arguments);

    this.id = ship.id;
    this.ship = ship;

    var weapons = ship.consoles.weapons;

    var self = this;
    weapons.on('fireTube', function(client, packet) {
        server.triggerHook('weapons.fireTube', self, packet.tube);
    });

    weapons.on('loadTube', function(client, packet) {
        server.triggerHook('weapons.loadTube', self, packet.tube, packet.ordnance);
    });

    weapons.on('unloadTube', function(client, packet) {
        server.triggerHook('weapons.unloadTube', self, packet.tube);
    });

    weapons.on('convertTorpedo', function(client, packet) {
        server.triggerHook('weapons.convertTorpedo', self, packet.direction);
    });

    // todo: prevent other consoles from getting updates

    this.props({
        storesHoming: ship.torpedoStorage[0],
        storesNukes: ship.torpedoStorage[1],
        storesMines: ship.torpedoStorage[2],
        storesEMPs: ship.torpedoStorage[3],
        unknown1: 116,
        unloadTime1: 0,
        unloadTime2: 0,
        unloadTime3: 0,
        unloadTime4: 0,
        unloadTime5: 0,
        unloadTime6: 0,
        tubeUsed1: 0,
        tubeUsed2: 0,
        tubeUsed3: 0,
        tubeUsed4: 0,
        tubeUsed5: 0,
        tubeUsed6: 0,
        tubeContents1: 0,
        tubeContents2: 0,
        tubeContents3: 0,
        tubeContents4: 0,
        tubeContents5: 0,
        tubeContents6: 0
    }, true);
}
util.inherits(Weapons, Entity);

Weapons.prototype.entityName = 'weapons';
Weapons.prototype.entityType = enums.objectType.wepConsole;

module.exports = Weapons;

// Assign default handle callbacks
Weapons.assignHooks = function(server) {
    server.hook('weapons.fireTube', function(weap, tube, next) {
        // todo
    });

    server.hook('weapons.loadTube', function(weap, tube, ordnance, next) {
        // todo
    });

    server.hook('weapons.unloadTube', function(weap, tube, next) {
        // todo
    });

    server.hook('weapons.convertTorpedo', function(weap, direction, next) {
        // todo
    });
};
