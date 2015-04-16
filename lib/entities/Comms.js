var util = require('util');
var Entity = require('./Entity');
var enums = require('../enums');

/**
 * The comms console, to communicate with other ships/bases
 *
 * @param {Server} server
 * @param {PlayerShip} ship
 * @constructor
 */
function Comms(server, ship) {
    Entity.apply(this, arguments);

    this.id = ship.id;
    this.ship = ship;

    var comms = ship.consoles.communications;

    var self = this;
    comms.on('commsOutgoing', function(client, packet) {
        var target = packet.targetID === 0x00730078 ? false : server.world.get(packet.targetID);

        server.triggerHook(
            'comm.received',
            self,
            enums.comTargetType[packet.recipientType],
            server.world.get(packet.recipientID),
            packet.message,
            target
        );
    });

    comms.on('audioCommand', function(client, packet) {
        // todo
    });
}
util.inherits(Comms, Entity);

module.exports = Comms;

Comms.assignHooks = function(server) {
    // A raw message is received
    server.hook('comm.received', function(comm, type, recipient, messageType, target, next) {
        var message;
        switch (type) {
            case 'player':
                message = enums.comPlayerMessage[messageType];
                break;
            case 'enemy':
                message = enums.comEnemyMessage[messageType];
                break;
            case 'base':
                message = enums.comBaseMessage[messageType];
                break;
            case 'other':
                message = enums.comShipMessage[messageType];
                break;
        }
        if (!message) throw new Error('Unknown message type 0x' + messageType.toFixed(16));

        recipient.emit('receiveMessage', comm.ship, message, target);
        next();
    });
};
