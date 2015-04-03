// The actual game

var _ = require('lodash');
var debug = require('debug')('artemis:game');
var enums = require('../enums');
var entities = require('../entities');

var PlayerShip = entities.PlayerShip;
var Console = entities.Console;

module.exports = function(state, server) {
    state.world = server.world;

    var lobby = server.getProxy('lobby');
    state.shipSettings = lobby.shipSettings;
    state.stations = lobby.stations;
    state.vesselTypes = lobby.vesselTypes;
    state.players = [];

    state.hook('{game}.initialize', function(next) {
        server.vesselData.then(function(types) {
            // Create player ships with players
            var stationList = server.config.lobby.stations, allShips = [];
            for (var shipId in state.stations) {
                if (!state.stations.hasOwnProperty(shipId)) continue;

                var shipStations = state.stations[shipId], clientCount = 0;
                var shipSettings = state.shipSettings[shipId];
                // todo

                // Create console objects to add to the ship
                var consoleList = {}, stationName;
                for (stationName in stationList) {
                    if (!stationList.hasOwnProperty(stationName)) continue;
                    var consoles = shipStations[stationName] || [];
                    clientCount += consoles.length;
                    consoleList[stationName] = new Console(server, stationName, consoles);
                }

                // Create the ship
                var ship = new PlayerShip(server, types.vessels[shipSettings.type], shipId, state.shipSettings[shipId], consoleList);

                // Call the 'addConsole' hook for each console
                for (stationName in stationList) {
                    if (!stationList.hasOwnProperty(stationName)) continue;
                    state.triggerHook('player.addConsole', ship, consoleList[stationName]);
                }

                // Actually register the ship only if it has some clients
                if (clientCount) {
                    allShips.push(ship);
                    state.triggerHook('player.register', ship);
                }
            }

            state.triggerHook('world.generate', server.world);

            // Send the world to all current clients
            server.world.forceUpdate(state);

            next();
        });
    });

    state.hook('{game}.join', function(client, next) {
        client.send('skybox', { skyboxID: server.world.skybox });
        client.send('gameRestart');
        client.send('difficulty', { difficulty: server.world.difficulty, gameType: server.world.gameType });

        state.triggerHook('{lobby}.allShipSettings', state.shipSettings);

        // Send all entities to the client
        server.world.forceUpdate(client);
        next();
    });

    state.hook('world.generate', function(world, next) {
        // Generate the world/position players
        // todo

        next();
    });

    state.hook('player.addConsole', function(player, console, next) {
        //player.stations[console.name] = console;
        state.triggerHook('entity.register', player, console);
        next();
    });

    state.hook('player.register', function(player, next) {
        state.players.push(player);

        server.triggerHook('entity.register', state.world, player);
        next();
    });

    state.hook('entity.register', function(parent, entity, next) {
        parent.addChild(entity);
        next();
    });
};