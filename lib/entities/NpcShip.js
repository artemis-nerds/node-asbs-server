var util = require('util');
var _ = require('lodash');

var Ship = require('./Ship');
var Entity = require('./Entity');
var enums = require('../enums');

var debug = require('debug')('artemis:entity:npc');

/**
 * Gets n random items from arr
 *
 * @param {Array} arr The array to pick items from
 * @param {Number} n The number of items to pick
 * @returns {Array} The picked items
 * @throws RangeError if n > array length
 * @private
 */
function getRandomItems(arr, n) {
    var result = new Array(n), len = arr.length, taken = new Array(len);
    if (n > len) throw new RangeError('More elements taken then available');
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}

/**
 * Gets a random integer between min and max
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a set of taunts to be immune from. First, a random set of immunities are picked from the ones
 * available in vessel-data. The amount of immunities selected follows the minImmunities and maxImmunities
 * options. Then, for each of these immunities, the immunityChance will be compared with a random number,
 * and if it passes, the ship will have that immunity. If the amount of immunities selected is less than
 * the minimum amount of immunities, this process will be repeated with all non-selected immunities, and
 * added to the current set of immunities.
 *
 * This system means that the amount of immunities is weighted towards the lower end, preventing most ships
 * from having a large amount of immunities.
 *
 * @param {Server} server
 * @param {Array} taunts
 * @returns {Array}
 */
function pickImmunities(server, taunts) {
    // todo: hook
    var minPick = server.config.npc.minImmunities,
        maxPick = Math.min(taunts.length, server.config.npc.maxImmunities),
        amount = getRandomInt(minPick, maxPick);

    var rejected = [];
    var immunities = _.filter(getRandomItems(taunts, amount), function(item) {
        var notRejected = Math.random() < server.config.npc.immunityChance;
        if (!notRejected) rejected.push(item);
        return notRejected;
    });
    if (immunities.length < minPick && rejected.length >= minPick) return immunities.merge(pickImmunities(server, rejected));
    return immunities;
}

/**
 * A ship controlled by AI
 *
 * @param {Server} server
 * @param {Object} type
 * @param {Object} shipSettings
 * @constructor
 * @inherits Ship
 */
function NpcShip(server, type, shipSettings) {
    Ship.apply(this, arguments);

    var frequencies = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];

    var self = this;
    //self.name = 'ABC123'; // todo

    // Events
    this.on('receiveMessage', function(from, message) {
        if (message === 'surrender') {
            debug('NPC ' + self.name + ' received request to surrender');
            server.triggerHook('npc.receiveSurrenderRequest', self, from);
        } else {
            debug('NPC ' + self.name + ' received taunt');
            server.triggerHook('npc.receiveTaunt', self, from, message);
        }
    });

    // Initialize default properties
    this.props({
        impulse: 0,
        isEnemy: 0x01, // todo
        surrendered: 0x00, // todo
        //unknown4: 0,
        unknown5: 0,
        fleet: 255,
        eliteBits: 1496, // todo
        //eliteBitsActive: 816, // todo
        scanned: 0x00, // todo
        faction: 2,//type.faction, // todo maybe?
        unknown7: 4294967295,//2147483647,//4294967295,//4294967295,
        side: 1,
        unknown9: 255,    // changes every time?
        unknown10: 255, // changes every time?
        unknown11: 1,
        unknown12: -100000,
        //unknown13: 0,
        //unknown14: 0,
        damageBeams: 0,
        damageTorpedos: 0,
        damageManeuver: 0,
        damageImpulse: 0,
        damageWarp: 0,
        damageForShield: 0,
        damageAftShield: 0,
        shieldFreqA: frequencies[0],
        shieldFreqB: frequencies[1],
        shieldFreqC: frequencies[2],
        shieldFreqD: frequencies[3],
        shieldFreqE: frequencies[4]
    });

    var taunts = [], immunities = {};
    server.vesselData.then(function(data) {
        // todo: a bunch of this stuff should be moved to a hook

        taunts = data.factions[type.faction].taunts;
        var immuneTaunts = pickImmunities(server, _.map(taunts, function(val, id) {
            // We want the taunt index and immunity text
            return [id, val.immunity];
        }));

        // Convert the taunt list to an object
        for (var i = 0; i < immuneTaunts.length; i++) {
            var taunt = immuneTaunts[i];
            immunities[taunt[0]] = taunt[1];
        }
        console.log(taunts, immunities);
    });

    this.taunts = taunts;
    this.immunities = immunities;
    this.highestFrequency = frequencies.indexOf(Math.max.apply(Math, frequencies));
}
util.inherits(NpcShip, Ship);

NpcShip.prototype.entityName = 'npc';
NpcShip.prototype.entityType = enums.objectType.ship;

module.exports = NpcShip;

/**
 * Finds if the ship is immune to the message ID
 *
 * @param {String} taunt
 * @returns {Boolean}
 */
NpcShip.prototype.isImmuneTo = function(taunt) {
    switch (taunt) {
        case 'taunt1': return !!this.immunities[0];
        case 'taunt2': return !!this.immunities[1];
        case 'taunt3': return !!this.immunities[2];
        default: return false;
    }
};

NpcShip.assignHooks = function(server) {
    server.hook('npc.receiveSurrenderRequest', function(npc, player, next) {
        npc.sendMessageTo(player, "Ha ha, I won't fall for that!", 3);

        // todo
        next();
    });

    server.hook('npc.receiveTaunt', function(npc, player, taunt, next) {
        if (npc.isImmuneTo(taunt)) {
            npc.sendMessageTo(player, "That won't work on me!", 5);

            debug('NPC ' + npc.name + ' is immune to ' + taunt);
        } else {
            npc.sendMessageTo(player, "You've messed with the wrong guy, " + player.name, 0);

            debug('NPC ' + npc.name + ' is not immune to ' + taunt + '!');
        }

        // todo
        next();
    });
};