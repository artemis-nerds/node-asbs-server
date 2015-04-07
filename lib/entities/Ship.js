var Entity = require('./Entity');
var util = require('util');
var Promise = require('bluebird');

/**
 * A generic ship
 *
 * @param {Server} server
 * @param {Object} type
 * @constructor
 * @inherits Entity
 */
function Ship(server, type) {
    Entity.apply(this, arguments);

    // Statistics
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
}
util.inherits(Ship, Entity);

Ship.prototype.entityName = 'ship';

module.exports = Ship;

/**
 * Turns the ship until it is facing a bearing
 *
 * @param {Number} bearing The true bearing, where 0 is north, 90 is east, 180 is south, etc
 * @returns {Promise} Resolved when turning is complete
 */
Ship.prototype.turnTo = function(bearing) {
    var self = this;

    return new Promise(function(resolve, reject) {
        // Wrap bearing
        if (bearing < 0) bearing += 360;
        if (bearing > 360) bearing -= 360;

        // Convert degrees to Artemis' format
        var rad = (bearing * Math.PI / 180) - Math.PI;

        // Which way do we have to turn?
        var rudderCenter = this.server.config.ship.rudderCalibrate;
        var newRudder = rudderCenter;
        if (bearing < self.prop('heading')) newRudder = 0;
        else if (bearing > self.prop('heading')) newRudder = 1;
        else return resolve(); // We are already facing the required direction

        self.prop('rudder', newRudder);

        var f;
        self.on('tick', f = function(delta) {
            // If we have reached the required bearing
            if ((newRudder < rudderCenter && self.prop('heading') <= bearing) ||
                (newRudder > rudderCenter && self.prop('heading') >= bearing) ||
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

        if (leftRudder) ship.prop('heading', ship.prop('heading') - rudderValue * ship.performance.turnRate * 10);
        else if (rightRudder) ship.prop('heading', ship.prop('heading') + rudderValue * ship.performance.turnRate * 10);

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
        //console.log(yaw * (180 / Math.PI) + "deg");

        var xDiff = Math.cos(pitch) * Math.sin(yaw);
        var yDiff = Math.sin(pitch);
        var zDiff = Math.cos(pitch) * Math.cos(yaw);

        var vectorAmount = ship.prop('velocity') * server.config.ship.velocityCoeff;
        //var share = vectorAmount / Math.abs(xDiff + yDiff + zDiff);

        //console.log(share, vectorAmount);

        var xAmount = xDiff * vectorAmount;
        var yAmount = yDiff * vectorAmount;
        var zAmount = zDiff * vectorAmount;

        var newX = ship.prop('posX') - xAmount;
        var newY = ship.prop('posY') - yAmount;
        var newZ = ship.prop('posZ') - zAmount;
        if (newX !== ship.prop('posX')) ship.prop('posX', newX);
        if (newY !== ship.prop('posY')) ship.prop('posY', newY);
        if (newZ !== ship.prop('posZ')) ship.prop('posZ', newZ);
    });
};