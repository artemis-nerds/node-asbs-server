/**
 * The actual game
 */

var _ = require('lodash-node');
var debug = require('debug')('artemis:game');
var enums = require('../enums');
var entities = require('../entities');

var PlayerShip = entities.PlayerShip;
var Console = entities.Console;

// Setup is only called once per server
exports.setup = function(server, sm) {
    var world = this.world = server.world;
    var self = this;

    server.hook('client.disconnect', function(client) {
        if (!server.clients.length) {
            debug('Returning to lobby');
            sm.switchTo('lobby');
        }
    });

    server.hook('player.addConsole', function(player, console, next) {
        player.stations[console.name] = console;
        server.triggerHook('entity.register', player, console);
        next();
    });

    server.hook('player.register', function(player, allShips, next) {
        self.players.push(player);
        // Position the players
        // todo

        server.triggerHook('entity.register', world, player);
        next();
    });

    server.hook('entity.register', function(parent, entity, next) {
        parent.addChild(entity);
        next();
    });

    server.hook('game.start', function(server, next) {
        server.triggerHook('world.generate', server.world);

        server.send('skybox', { skyboxID: server.world.skybox });
        server.send('gameRestart'); // ?? why ??
        server.send('difficulty', { difficulty: server.world.difficulty, gameType: server.world.gameType });

        server.triggerHook('lobby.allShipSettings', self.shipSettings);

        // Send all entities to the clients
        server.world.forceUpdate();

        next();
    });

    server.hook('world.generate', function(world, next) {
        // Generate the world
        // todo

        next();
    });
};

// Start is called whenever the state is started
exports.start = function(server, sm, previousCtx) {
    var shipSettings = this.shipSettings = previousCtx.shipSettings;
    var stations = this.stations = previousCtx.stations;

    var players = this.players = [];

    // Create player ships with players
    var stationList = server.config.lobby.stations;
    var allShips = [];
    for (var shipId in stations) {
        if (!stations.hasOwnProperty(shipId)) continue;

        var shipStations = stations[shipId], clientCount = 0;
        var ship = new PlayerShip(server, shipId, shipSettings[shipId], {});

        for (var stationName in stationList) {
            if (!stationList.hasOwnProperty(stationName)) continue;
            var consoles = shipStations[stationName] || [];
            clientCount += consoles.length;
            var con = new Console(server, stationName, consoles);
            server.triggerHook('player.addConsole', ship, con);
        }
        if (clientCount) allShips.push(ship);
    }

    var shipCount = allShips.length;
    for (var i = 0; i < shipCount; i++) server.triggerHook('player.register', allShips[i], shipCount);

    // Start the game
    server.triggerHook('game.start', server);
};

// Stop is called whenever the state is stopped
exports.stop = function(server, sm) {

};