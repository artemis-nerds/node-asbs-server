// The game lobby

var _ = require('lodash');
var debug = require('debug')('artemis:lobby');
var enums = require('../enums');

module.exports = function(state, server) {
    state.readyPlayers = 0;
    state.stations = {};
    //state.shipSettings = _.clone(server.config.lobby.ships);
    state.shipSettings = {};
    for (var i = 0; i < 7; i++) {
        state.stations[i] = {};
    }

    state.vesselTypes = server.vesselData.then(function(data) {
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

    function deselectConsole(client, console) {
        debug('Client deselected console ' + console);
        var stationShip = state.stations[client.ship];

        var shipStations = stationShip[console];
        var stationIndex = shipStations.indexOf(client);
        if (stationIndex !== -1) shipStations.splice(stationIndex, 1);
    }

    state.on('shipSelect', function(client, packet) {
        state.triggerHook('client.selectShip', client, packet.shipIndex);
    });

    state.on('setShipSettings', function(client, packet) {
        state.vesselTypes.then(function(types) {
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

    // We always want to be checking for if a client disconnects to remove them from their stations
    server.hook('client.disconnect', function(client, next) {
        var previousStations = state.stations[client.ship];
        for (var stationName in previousStations) {
            if (!previousStations.hasOwnProperty(stationName)) continue;
            deselectConsole(client, stationName);
        }

        state.triggerHook('{lobby}.consoleStatus', state.stations, server.config.lobby.stations);
        next();
    });

    // Add hooks
    state.hook('{lobby}.join', function(client, next) {
        next();
        server.nextTick().then(function() {
            debug('Client connected, sending ship settings');
            state.triggerHook('{lobby}.allShipSettings', state.shipSettings);
            state.triggerHook('{lobby}.consoleStatus', state.stations, server.config.lobby.stations);
        });
    });

    state.hook('client.selectShip', function(client, ship, next) {
        debug('Setting client ship to ' + ship);
        if (ship < 0 || ship > 7 || ship === client.ship) return;

        // Remove any consoles the player is registered as in the previous ship
        var previousStations = state.stations[client.ship];
        for (var stationName in previousStations) {
            if (!previousStations.hasOwnProperty(stationName)) continue;
            deselectConsole(client, stationName);
        }

        client.ship = ship;
        state.triggerHook('{lobby}.consoleStatus', state.stations, server.config.lobby.stations);
        next();
    });

    state.hook('client.selectConsole', function(client, console, next) {
        debug('Client selected console ' + console);
        var stationShip = state.stations[client.ship];
        if (!stationShip[console]) stationShip[console] = [];
        var shipStations = stationShip[console];

        var stationMax = server.config.lobby.stations[console].count;
        if (stationMax !== 0 && shipStations.length >= stationMax) return;

        shipStations.push(client);
        state.triggerHook('{lobby}.consoleStatus', state.stations, server.config.lobby.stations);
        next();
    });

    state.hook('client.deselectConsole', function(client, console, next) {
        deselectConsole(client, console);

        state.triggerHook('{lobby}.consoleStatus', state.stations, server.config.lobby.stations);
        next();
    });

    state.hook('client.setShipSettings', function(client, ship, next) {
        debug('Setting client ship settings for ship ' + ship.number + ': name is ' + ship.name + ', type is ' + ship.type + ', drive is ' + ship.driveType);
        state.triggerHook('{lobby}.setShipSettings', ship);
        server.nextTick().then(function() {
            state.triggerHook('{lobby}.allShipSettings', state.shipSettings);
        });
        next();
    });

    state.hook('client.ready', function(client, next) {
        state.readyPlayers++;
        debug(state.readyPlayers + ' client(s) are ready out of ' + server.clients.length);

        if (state.readyPlayers >= server.clients.length) server.triggerHook('{lobby}.allPlayersReady');
    });

    state.hook('{lobby}.allPlayersReady', function(countdown, next) {
        debug('All players ready! Starting game countdown');

        var remainingTime = typeof countdown === 'number' ? countdown : server.config.lobby.readyWait;
        next = typeof countdown === 'function' ? countdown : next;

        var secondInt = setInterval(function() {
            remainingTime--;
            if (remainingTime < 0) return clearInterval(secondInt);
            debug('Game starting in ' + remainingTime);
        }, 1000);

        setTimeout(function() {
            state.switchTo('game');
            state.triggerHook('{game}.initialize');
            next();
        }, remainingTime * 1000);
    });

    state.hook('{lobby}.setShipSettings', function(ship, next) {
        state.vesselTypes.then(function(types) {
            state.shipSettings[ship.number] = {
                driveType: enums.driveType[ship.driveType],
                type: types[ship.type].uniqueID,
                unknown: 1,
                name: ship.name
            };
            next();
        });
    });

    state.hook('{lobby}.allShipSettings', function(settings, next) {
        server.send('allShipSettings', settings);
        next();
    });

    state.hook('{lobby}.consoleStatus', function(allStations, stationList, next) {
        // Customize the packet on a per-client basis
        state.send('consoleStatus', function(client) {
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

    state.vesselTypes.then(function() {
        debug('Creating ship settings');
        var ships = server.config.lobby.ships;
        for (var i = 0; i < ships.length; i++) {
            state.triggerHook('{lobby}.setShipSettings', ships[i]);
        }
    });
};