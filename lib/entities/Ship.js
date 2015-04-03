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
        if (rudder < 0.5) {
            leftRudder = true;
            rudderValue = rudder * 2;
        } else if (rudder > 0.5) {
            rightRudder = true;
            rudderValue = 2 * rudder - 1; // (rudder - 0.5) * 2
        }

        if (leftRudder) ship.prop('heading', ship.prop('heading') - rudderValue * ship.performance.turnRate * delta);
        else if (rightRudder) ship.prop('heading', ship.prop('heading') + rudderValue * ship.performance.turnRate * delta);

        var diff;
        if (ship.prop('heading') > Math.PI) {
            diff = ship.prop('heading') - Math.PI;
            ship.prop('heading', diff - Math.PI);
        } else if (ship.prop('heading') < -Math.PI) {
            diff = ship.prop('heading') + Math.PI;
            ship.prop('heading', Math.PI - diff);
        }

        // Convert Artemis' format to radians and find X and Y differences
        // The format used by Artemis:
        // -Pi       -    0 deg (north)
        // -Pi / 2   -   90 deg (east)
        //  0        -  180 deg (south)
        //  Pi / 2   -  270 deg (west)
        //  Pi       -  360 deg (north)
        var headingRadians = ship.prop('heading') + Math.PI;
        var xDiff = Math.sin(headingRadians);
        var yDiff = Math.cos(headingRadians);

        // 'Prevent' the ship from going faster when going up or down
        var pitchDiff = ship.prop('pitch') * ship.prop('velocity');
        var horizontalVelocity = ship.prop('velocity') - pitchDiff;

        // TODO: Take into account roll, see http://stackoverflow.com/questions/1568568/how-to-convert-euler-angles-to-directional-vector
        ship.prop('posX', ship.prop('posX') + xDiff * horizontalVelocity);
        ship.prop('posY', ship.prop('posY') + yDiff * horizontalVelocity);
        ship.prop('posZ', ship.prop('posZ') + pitchDiff);
    });
};