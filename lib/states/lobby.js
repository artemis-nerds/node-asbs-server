// The game lobby

var _ = require('lodash-node');
var debug = require('debug')('artemis:lobby');
var enums = require('../enums');

exports.setup = function(state, server) {
    state.readyPlayers = 0;
    state.stations = {};
    state.shipSettings = _.clone(server.config.lobby.ships);
    for (var shipId in state.shipSettings) {
        if (!state.shipSettings.hasOwnProperty(shipId)) continue;
        this.stations[shipId] = {};
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
};

exports.run = function(state, server) {
    function deselectConsole(client, console) {
        debug('Client deselected console ' + console);
        var stationShip = state.stations[client.ship];

        var shipStations = stationShip[console];
        var stationIndex = shipStations.indexOf(client);
        if (stationIndex !== -1) shipStations.splice(stationIndex, 1);
    }


    state.hook('client.connect', function(client, next) {
        next();
        server.nextTick().then(function() {
            debug('Client connected, sending ship settings');
            state.triggerHook('{lobby}.allShipSettings', state.shipSettings);
            state.triggerHook('{lobby}.consoleStatus', state.stations);
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
        state.triggerHook('{lobby}.consoleStatus', state.stations);
        next();
    });

    server.hook('client.selectConsole', function(client, console, next) {
        debug('Client selected console ' + console);
        var stationShip = state.stations[client.ship];
        if (!stationShip[console]) stationShip[console] = [];
        var shipStations = stationShip[console];

        var stationMax = server.config.lobby.stations[console].count;
        if (stationMax !== 0 && shipStations.length >= stationMax) return;

        shipStations.push(client);
        state.triggerHook('{lobby}.consoleStatus', state.stations);
        next();
    });

    server.hook('client.deselectConsole', function(client, console, next) {
        deselectConsole(client, console);

        state.triggerHook('{lobby}.consoleStatus', state.stations);
        next();
    });

    server.hook('client.setShipSettings', function(client, ship, next, args) {
        vesselTypes.then(function(types) {
            ship = args.length ? args[0] : ship;
        });
    });
};