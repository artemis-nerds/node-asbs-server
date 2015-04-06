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

    var weapons = ship.stations.weapons;
    weapons.on('fireTube', function(client, packet) {
        server.triggerHook('weapons.fireTube', packet.tube);
    });

    // todo: prevent other stations from getting updates

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

console.log(Weapons.prototype.entityName, Weapons.prototype.entityType);

module.exports = Weapons;

// Assign default handle callbacks
Weapons.assignHooks = function(server) {
    server.hook('weapons.fireTube', function(tube, next) {
        // todo
    });
};