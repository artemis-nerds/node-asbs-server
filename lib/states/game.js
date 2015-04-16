// The actual game

var _ = require('lodash');
var debug = require('debug')('artemis:game');
var enums = require('../enums');
var entities = require('../entities');

var ClientGroup = require('../ClientGroup');

var PlayerShip = entities.PlayerShip;
var NpcShip = entities.NpcShip;
var Console = entities.Console;

module.exports = function(state, server) {
    var readyPlayers = 0;
    var ships = [];
    server.ships = ships;

    var playing = new ClientGroup();
    var gameIsRunning = false;

    // Make sure world updates are only sent to the players in the game
    server.world.clientGroup = playing;

    var vesselsByName = server.vesselData.then(function(data) {
        var vessels = data.vessels, uniqid, vesselTypes = [];
        for (uniqid in vessels) {
            if (!vessels.hasOwnProperty(uniqid)) continue;
            var vessel = vessels[uniqid];
            vesselTypes[vessel.classname] = vessel;
        }
        return vesselTypes;
    });

    // Create player ships
    state.hook('{game}.enable', function(next) {
        vesselsByName.then(function (vessels) {
            var stationList = server.config.lobby.stations, allShips = [], shipConfig = server.config.lobby.ships;

            debug('Creating ships');
            for (var i = 0; i < shipConfig.length; i++) {
                var consoleList = _.mapValues(stationList, function (val, key) {
                    return new Console(server, key);
                });

                // todo: ship configuration with setShipSettings
                var ship = new PlayerShip(server,
                    vessels[shipConfig[i].type],    // Vessel data
                    shipConfig[i],                  // Ship configuration
                    i,                              // Ship number
                    consoleList                     // Console objects
                );
                ships[i] = ship;

                // Call the 'addConsole' hook for each console
                for (var stationName in consoleList) {
                    if (!consoleList.hasOwnProperty(stationName)) continue;
                    state.triggerHook('player.addConsole', ship, consoleList[stationName]);
                }

                state.triggerHook('world.addPlayer', server.world, ship);
            }
            debug('Ready!');

            state.triggerHook('world.generate', server.world);
            next();
        });
    });

    /**
     * Events
     */
    state.on('shipSelect', function(client, packet) {
        state.triggerHook('client.selectShip', client, packet.shipIndex);
    });

    state.on('setShipSettings', function(client, packet) {
        vesselsByName.then(function(types) {
            state.triggerHook('client.setShipSettings', client, {
                number: client.ship,
                driveType: enums.driveType[packet.drive],
                type: types[packet.ship].classname,
                name: packet.name
            });
        });
    });

    state.on('setStation', function(client, packet) {
        var stationName = enums.consoleType[packet.station];
        if (packet.selected) state.triggerHook('client.selectConsole', client, stationName);
        else state.triggerHook('client.deselectConsole', client, stationName);
    });

    /**
     * Hooks
     */
    state.hook('{game}.join', function(client, next) {
        server.nextTick().then(function() {
            debug('Client connected, sending ship settings');
            state.triggerHook('{game}.allShipSettings', ships, state);
            state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.stations);
        });
        next();
    });

    state.hook('{game}.allShipSettings', function(ships, group, next) {
        vesselsByName.then(function(vessels) {
            group.send('allShipSettings', _.map(ships, function (ship) {
                // Convert readable format to game format and send
                return {
                    driveType: enums.driveType[ship.driveType],
                    type: vessels[ship.type].uniqueID,
                    unknown: 1,
                    name: ship.name
                };
            }));
        });
        next();
    });

    state.hook('{game}.consoleStatus', function(ships, stationList, next) {
        state.send('consoleStatus', function(client) {
            var data = {}, stations = ships[client.ship].stations;
            for (var stationName in stationList) {
                if (!stationList.hasOwnProperty(stationName)) continue;

                var group = stations[stationName], maxCount = stationList[stationName].count;
                if (group.clients.indexOf(client) !== -1) data[stationName] = 1;
                else if (maxCount !== 0 && group.clients.length >= maxCount) data[stationName] = 2;
                else data[stationName] = 0;
            }
            data.playerShip = client.ship + 1;
            return data;
        });
        next();
    });

    state.hook('{game}.shouldStart', function(decide, next) {
        var ready = server.filter(function(client) {
            return client.ready;
        });

        if (decide(ready, server)) state.triggerHook('{game}.countdown');
    });

    // Taking advantage of the fact that a hook thread is cancelled if another by the same name is started,
    // we can prevent the game from 'starting twice' if a player sends ready twice, as the next function
    // will not trigger in the hook below if the 'allPlayersReady' hook has been called since then, meaning
    // the game will not start yet.
    state.hook('{game}.countdown', function(countdown, next) {
        state.triggerHook('{game}.start');
        next();
    });

    var secondInt = false;
    state.hook('{game}.countdown', function(countdown, next) {
        debug('Starting game countdown');

        var remainingTime = typeof countdown === 'number' ? countdown : server.config.lobby.readyWait;
        next = typeof countdown === 'function' ? countdown : next;

        if (secondInt !== false) clearInterval(secondInt);

        var doCountdown;
        var secondInt = setInterval(doCountdown = function() {
            if (remainingTime < 0) {
                secondInt = false;
                clearInterval(secondInt);
            } else {
                debug('Game starting in ' + remainingTime);
                remainingTime--;
            }
        }, 1000);
        doCountdown();

        setTimeout(function() {
            next(remainingTime);
        }, remainingTime * 1000);
    });

    state.hook('{game}.start', function(next) {
        debug('Using skybox ' + server.world.skybox);

        gameIsRunning = true;
        for (var i = 0; i < server.clients.length; i++) {
            state.triggerHook('client.joinGame', server.clients[i]);
        }
        next();
    });

    state.hook('{game}.setShipSettings', function(ship, next) {
        var sh = ships[ship.number];
        sh.driveType = ship.driveType;
        sh.type = ship.type;
        sh.name = ship.name;

        next();
    });

    state.hook('client.disconnect', function(client, next) {
        // todo
        next();
    });

    state.hook('client.selectShip', function(client, ship, next) {
        debug('Setting client ' + client.id + '\'s ship to ' + ship);
        if (ship < 0 || ship >= server.config.lobby.ships.length || ship === client.ship) return;

        // Remove any consoles the player is registered as in the previous ship
        var previousStations = ships[client.ship].stations;//, hasClients = false;
        for (var stationName in previousStations) {
            if (!previousStations.hasOwnProperty(stationName)) continue;

            previousStations[stationName].removeClient(client);
        }

        client.ship = ship;
        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.stations);
        next();
    });

    state.hook('client.selectConsole', function(client, console, next) {
        debug('Client selected console ' + console);
        var ship = ships[client.ship];
        var group = ship.stations[console];

        var stationMax = server.config.lobby.stations[console].count;
        if (stationMax !== 0 && group.clients.length >= stationMax) return;

        group.addClient(client);
        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.stations);
        next();
    });

    state.hook('client.deselectConsole', function(client, console, next) {
        debug('Client deselected console ' + console);
        var ship = ships[client.ship];
        ship.stations[console].removeClient(client);

        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.stations);
        next();
    });

    state.hook('client.setShipSettings', function(client, ship, next) {
        debug('Changing settings for ship ' + ship.number + ': name is ' + ship.name + ', type is ' + ship.type + ', drive is ' + ship.driveType);
        state.triggerHook('{game}.setShipSettings', ship);
        state.triggerHook('{game}.allShipSettings', ships, state);
        next();
    });

    state.hook('client.ready', function(client, next) {
        // We join the game instantly if it is already running
        if (gameIsRunning) state.triggerHook('client.joinGame', client);
        else state.triggerHook('{game}.shouldStart', function(readyClients, clients) {
            return readyClients.clients.length === clients.clients.length;
        });
        next();
    });

    state.hook('client.joinGame', function(client, next) {
        // Make sure 'client.ready' can fire again
        client.ready = false;

        var ship = ships[client.ship];

        // If the ship is disabled, it must be new
        if (ship.disabled) {
            // "Once a ship is in the game, it is in the game forever"
            ship.disabled = false;

            // Send the new ship to all current players
            ship.forceUpdate(playing);
        }

        playing.addClient(client);

        client.send('skybox', { skyboxID: server.world.skybox });
        client.send('gameRestart');
        client.send('difficulty', {
            difficulty: server.world.difficulty,
            gameType: server.world.gameType
        });

        state.triggerHook('{game}.allShipSettings', ships, client);

        // Send all entities to the client
        server.world.forceUpdate(client);
        next();
    });

    state.hook('world.generate', function(world, next) {
        // todo

        vesselsByName.then(function(vessels) {
            // For debugging
            var npc = new NpcShip(server, vessels["Fighter"], {
                name: 'ABC123',
                driveType: 'warp',
                type: 'Fighter'
            });
            // Move the ship up a bit
            npc.prop('posZ', 40000);
            console.log('Adding', npc);
            world.addChild(npc);

            next();
        });
    });

    state.hook('player.addConsole', function(player, console, next) {
        player.addChild(console);
        next();
    });

    state.hook('world.addPlayer', function(world, player, next) {
        world.addChild(player);
        next();
    });






    /*state.world = server.world;

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
    });*/
};