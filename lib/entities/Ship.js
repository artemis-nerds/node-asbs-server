var Entity = require('./Entity');
var util = require('util');
var Promise = require('bluebird');

var pi2 = Math.PI * 2;

/**
 * A generic ship
 *
 * @param {Server} server
 * @param {Object} type
 * @param {Object} shipSettings
 * @constructor
 * @inherits Entity
 */
function Ship(server, type, shipSettings) {
    Entity.apply(this, arguments);

    // Ship info
    //this.type = type.uniqueID;
    this.faction = type.faction;
    this.classname = type.classname;
    this.beams = type.beams;
    this.torpedoStorage = type.torpedoStorage;
    this.description = type.description;
    this.grid = type.grid;

    this.performance = {
        turnRate: type.performance.turnrate,
        topSpeed: type.performance.topspeed,
        efficiency: type.performance.efficiency
    };

    var self = this;
    this.on('tick', function(delta) {
        server.triggerHook('ship.update', self, delta);
    });

    // Initialize default properties
    this.props({
        shipType: type.uniqueID,
        shipName: shipSettings.name,
        rudder: server.config.ship.rudderCalibrate,
        maxImpulse: this.performance.topSpeed,
        turnRate: this.performance.turnRate,
        posX: 50000, // todo
        posY: 0, // todo
        posZ: 50000, // todo
        pitch: 0, // todo: modifier functions
        roll: 0, // todo: modifier functions
        heading: Math.PI, // todo
        velocity: 0,
        forShields: type.frontShields,
        forShieldsMax: type.frontShields,
        aftShields: type.rearShields,
        aftShieldsMax: type.rearShields
    });
}
util.inherits(Ship, Entity);

Ship.prototype.entityName = 'ship';

module.exports = Ship;

/**
 * Converts degrees to Artemis' angle format, with wrapping
 *
 * @param {Number} deg
 * @returns {Number}
 */
Ship.toRad = function(deg) {
    // Wrap degrees
    deg %= 360;
    if (deg < 0) deg += 360;

    return (deg * Math.PI / 180) - Math.PI;
};

/**
 * Add two of Artemis' angles, with wrapping
 *
 * @param {Number} prev
 * @param {Number} add
 * @returns {number}
 */
Ship.addRad = function(prev, add) {
    prev = (prev + add + Math.PI) % pi2 - Math.PI;
    if (prev < -Math.PI) prev += pi2;
    return prev;
};

// todo: all of the below utility functions should use hooks

/**
 * Sends a message from this ship to a player ship
 *
 * @param {PlayerShip} to The ship to send to
 * @param {String} message The message text
 * @param {Number=8} priority The message priority from 0 to 8, where 8 is the lowest
 * @returns {Ship} this
 */
Ship.prototype.sendMessageTo = function(to, message, priority) {
    to.getMessageFrom(this, message, priority);
    return this;
};

/**
 * Turns the ship until it is facing a bearing
 *
 * @param {Number} bearing The true bearing, where 0 is north, 90 is east, 180 is south, etc
 * @returns {Promise} Resolved when turning is complete
 */
Ship.prototype.turnTo = function(bearing) {
    // Convert degrees to Artemis' format and turn
    return this.turnToRad(Ship.toRad(bearing));
};

Ship.prototype.turnToRad = function(rad) {
    var self = this;

    return new Promise(function(resolve, reject) {
        // Which way do we have to turn?
        // todo: this will need to be fixed to account for wrapping from 360 -> 0
        var rudderCenter = this.server.config.ship.rudderCalibrate;
        var newRudder = rudderCenter;
        if (rad < self.prop('heading')) newRudder = 0;
        else if (rad > self.prop('heading')) newRudder = 1;
        else return resolve(); // We are already facing the required direction

        self.prop('rudder', newRudder);

        var f;
        self.on('tick', f = function(delta) {
            // If we have reached the required bearing
            if ((newRudder < rudderCenter && self.prop('heading') <= rad) ||
                (newRudder > rudderCenter && self.prop('heading') >= rad) ||
                newRudder === rudderCenter) {
                // Reset the rudder
                self.prop('rudder', rudderCenter);

                // Stop listening for ticks
                self.removeListener('tick', f);

                // Resolve the promise
                resolve();
            }
        });
    });
};

/**
 * Turns the ship until it is facing a bearing relative to the current bearing
 *
 * @param {Number} bearing The relative bearing, where 180 flips around, 90 turns starboard, -90 points port, etc
 * @returns {Promise} Resolved when turning is complete
 */
Ship.prototype.turn = function(bearing) {
    return this.turnToRad(Ship.addRad(this.prop('heading'), Ship.toRad(bearing)));
};

/**
 * Points the ship at a certain angle. By default turns to that direction with the rudder
 * (equivalent to calling 'turnTo'). To look the direction immediately, pass 'true' to the first parameter
 *
 * @param {Number} deg The angle
 * @param {Boolean} snap Whether to snap straight to that angle
 * @returns {Ship} this
 */
Ship.prototype.look = function(deg, snap) {
    if (snap) this.prop('heading', Ship.toRad(deg));
    else this.turnTo(deg);
    return this;
};

/**
 * Points the ship at an angle relatively
 *
 * @param deg
 * @param snap
 * @returns {Ship}
 */
Ship.prototype.lookRelative = function(deg, snap) {
    if (snap) this.prop('heading', Ship.addRad(this.prop('heading'), Ship.toRad(deg)));
    else this.turn(deg);
    return this;
};

/**
 * Turn the ship to look up (0deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookUp = function(snap) {
    return this.look(0, snap);
};

/**
 * Turn the ship to look right (90deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookRight = function(snap) {
    return this.look(90, snap);
};

/**
 * Turn the ship to look down (180deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookDown = function(snap) {
    return this.look(180, snap);
};

/**
 * Turn the ship to look left (270deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookLeft = function(snap) {
    return this.look(270, snap);
};

/**
 * Turn the ship relatively to look towards port (-90deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookToPort = function(snap) {
    return this.lookRelative(-90, snap);
};

/**
 * Turn the ship relatively to look towards starboard (+90deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookToStarboard = function(snap) {
    return this.lookRelative(90, snap);
};

/**
 * Turn the ship relatively to look towards the stern (+180deg)
 *
 * @param {Boolean} snap
 * @returns {Ship}
 */
Ship.prototype.lookToStern = function(snap) {
    return this.lookRelative(180, snap);
};

/**
 * Face the rudder so the ship turns towards port
 *
 * @param {Number?} amount The amount to turn, between 0 and 1, where 1 is hard port, 0 is no movement. Default is 1
 * @returns {Ship}
 */
Ship.prototype.rudderAtPort = function(amount) {
    if (amount == null) amount = 1;
    this.prop('rudder', this.server.config.ship.rudderCalibrate * (1 - amount));
    return this;
};

/**
 * Face the rudder so the ship turns towards port
 *
 * @param {Number?} amount The amount to turn, between 0 and 1, where 1 is hard starboard, 0 is no movement. Default is 1
 * @returns {Ship}
 */
Ship.prototype.rudderAtStarboard = function(amount) {
    if (amount == null) amount = 1;
    this.prop('rudder', this.server.config.ship.rudderCalibrate * (1 + amount));
    return this;
};

/**
 * Resets the rudder to the center
 *
 * @returns {Ship}
 */
Ship.prototype.rudderAtCenter = function() {
    this.prop('rudder', this.server.config.ship.rudderCalibrate);
    return this;
};


// todo: more powerful movement functions (like circle, box, patterns, etc)

/**
 * Moves a ship to an absolute position.
 * Note: In Artemis' coordinate system, z goes from the top of the map to the bottom, getting larger as it goes down.
 * x goes from the left to the right, getting larger as it goes to the right.
 * y goes up and down, getting larger as it goes down (todo: probably).
 *
 * Provide false or null to any parameter to use the current value
 *
 * @param {Number|Boolean|null?} x
 * @param {Number|Boolean|null?} z
 * @param {Number|Boolean|null?} y
 * @returns {Ship} this
 */
Ship.prototype.moveTo = function(x, z, y) {
    if (x != null && x !== false) this.prop('posX', x);
    if (z != null && z !== false) this.prop('posZ', z);
    if (y != null && y !== false) this.prop('posY', y);
    return this;
};

/**
 * Moves a ship relatively.
 *
 * @see Ship#moveTo regarding Artemis' coordinate system
 *
 * @param {Number|Boolean|null?} x
 * @param {Number|Boolean|null?} z
 * @param {Number|Boolean|null?} y
 * @returns {Ship} this
 */
Ship.prototype.moveRelative = function(x, z, y) {
    if (x != null && x !== false) this.prop('posX', this.prop('posX') + x);
    if (z != null && z !== false) this.prop('posZ', this.prop('posZ') + z);
    if (y != null && y !== false) this.prop('posY', this.prop('posY') + y);
    return this;
};

/**
 * Moves the ship upwards (towards the top of the map) a certain amount of metres
 * todo: wrap position?
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveToTop = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posZ', this.prop('posZ') - amount);
    return this;
};

/**
 * Moves the ship downwards (towards the bottom of the map) a certain amount of metres
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveToBottom = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posZ', this.prop('posZ') + amount);
    return this;
};

/**
 * Moves the ship left (towards the left of the map) a certain amount of metres
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveToLeft = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posX', this.prop('posX') - amount);
    return this;
};

/**
 * Moves the ship right (towards the right of the map) a certain amount of metres
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveToRight = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posX', this.prop('posX') + amount);
    return this;
};

/**
 * Moves the ship upwards a certain amount of metres
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveUp = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posY', this.prop('posY') - amount);
    return this;
};

/**
 * Moves the ship downwards a certain amount of metres
 *
 * @param {Number} amount
 * @returns {Ship} this
 */
Ship.prototype.moveDown = function(amount) {
    if (amount == null) amount = 1;
    this.prop('posY', this.prop('posY') + amount);
    return this;
};

// todo: relative movements such as moveToPort, moveToStarboard, moveToBow, moveToStern
// todo: tweened movements

/**
 * Speeds up movement
 *
 * @param {Number?} amount The amount to add, default is 1
 * @returns {Ship} this
 */
Ship.prototype.speedUp = function(amount) {
    if (amount == null) amount = 1;
    this.prop('velocity', this.prop('velocity') + amount);
    return this;
};

/**
 * Slows down movement. If the new velocity is < 0, it will be set to 0
 *
 * @param {Number?} amount The amount to remove, default is 1
 * @returns {Ship} this
 */
Ship.prototype.slowDown = function(amount) {
    if (amount == null) amount = 1;
    this.prop('velocity', this.prop('velocity') - amount);
    return this;
};

/**
 * Sets the new ship velocity
 *
 * @param {Number} velocity
 * @returns {Ship} this
 */
Ship.prototype.setVelocity = function(velocity) {
    this.prop('velocity', velocity);
    return this;
};

Ship.assignHooks = function(server) {
    // Move the ship
    server.hook('ship.update', function(ship, delta) {
        var leftRudder, rightRudder, rudderValue, rudder = ship.prop('rudder');
        if (rudder < server.config.ship.rudderCalibrate) {
            leftRudder = true;
            rudderValue = 1 - rudder * 2;
        } else if (rudder > server.config.ship.rudderCalibrate) {
            rightRudder = true;
            rudderValue = 2 * rudder - 1; // (rudder - 0.5) * 2
        }

        if (leftRudder) ship.prop('heading', ship.prop('heading') - rudderValue * ship.performance.turnRate * server.config.ship.rudderSpeed * delta);
        else if (rightRudder) ship.prop('heading', ship.prop('heading') + rudderValue * ship.performance.turnRate * server.config.ship.rudderSpeed * delta);

        var diff;
        if (ship.prop('heading') > Math.PI) {
            diff = ship.prop('heading') - Math.PI;
            ship.prop('heading', diff - Math.PI);
        } else if (ship.prop('heading') < -Math.PI) {
            diff = ship.prop('heading') + Math.PI;
            ship.prop('heading', Math.PI - diff);
        }

        // Convert Artemis' format to radians to get yaw
        // The format used by Artemis:
        // -Pi          0 deg (north)
        // -Pi / 2     90 deg (east)
        // 0          180 deg (south)
        // Pi / 2     270 deg (west)
        // Pi         360 deg (north)
        var yaw = ship.prop('heading') + Math.PI, pitch = ship.prop('pitch');

        var xDiff = Math.cos(pitch) * Math.sin(yaw);
        var yDiff = Math.sin(pitch);
        var zDiff = Math.cos(pitch) * Math.cos(yaw);

        var vectorAmount = ship.prop('velocity') * server.config.ship.velocityCoeff * delta;

        var xAmount = xDiff * vectorAmount;
        var yAmount = yDiff * vectorAmount;
        var zAmount = zDiff * vectorAmount;

        var newX = ship.prop('posX') - xAmount;
        var newY = ship.prop('posY') - yAmount;
        var newZ = ship.prop('posZ') - zAmount;

        if (newZ < 0) newZ = 0;
        else if (newZ > server.world.height) newZ = server.world.height;
        if (newX < 0) newX = 0;
        else if (newX > server.world.width) newX = server.world.width;

        if (newX !== ship.prop('posX')) ship.prop('posX', newX);
        if (newY !== ship.prop('posY')) ship.prop('posY', newY);
        if (newZ !== ship.prop('posZ')) ship.prop('posZ', newZ);
    });
};