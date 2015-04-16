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
            var consoleListOriginal = server.config.lobby.consoles, allShips = [], shipConfig = server.config.lobby.ships;

            debug('Creating ships');
            for (var i = 0; i < shipConfig.length; i++) {
                var consoleList = _.mapValues(consoleListOriginal, function (val, key) {
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
                for (var consoleName in consoleList) {
                    if (!consoleList.hasOwnProperty(consoleName)) continue;
                    state.triggerHook('player.addConsole', ship, consoleList[consoleName]);
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

    state.on('setConsole', function(client, packet) {
        var consoleName = enums.consoleType[packet.console];
        if (packet.selected) state.triggerHook('client.selectConsole', client, consoleName);
        else state.triggerHook('client.deselectConsole', client, consoleName);
    });

    /**
     * Hooks
     */
    state.hook('{game}.join', function(client, next) {
        server.nextTick().then(function() {
            debug('Client connected, sending ship settings');
            state.triggerHook('{game}.allShipSettings', ships, state);
            state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.consoles);
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

    state.hook('{game}.consoleStatus', function(ships, consoleListOriginal, next) {
        state.send('consoleStatus', function(client) {
            var data = {}, consoles = ships[client.ship].consoles;
            for (var consoleName in consoleListOriginal) {
                if (!consoleListOriginal.hasOwnProperty(consoleName)) continue;

                var group = consoles[consoleName], maxCount = consoleListOriginal[consoleName].count;
                if (group.clients.indexOf(client) !== -1) data[consoleName] = 1;
                else if (maxCount !== 0 && group.clients.length >= maxCount) data[consoleName] = 2;
                else data[consoleName] = 0;
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
        var previousConsoles = ships[client.ship].consoles;//, hasClients = false;
        for (var consoleName in previousConsoles) {
            if (!previousConsoles.hasOwnProperty(consoleName)) continue;

            previousConsoles[consoleName].removeClient(client);
        }

        client.ship = ship;
        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.consoles);
        next();
    });

    state.hook('client.selectConsole', function(client, console, next) {
        debug('Client selected console ' + console);
        var ship = ships[client.ship];
        var group = ship.consoles[console];

        var consoleMax = server.config.lobby.consoles[console].count;
        if (consoleMax !== 0 && group.clients.length >= consoleMax) return;

        group.addClient(client);
        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.consoles);
        next();
    });

    state.hook('client.deselectConsole', function(client, console, next) {
        debug('Client deselected console ' + console);
        var ship = ships[client.ship];
        ship.consoles[console].removeClient(client);

        state.triggerHook('{game}.consoleStatus', ships, server.config.lobby.consoles);
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
};
