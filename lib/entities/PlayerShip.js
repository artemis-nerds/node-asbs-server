var util = require('util');
var _ = require('lodash');

var Ship = require('./Ship');
var Entity = require('./Entity');
var enums = require('../enums');
var ClientGroup = require('../ClientGroup');

var Weapons = require('./Weapons');
var Helm = require('./Helm');
var Comms = require('./Comms');

var debug = require('debug')('artemis:entity:player');

/**
 * A ship controlled by players
 *
 * @param {Server} server
 * @param {Object} type
 * @param {Object} shipSettings
 * @param {Number} shipId
 * @param {Object} consoles
 * @constructor
 * @inherits Ship
 */
function PlayerShip(server, type, shipSettings, shipId, consoles) {
    Ship.apply(this, arguments);

    this._dmxFlags = {};
    this.consoles = consoles;

    this.shipId = shipId;
    this.driveType = shipSettings.driveType;
    this.type = shipSettings.type;
    //this.name = //shipSettings.name;

    // Create console entities
    this.weapons = new Weapons(server, this);
    this.helm = new Helm(server, this);
    this.comms = new Comms(server, this);
    this.addChild(this.weapons);
    this.addChild(this.helm);
    this.addChild(this.comms);

    this.disabled = true;

    this.decelerating = false;
    this.previousImpulse = 0;

    // Main screen perspective - 1 is third person, 0 is first person
    this.perspective = 1;

    var self = this;

    var allGroups = this.allGroups = ClientGroup.joinAll(true, _.values(consoles));

    // Events
    // todo: move these to their consoles
    allGroups.on('beamFrequency', function(client, packet) {
        server.triggerHook('player.setBeamFrequency', self, enums.beamFrequency[packet.frequency]);
    });

    allGroups.on('toggleAutoBeams', function(client, packet) {
        server.triggerHook('player.toggleAutoBeams', self);
    });

    allGroups.on('togglePerspective', function(client, packet) {
        server.triggerHook('player.togglePerspective', self);
    });

    allGroups.on('toggleShields', function(client, packet) {
        server.triggerHook('player.toggleShields', self);
    });

    allGroups.on('toggleRedAlert', function(client, packet) {
        server.triggerHook('player.toggleRedAlert', self);
    });

    allGroups.on('mainScreen', function(client, packet) {
        server.triggerHook('player.setMainScreen', self, enums.mainScreenView[packet.view]);
    });

    this.on('tick', function(delta) {
        server.triggerHook('player.update', self, delta);
    });

    this.on('receiveMessage', function(from, message) {
        var messageText = server.config.comms.playerMessages[message];
        debug('Player ' + shipSettings.name + ' received message: "' + messageText[0] + '"');
        server.triggerHook('player.receiveMessage', self, messageText[0], messageText[1], from);
    });

    // Initialize default properties
    this.props({
        weaponsTarget: 0,
        impulse: 0,
        autoBeams: 1, // todo
        warp: 0, // todo
        energy: 1000, // todo
        shieldState: 0,
        shipNumber: parseInt(shipId) + 1,
        unknown1: 0,
        docking: 0, // todo: id of the base im docking with
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
        unknown4: 2, // Value of 2 seen, might be friend/enemy control?
        unknown5: 4294967295 // Value of -1 seen
    }, true);
}
util.inherits(PlayerShip, Ship);

PlayerShip.prototype.entityName = 'player';
PlayerShip.prototype.entityType = enums.objectType.player;

module.exports = PlayerShip;

// todo: all of the below utility functions should use hooks

/**
 * Gives a message to this ships comms officer
 *
 * @param {Entity} from The entity sending the message
 * @param {String} message The message text
 * @param {Number=8} priority The message priority from 0 to 8, where 8 is the lowest
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.getMessageFrom = function(from, message, priority) {
    if (priority == null) priority = 8;
    this.server.triggerHook('player.receiveMessage', this, message, priority, from);
    return this;
};

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
    return this;
};

/**
 * Disables the shields
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.disableShields = function() {
    if (this.prop('shieldState')) this.server.triggerHook('player.disableShields', this);
    return this;
};

/**
 * Toggles the red alert on or off
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.toggleRedAlert = function() {
    this.server.triggerHook('player.toggleRedAlert', this);
    return this;
};

/**
 * Enables red alert
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.enableRedAlert = function() {
    if (!this.prop('redAlert')) this.server.triggerHook('player.enableRedAlert', this);
    return this;
};

/**
 * Disables red alert
 *
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.disableRedAlert = function() {
    if (this.prop('redAlert')) this.server.triggerHook('player.disableRedAlert', this);
    return this;
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
 * Sets the display on the main screen
 *
 * @param {String} screen Should be one of the items in enums.mainScreenView
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.setMainScreen = function(screen) {
    if (this.getMainScreen() !== screen) this.server.triggerHook('player.setMainScreen', this, screen);
    return this;
};

/**
 * Gets the current main screen view
 *
 * @returns {String}
 */
PlayerShip.prototype.getMainScreen = function() {
    return enums.mainScreenView[this.prop('mainScreen')];
};

/**
 * Sets the beam frequency
 *
 * @param {String} frequency A-E, case insensitive
 * @returns {PlayerShip}
 */
PlayerShip.prototype.setBeamFrequency = function(frequency) {
    frequency = frequency.toUpperCase();
    if (this.getBeamFrequency() !== frequency) this.server.triggerHook('player.setBeamFrequency', this, frequency);
    return this;
};

/**
 * Gets the current beam frequency
 *
 * @returns {String}
 */
PlayerShip.prototype.getBeamFrequency = function() {
    return enums.beamFrequency[this.prop('beamFrequency')];
};

/**
 * Gives the ship more coolant
 *
 * @param {Number=1} amount The amount to add
 * @returns {Number} The new amount of coolant
 */
PlayerShip.prototype.addCoolant = function(amount) {
    if (amount !== 0) this.server.triggerHook('player.addCoolant', amount == null ? 1 : amount);
    return this.prop('coolantAvailable');
};

/**
 * Takes some coolant from the ship
 *
 * @param {Number=1} amount The amount to remove
 * @returns {Number} The new amount of coolant
 */
PlayerShip.prototype.removeCoolant = function(amount) {
    if (amount !== 0) this.server.triggerHook('player.removeCoolant', amount == null ? 1 : amount);
    return this.prop('coolantAvailable');
};

/**
 * Sets the coolant in the ship
 *
 * @param {Number} amount
 * @returns {PlayerShip} this
 */
PlayerShip.prototype.setCoolant = function(amount) {
    if (this.prop('coolantAvailable') !== amount) this.server.triggerHook('player.setCoolant', amount);
    return this;
};

/**
 * Gets the amount of coolant in the ship
 *
 * @returns {Number} The amount of coolant
 */
PlayerShip.prototype.getCoolant = function() {
    return this.prop('coolantAvailable');
};

/**
 * Docks with a certain base
 * Todo
 *
 * @param {Base} base
 * @returns {Ship} this
 */
PlayerShip.prototype.dockWith = function(base) {
    throw new TypeError('Hold up - I\'m not ready yet!');
};


// todo: more utility functions, whiles

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

        var impulse = player.prop('impulse'), warp = player.prop('warp');
        if (player.prop('reverse')) impulse *= -1;

        //if (warp) impulse *= warp * 10;

        //var multiplier = warp ? warp * 10 : 1;


        var max = player.performance.topSpeed * impulse * server.config.ship.maxVelocityCoeff * (warp ? warp * server.config.ship.warpVelocityCoeff : 1);
        var deceleration = server.config.ship.decelerationSpeed * (warp ? warp * server.config.ship.warpDecelerationCoeff : 1);
        var acceleration = server.config.ship.accelerationSpeed * (warp ? warp * server.config.ship.warpAccelerationCoeff : 1);

        // Slow down if we are above the max
        if (player.prop('velocity') > max) player.prop('velocity', player.prop('velocity') - deceleration * delta);

        // Otherwise, add to the velocity
        if (player.prop('velocity') < max) player.prop('velocity', player.prop('velocity') + acceleration * delta);

        if (player.prop('velocity') < deceleration * delta && player.prop('velocity') !== 0) player.prop('velocity', 0);

        next();



        // Make sure we always update *something*
        /*player.prop('energy', player.prop('energy'));

        var impulse = player.prop('impulse');
        if (player.prop('reverse')) impulse *= -1;

        var max = player.performance.topSpeed * impulse * server.config.ship.maxVelocityCoeff;

        // Are we decelerating?
        if (impulse < player.previousImpulse) player.decelerating = true;

        // If not, add to the velocity
        if (!player.decelerating && player.prop('velocity') < max) {
            player.prop('velocity', player.prop('velocity') + server.config.ship.accelerationSpeed * delta);
        }

        // If yes, subtract from the velocity
        else if (player.decelerating && player.prop('velocity') > 0) player.prop('velocity', player.prop('velocity') - server.config.ship.decelerationSpeed * delta);

        // If we have finished decelerating, stop subtracting
        if (player.decelerating && player.prop('velocity') <= max) {
            player.decelerating = false;
        }

        // Prevent us from going backwards
        var min = player.prop('reverse') ? max : 0;
        if (player.prop('velocity') < min) player.prop('velocity', min);

        console.log('Velocity is', player.prop('velocity'), 'max is', max, 'min is', min);

        next();*/
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
        player.consoles.mainScreen.send('setPerspective', { view: player.perspective });
        next();
    });

    server.hook('player.thirdPersonPerspective', function(player, next) {
        player.consoles.mainScreen.send('setPerspective', { view: player.perspective });
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

    server.hook('player.toggleRedAlert', function(player, next) {
        if (player.prop('redAlert')) server.triggerHook('player.disableRedAlert', player);
        else server.triggerHook('player.enableRedAlert', player);
        next();
    });

    server.hook('player.enableRedAlert', function(player, next) {
        player.prop('redAlert', 1);
        next();
    });

    server.hook('player.disableRedAlert', function(player, next) {
        player.prop('redAlert', 0);
        next();
    });

    server.hook('player.setWarp', function(player, warp, next) {
        if (warp !== 0) player.prop('impulse', 1);
        player.prop('warp', warp);
        next();
    });

    server.hook('player.setMainScreen', function(player, screen, next) {
        player.prop('mainScreen', enums.mainScreenView[screen]);
        next();
    });

    server.hook('player.setBeamFrequency', function(player, frequency, next) {
        player.prop('beamFrequency', enums.beamFrequency[frequency]);
        next();
    });

    server.hook('player.addCoolant', function(player, amount, next) {
        server.triggerHook('player.setCoolant', player.prop('coolantAvailable') + amount);
        next();
    });

    server.hook('player.removeCoolant', function(player, amount, next) {
        server.triggerHook('player.setCoolant', player.prop('coolantAvailable') - amount);
        next();
    });

    server.hook('player.setCoolant', function(player, amount, next) {
        player.prop('coolantAvailable', amount);
        next();
    });

    server.hook('player.receiveMessage', function(player, message, priority, from, next) {
        console.log(from, from.name);
        player.consoles.communications.send('commsIncoming', {
            priority: priority,
            sender: from.name,
            msg: message
        });
        next();
    });

    // Enables a DMX flag
    server.hook('player.startDMX', function(player, name, next) {
        player.consoles.mainScreen.send('dmxMessage', { str: name, on: 0x01 });
        player._dmxFlags[name] = true;
        next();
    });

    // Disables a DMX flag
    server.hook('player.stopDMX', function(player, name, next) {
        player.consoles.mainScreen.send('dmxMessage', { str: name, on: 0x00 });
        player._dmxFlags[name] = false;
        next();
    });
};
