var util = require('util');
var Entity = require('./Entity');
var enums = require('../enums');

/**
 * The helm console, to navigate the ship
 *
 * @constructor
 * @inherits Entity
 */
function Helm(server, ship) {
    Entity.apply(this, arguments);

    this.id = ship.id;
    this.ship = ship;

    var helm = ship.consoles.helm;

    var self = this;
    helm.on('setImpulse', function(client, packet) {
        server.triggerHook('helm.setImpulse', self, packet.velocity);
    });

    helm.on('setSteering', function(client, packet) {
        server.triggerHook('helm.setRudder', self, packet.turn);
    });

    helm.on('toggleReverse', function(client, packet) {
        server.triggerHook('helm.toggleReverse', self);
    });

    helm.on('requestDock', function(client, packet) {
        server.triggerHook('helm.requestDock', self);
    });

    helm.on('setWarp', function(client, packet) {
        if (!packet.warp) return;

        if (packet.warp !== ship.prop('warp')) server.triggerHook('helm.setWarp', self, packet.warp);
    });


    // todo: props
}
util.inherits(Helm, Entity);

Helm.prototype.entityName = 'helm';

module.exports = Helm;

Helm.assignHooks = function(server) {
    // Set the level of impulse for the ship
    server.hook('helm.setImpulse', function(helm, impulse, next) {
        //helm.ship.prop('impulse', impulse);
        if (helm.ship.prop('warp') < 2) {
            helm.ship.prop('impulse', impulse);
            server.triggerHook('helm.setWarp', helm, 0);
        }
        next();
    });

    // Set the current rudder for the ship
    server.hook('helm.setRudder', function(helm, rudder, next) {
        helm.ship.prop('rudder', rudder);
        next();
    });

    // Trigger the enable or disable reverse hooks
    server.hook('helm.toggleReverse', function(helm, next) {
        if (helm.ship.prop('reverse')) server.triggerHook('helm.disableReverse', helm);
        else server.triggerHook('helm.enableReverse', helm);
        next();
    });

    // Enable reverse
    server.hook('helm.enableReverse', function(helm, next) {
        helm.ship.prop('reverse', 1);
        next();
    });

    // Disable reverse
    server.hook('helm.disableReverse', function(helm, next) {
        helm.ship.prop('reverse', 0);
        next();
    });

    // Dock with the nearest base
    server.hook('helm.requestDock', function(helm, next) {
        // todo
    });

    // Sets the warp factor
    server.hook('helm.setWarp', function(helm, warp, next) {
        server.triggerHook('player.setWarp', helm.ship, warp);
        next();
    });
};
