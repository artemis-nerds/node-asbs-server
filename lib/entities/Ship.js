var Entity = require('./Entity');
var util = require('util');

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

// todo
Ship.assignHooks = function(server) {
    server.hook('ship.update', function(ship, delta) {
        var leftRudder, rightRudder, rudderValue, rudder = ship.prop('rudder');
        if (rudder < server.config.ship.rudderCalibrate) {
            leftRudder = true;
            rudderValue = 1 - rudder * 2;
        } else if (rudder > server.config.ship.rudderCalibrate) {
            rightRudder = true;
            rudderValue = 2 * rudder - 1; // (rudder - 0.5) * 2
        }

        //console.log('Rudder is ' + (leftRudder ? 'left' : rightRudder ? 'right' : 'center') + ' at ' + rudderValue, rudder);
        //console.log(ship.performance.turnRate);

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