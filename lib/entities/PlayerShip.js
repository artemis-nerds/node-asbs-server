var util = require('util');
var Ship = require('./Ship');
var Weapons = require('./Weapons');
var Entity = require('./Entity');
var enums = require('../enums');

var debug = require('debug')('artemis:entity:player');

/**
 * A ship controlled by players
 *
 * @param {Server} server
 * @param {Object} type
 * @param {Number} shipId
 * @param {Object} shipSettings
 * @param {Object} stations
 * @constructor
 * @inherits Entity
 */
function PlayerShip(server, type, shipId, shipSettings, stations) {
    Ship.apply(this, arguments);

    this._dmxFlags = {};
    this.stations = stations;

    this.shipId = shipId;
    this.driveType = shipSettings.driveType;
    this.type = shipSettings.type;
    this.name = shipSettings.name;

    this.weapons = new Weapons(server, this);
    this.addChild(this.weapons);

    this.disabled = true;

    this.decelerating = false;
    this.previousImpulse = 0;

    // Main screen perspective - 1 is third person, 0 is first person
    this.perspective = 1;

    var self = this;

    // Events
    stations.helm.on('setImpulse', function(client, packet) {
        server.triggerHook('player.setImpulse', self, packet.velocity);
    });

    stations.helm.on('setSteering', function(client, packet) {
        server.triggerHook('player.setRudder', self, packet.turn);
    });

    stations.weapons.on('beamFrequency', function(client, packet) {
        server.triggerHook('player.setBeamFrequency', self, enums.beamFrequency[packet.frequency]);
    });

    stations.weapons.on('toggleAutoBeams', function(client, packet) {
        server.triggerHook('player.toggleAutoBeams', self);
    });

    stations.weapons.on('togglePerspective', function(client, packet) {
        server.triggerHook('player.togglePerspective', self);
    });

    stations.weapons.on('toggleShields', function(client, packet) {
        server.triggerHook('player.toggleShields', self);
    });

    this.on('tick', function(delta) {
        server.triggerHook('player.update', self, delta);
    });

    // Initialize default properties
    this.props({
        weaponsTarget: 0,
        impulse: 0,
        rudder: server.config.ship.rudderCalibrate,
        maxImpulse: self.performance.topSpeed,
        turnRate: this.performance.turnRate,
        autoBeams: 1, // todo
        warp: 0, // todo
        energy: 1000, // todo
        shieldState: 0,
        shipNumber: parseInt(shipId) + 1,
        shipType: shipSettings.type,
        posX: 50000, // todo
        posY: 0, // todo
        posZ: 50000, // todo
        pitch: 0,
        roll: 0,
        heading: Math.PI,
        velocity: 0,
        unknown1: 0,
        shipName: shipSettings.name,
        forShields: 80, // todo
        forShieldsMax: 80, // todo
        aftShields: 80, // todo
        aftShieldsMax: 80, // todo
        docking: 0, // todo: id of the station im docking with
        redAlert: 0,
        unknown2: 200000,
        mainScreen: 0, // todo
        beamFrequency: enums.beamFrequency.A,
        coolantAvailable: 8, // todo
        scienceTarget: 0, // todo
        captainTarget: 0, // todo
        driveType: shipSettings.driveType,
        scanningTarget: 0, // todo
        scanningProgress: 11,
        reverse: 0,
        unknown3: 0, // Updated every time the dive/rise control is changed, values of 0 and -1 seen
        unknown4: 0, // Value of 2 seen, might be friend/enemy control?
        unknown5: 4294967295 // Value of -1 seen
    }, true);
}
util.inherits(PlayerShip, Ship);

PlayerShip.prototype.entityName = 'player';
PlayerShip.prototype.entityType = enums.objectType.player;

module.exports = PlayerShip;

/**
 * Finds if the auto beams are currently enabled
 *
 * @returns {boolean}
 */
PlayerShip.prototype.autoBeamsEnabled = function() {
    return !!this.prop('autoBeams');
};

/**
 * Toggles the auto beams on or off
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.toggleAutoBeams = function() {
    this.server.triggerHook('player.toggleAutoBeams', this);
    return this;
};

/**
 * Enables the auto beams
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.enableAutoBeams = function() {
    if (!this.prop('autoBeams')) this.server.triggerHook('player.enableAutoBeams', this);
    return this;
};

/**
 * Disables the auto beams
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.disableAutoBeams = function() {
    if (this.prop('autoBeams')) this.server.triggerHook('player.disableAutoBeams', this);
    return this;
};

/**
 * Finds if the shields are currently enabled
 *
 * @returns {boolean}
 */
PlayerShip.prototype.shieldsEnabled = function() {
    return !!this.prop('shieldState');
};

/**
 * Toggles the shields on or off
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.toggleShields = function() {
    this.server.triggerHook('player.toggleShields', this);
    return this;
};

/**
 * Enables the shields
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.enableShields = function() {
    if (!this.prop('shieldState')) this.server.triggerHook('player.enableShields', this);
};

/**
 * Disables the shields
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.disableShields = function() {
    if (this.prop('shieldState')) this.server.triggerHook('player.disableShields', this);
};

/**
 * Set the current warp level. Set to 0 to disable warp
 *
 * @param {Number} warp
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.setWarp = function(warp) {
    if (this.prop('warp') !== warp) this.server.triggerHook('player.setWarp', this, warp);
    return this;
};

/**
 * Get the current warp level
 *
 * @returns {Number}
 */
PlayerShip.prototype.getWarp = function() {
    return this.prop('warp');
};

/**
 * Enables a DMX flag
 * Calls the 'player.startDMX' flag
 *
 * @param {String} name
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.startDMX = function(name) {
    if (!this._dmxFlags[name]) this.server.triggerHook('player.startDMX', this, name);
    return this;
};

/**
 * Disables a DMX flag
 *
 * @param {String} name
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.stopDMX = function(name) {
    if (this._dmxFlags[name]) this.server.triggerHook('player.stopDMX', this, name);
    return this;
};

/**
 * Finds if the ship has a DMX flag enabled
 *
 * @param {String} name
 * @returns {Boolean}
 */
PlayerShip.prototype.hasDMX = function(name) {
    return this._dmxFlags[name] || false;
};

// Create 'while' utility functions
Entity.createWhiles(PlayerShip, {
    playDMX: function(start, end, args) {
        start(function() {
            this.startDMX(args[0]);
        });
        end(function() {
            this.stopDMX(args[0]);
        });
    }
});

// Assign default handle callbacks
PlayerShip.assignHooks = function(server) {
    // Update the player properties
    server.hook('player.update', function(player, delta, next) {
        // Make sure we always update *something*
        player.prop('energy', player.prop('energy'));
        var max = player.performance.topSpeed * player.prop('impulse');

        // Are we decelerating?
        if (player.prop('impulse') < player.previousImpulse) player.decelerating = true;

        // If not, add to the velocity
        if (!player.decelerating && player.prop('velocity') < max) {
            player.prop('velocity', player.prop('velocity') + 0.2);
        }

        // If yes, subtract from the velocity
        else if (player.decelerating && player.prop('velocity') > 0) player.prop('velocity', player.prop('velocity') - 0.2);

        // If we have finished decelerating, stop subtracting
        if (player.decelerating && player.prop('velocity') <= max) {
            player.decelerating = false;
        }

        // Prevent us from going backwards
        if (player.prop('velocity') < 0) player.prop('velocity', 0);

        next();
    });

    // Set the level of impulse for the player
    server.hook('player.setImpulse', function(player, impulse, next) {
        player.previousImpulse = player.prop('impulse');
        player.prop('impulse', impulse);
        next();
    });

    // Set the current rudder for the player
    server.hook('player.setRudder', function(player, rudder, next) {
        player.prop('rudder', rudder);
        next();
    });

    server.hook('player.setBeamFrequency', function(player, frequency, next) {
        player.prop('beamFrequency', enums.beamFrequency[frequency]);
        next();
    });

    server.hook('player.toggleAutoBeams', function(player, next) {
        if (player.prop('autoBeams')) server.triggerHook('player.disableAutoBeams', player);
        else server.triggerHook('player.enableAutoBeams', player);
        next();
    });

    server.hook('player.enableAutoBeams', function(player, next) {
        player.prop('autoBeams', 1);
        next();
    });

    server.hook('player.disableAutoBeams', function(player, next) {
        player.prop('autoBeams', 0);
        next();
    });

    server.hook('player.togglePerspective', function(player, next) {
        if (player.perspective) {
            player.perspective = 0;
            server.triggerHook('player.firstPersonPerspective', player);
        } else {
            player.perspective = 1;
            server.triggerHook('player.thirdPersonPerspective', player);
        }
        next();
    });

    server.hook('player.firstPersonPerspective', function(player, next) {
        player.stations.mainScreen.send('setPerspective', { view: player.perspective });
        next();
    });

    server.hook('player.thirdPersonPerspective', function(player, next) {
        player.stations.mainScreen.send('setPerspective', { view: player.perspective });
        next();
    });

    server.hook('player.toggleShields', function(player, next) {
        if (player.prop('shieldState')) server.triggerHook('player.disableShields', player);
        else server.triggerHook('player.enableShields', player);
        next();
    });

    server.hook('player.enableShields', function(player, next) {
        player.prop('shieldState', 1);
        next();
    });

    server.hook('player.disableShields', function(player, next) {
        player.prop('shieldState', 0);
        next();
    });

    server.hook('player.setWarp', function(player, warp, next) {
        player.prop('warp', warp);
        next();
    });

    // Enables a DMX flag
    server.hook('player.startDMX', function(player, name, next) {
        player.stations.mainScreen.send('dmxMessage', { str: name, on: 0x01 });
        player._dmxFlags[name] = true;
        next();
    });

    // Disables a DMX flag
    server.hook('player.stopDMX', function(player, name, next) {
        player.stations.mainScreen.send('dmxMessage', { str: name, on: 0x00 });
        player._dmxFlags[name] = false;
        next();
    });
};