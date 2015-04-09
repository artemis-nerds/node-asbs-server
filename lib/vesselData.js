// Reads the vesselData.xml and the *.snt files and caches them

var xml = require('node-xml-lite');
var fs = require('fs');
var path = require('path');
var debug = require('debug')('artemis:vesselData');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

//var cache = false;

var systemMap = {
    '-2':   'Void',
    '-1':   'Hall',
    0:      'Beam',
    1:      'Torp',
    2:      'Sens',
    3:      'Mnvr',
    4:      'Impl',
    5:      'Warp',
    6:      'Fshd',
    7:      'Rshd'
};

/**
 * TODO
 * We might want to replace this with a JS or JSON file, as that would make using the vessel data
 * less complicated, and simplifying server setup by removing the requirement for the game data folder.
 * However this would also make running the server for a modded game harder, as the JS/JSON file would
 * have to be re-created.
 *
 * The method used by ArtClientLib is to have the data pre-stored, but load from a 'dat' folder if it
 * exists. Although, in the code, this would provide no advantages as promises would still have to be
 * used.
 */

module.exports = function(config) {
    var datDir = path.resolve(__dirname, '..', config.vesselData.dir);

    function readSnt(filename) {
        var fullPath = path.resolve(datDir, filename);
        return fs.readFileAsync(fullPath).then(function(sntFile) {

            var i = 0;
            var grid = {};

            for (var x = -2; x <= 2; x++) {
                grid[x] = {};
                for (var y =-2; y <= 2; y++) {
                    grid[x][y] = {};
                    for (var z = 0; z <= 9; z++) {

                        var graphicX = sntFile.readFloatLE(i);
                        var graphicY = sntFile.readFloatLE(i + 4);
                        var graphicZ = sntFile.readFloatLE(i + 8);
                        var sys      = sntFile.readInt32LE(i + 12);

                        if (sys != -2) {
                            grid[x][y][z] = {
                                sys:sys,
                                graphicX: graphicX,
                                graphicY: graphicY,
                                graphicZ: graphicZ
                            };
                        }

                        i+=32;
                    }
                }
            }
            return grid;
        }).catch(function(e) {
            debug('Could not find the file ' + fullPath);
            throw e;
        });
    }

    var factions = {}, vessels = {};

    debug('Using vesselData.xml and *.snt from directory: ' + datDir);
    return fs.readFileAsync(path.resolve(datDir, 'vesselData.xml')).catch(function(e) {
        debug(e);
        throw new Error('Could not find vesselData.xml');
    }).then(function(file) {
        // Skip byte-order mark by skipping bytes until a "<" is found
        while (file.readUInt8(0) !== 0x3c) file = file.slice(1);
        var tree = xml.parseBuffer(file);
        var version = tree.attrib.version;

        return tree.childs;
    }).each(function(node) {
        if (node.name === 'hullRace') {
            debug('Reading faction ' + node.attrib.ID + ' ' + node.attrib.name + ' (' + node.attrib.keys + ')');
            factions[node.attrib.ID] = {name: node.attrib.name, keys: node.attrib.keys.split(" "), taunts: []};
            for (var j = 0; j < node.childs.length; j++) {
                factions[node.attrib.ID].taunts.push(node.childs[j].attrib);
            }
        } else if (node.name === 'vessel') {
            var vessel = {
                uniqueID: node.attrib.uniqueID,
                faction: node.attrib.side,
                classname: node.attrib.classname,
                types: node.attrib.broadType.split(" "),
                beams: [],
                tubes: [],
                torpedoStorage: {},
                engines: [],
                description: ''
            };

            return Promise.resolve(node.childs).each(function (child) {
                var name = child.name;
                var attrib = child.attrib;

                switch (name) {
                    case 'internal_data':
                        vessel.sntFile = attrib.file.replace('dat/', '');
                        return readSnt(vessel.sntFile).then(function (grid) {
                            vessel.grid = grid;
                        });
                    case 'shields':
                        vessel.frontShields = attrib.front;
                        vessel.rearShields = attrib.back;
                        break;
                    case 'torpedo_tube':
                        vessel.tubes.push(attrib);
                        break;
                    case 'beam_port':
                        vessel.beams.push(attrib);
                        break;
                    case 'torpedo_storage':
                        vessel.torpedoStorage[attrib.type] = attrib.amount;
                        break;
                    case 'engine_port':
                        vessel.engines.push(attrib);
                        break;
                    case 'long_desc':
                        vessel.description = attrib.text;
                        break;
                    case 'performance':
                        vessel.performance = {
                            turnrate: parseFloat(attrib.turnrate),
                            topspeed: parseFloat(attrib.topspeed),
                            efficiency: parseFloat(attrib.efficiency)
                        };
                }
            }).then(function () {
                vessels[node.attrib.uniqueID] = vessel;
                debug('Reading vessel  ' + node.attrib.uniqueID + ' ' + factions[vessel.faction].name + ' ' + vessel.classname + ' (' + node.attrib.broadType + ')');
            });
        }
    }).then(function() {
        debug('Writing debug json file');
        var obj = {factions: factions, vessels: vessels};

        fs.writeFileSync('vesselData.json', JSON.stringify(obj));

        return obj;
    });
};