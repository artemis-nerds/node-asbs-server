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
    console.log("Weapons id", this.id);

    this.props({
        storesHoming: 8,
        storesNukes: 2,
        storesMines: 6,
        storesEMPs: 4,
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
};