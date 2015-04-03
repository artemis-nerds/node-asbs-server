/**
 * The game lobby
 */

var _ = require('lodash-node');
var debug = require('debug')('artemis:lobby');
var enums = require('../enums');

// Setup is only called once per server
exports.setup = function(server, sm) {
    this.readyPlayers = 0;

    var stations = this.stations = {};

    var vesselTypes = this.vesselTypes = server.vesselData.then(function(data) {
        var vessels = data.vessels, uniqid, vesselTypes = [];
        for (uniqid in vessels) {
            if (!vessels.hasOwnProperty(uniqid)) continue;
            var vessel = vessels[uniqid];
            if (vessel.types.indexOf('player') !== -1) {
                vesselTypes.push(vessel);
                vesselTypes[vessel.classname] = vessel;
            }
        }
        return vesselTypes;
    });

    server.hook('client.connect', function(client, next) {
        next();
        server.nextTick().then(function() {
            debug('Client connected, sending ship settings');
            server.triggerHook('lobby.allShipSettings', shipSettings);
            server.triggerHook('lobby.consoleStatus', stations);
        });
    });

    server.hook('client.selectShip', function(client, ship, next) {
        debug('Setting client ship to ' + ship);
        if (ship < 0 || ship > 7 || ship === client.ship) return;

        // Remove any consoles the player is registered as in the previous ship
        var previousStations = stations[client.ship];
        for (var stationName in previousStations) {
            if (!previousStations.hasOwnProperty(stationName)) continue;
            var consoles = previousStations[stationName];
            var consoleIndex = consoles.indexOf(client);
            if (consoleIndex !== -1) consoles.splice(consoleIndex, 1);
        }

        client.ship = ship;
        server.triggerHook('lobby.consoleStatus', stations);
        next();
    });

    server.hook('client.selectConsole', function(client, console, next) {
        debug('Client selected console ' + console);
        var stationShip = stations[client.ship];
        if (!stationShip[console]) stationShip[console] = [];
        var shipStations = stationShip[console];

        var stationMax = server.config.lobby.stations[console].count;
        if (stationMax !== 0 && shipStations.length >= stationMax) return;

        shipStations.push(client);
        server.triggerHook('lobby.consoleStatus', stations);
        next();
    });

    server.hook('client.deselectConsole', function(client, console, next) {
        debug('Client deselected console ' + console);
        var stationShip = stations[client.ship];

        var shipStations = stationShip[console];
        var stationIndex = shipStations.indexOf(client);
        if (stationIndex !== -1) shipStations.splice(stationIndex, 1);

        server.triggerHook('lobby.consoleStatus', stations);
        next();
    });

    server.hook('client.setShipSettings', function(client, ship, next, args) {
        vesselTypes.then(function(types) {
            ship = args.length ? args[0] : ship;
            debug('Setting client ship settings for ship ' + ship.number + ': name is ' + ship.name + ', type is ' + ship.type + ', drive is ' + ship.driveType);
            shipSettings[ship.number] = {
                driveType: enums.driveType[ship.driveType],
                type: types[ship.type].uniqueID,
                unknown: 1,
                name: ship.name
            };
            server.triggerHook('lobby.allShipSettings', shipSettings);
        });
    });

    var self = this, playersReadyHook = false;
    server.hook('client.ready', function(client, next) {
        self.readyPlayers++;
        debug(self.readyPlayers + ' client(s) are ready out of ' + server.clients.length);

        var totalPlayers = server.clients.length;
        if (self.readyPlayers >= totalPlayers) playersReadyHook = server.triggerHook('lobby.allPlayersReady');

        next();
    });

    server.hook('lobby.allPlayersReady', function(next, args) {
        // Go to game state
        // todo: create game state
        debug('All players ready! Starting game countdown');
        //server.send('gameMessage', { msg: 'All players are ready! Starting game countdown...' });
        var remainingTime = args[0] || server.config.lobby.readyWait;

        var secondInt = setInterval(function() {
            remainingTime--;
            if (remainingTime < 0) return clearInterval(secondInt);
            debug('Game starting in ' + remainingTime);
            //server.send('gameMessage', { msg: 'Game starting in ' + remainingTime }); todo: enable?
        }, 1000);

        setTimeout(function() {
            sm.switchTo('game');
            next();
        }, remainingTime * 1000);
    });

    var shipSettings = this.shipSettings = _.clone(server.config.lobby.ships);
    for (var shipId in shipSettings) {
        if (!shipSettings.hasOwnProperty(shipId)) continue;
        stations[shipId] = {};
    }

    server.hook('lobby.enter', function(next, args) {
        vesselTypes.then(function(types) {
            debug('Creating ship settings');
            if (args.length) {
                var ships = args[0], shipName, ship;
                shipSettings = [];
                for (shipName in ships) {
                    if (!ships.hasOwnProperty(shipName)) continue;
                    ship = ships[shipName];
                    shipSettings[ships.number] = {
                        driveType: enums.driveType[ship.driveType],
                        type: types[ship.type].uniqueID,
                        unknown: 1,
                        name: ship.name
                    };
                }
            }
            next();
        });
    });

    server.hook('lobby.allShipSettings', function(settings, next) {
        server.send('allShipSettings', settings);
        next();
    });

    server.hook('lobby.consoleStatus', function(allStations, next) {
        var stationList = server.config.lobby.stations;

        // Customize the packet on a per-client basis
        server.send('consoleStatus', function(client) {
            var data = {}, stations = allStations[client.ship];
            for (var stationName in stationList) {
                if (!stationList.hasOwnProperty(stationName)) continue;

                var consoles = stations[stationName] || [], maxCount = stationList[stationName].count;
                if (consoles.indexOf(client) !== -1) data[stationName] = 1;
                else if (maxCount !== 0 && consoles.length >= maxCount) data[stationName] = 2;
                else data[stationName] = 0;
            }
            data.playerShip = client.ship + 1;
            return data;
        });
        next();
    });
};

// Start is called whenever the state is started
exports.start = function(server, sm) {
    var playersReadyHandle = false;

    // Reset ready players
    this.readyPlayers = 0;

    server.on('shipSelect', this.f1 = function(client, packet) {
        server.triggerHook('client.selectShip', client, packet.shipIndex);
    });

    var vesselTypes = this.vesselTypes;
    server.on('setShipSettings', this.f2 = function(client, packet) {
        vesselTypes.then(function(types) {
            server.triggerHook('client.setShipSettings', client, {
                number: client.ship,
                driveType: enums.driveType[packet.drive],
                type: types[packet.ship].classname,
                name: packet.name
            });
        });
    });

    server.on('setStation', this.f3 = function(client, packet) {
        var stationName = enums.consoleType[packet.station];
        if (packet.selected) server.triggerHook('client.selectConsole', client, stationName);
        else server.triggerHook('client.deselectConsole', client, stationName);
    });

    server.triggerHook('lobby.enter');
};

// Stop is called whenever the state is stopped
exports.stop = function(server, sm) {
    server.removeListener('shipSelect', this.f1);
    server.removeListener('setShipSettings', this.f2);
    server.removeListener('setStation', this.f3);
};