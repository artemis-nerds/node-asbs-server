/**
 * Artemis enumerations
 */

function createEnum(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        if (typeof val === 'object') object[key] = val = createEnum(val);
        obj[val] = key;
    });
    return obj;
}

// Beam frequencies
exports.beamFrequency = createEnum({
    0x00: "A",
    0x01: "B",
    0x02: "C",
    0x03: "D",
    0x04: "E"
});

// Messages sent to other players
exports.comPlayerMessage = createEnum({
    0x00: "yes",
    0x01: "no",
    0x02: "help",
    0x03: "greetings",
    0x04: "die",
    0x05: "leavingSector",
    0x06: "readyToGo",
    0x07: "followUs",
    0x08: "weFollowYou",
    0x09: "badlyDamaged",
    0x0a: "backToStation",
    0x0b: "disregard"
});

// Messages sent to enemies
exports.comEnemyMessage = createEnum({
    0x00: "surrender",
    0x01: "taunt1",
    0x02: "taunt2",
    0x03: "taunt3"
});

// Messages sent to stations
exports.comStationMessage = createEnum({
    0x00: "docking",
    0x01: "status",
    0x02: "buildHoming",
    0x03: "buildNukes",
    0x04: "buildMines",
    0x05: "buildEMPs"
});

// Messages sent to neutral ships
exports.comShipMessage = createEnum({
    0x00: "reportStatus",
    0x01: "heading0",
    0x02: "heading90",
    0x03: "heading180",
    0x04: "heading270",
    0x05: "port10",
    0x06: "starboard10",
    0x07: "attackNearest",
    0x08: "proceedToDestination",
    0x09: "defendTarget",
    0x0f: "port25",
    0x10: "starboard25"
});

// Target types
exports.comTargetType = createEnum({
    0x00: "player",
    0x01: "enemy",
    0x02: "station",
    0x03: "other"
});

// Connection types
exports.connectionType = createEnum({
    0x01: "server",
    0x02: "client"
});

// Console statuses
exports.consoleStatus = createEnum({
    0x00: "available",
    0x01: "yours",
    0x02: "unavailable"
});

// Console types
exports.consoleType = createEnum({
    0x00: "mainScreen",
    0x01: "helm",
    0x02: "weapons",
    0x03: "engineering",
    0x04: "science",
    0x05: "communications",
    0x06: "data",
    0x07: "observer",
    0x08: "captainsMap",
    0x09: "gameMaster"
});

// Drive types
exports.driveType = createEnum({
    0x00: "warp",
    0x01: "jump"
});

// Elite abilities
exports.eliteAbility = createEnum({
    0x0001: "stealth",
    0x0002: "lowVis",
    0x0004: "cloak",
    0x0006: "het",
    0x0010: "warp",
    0x0020: "teleport",
    0x0040: "tractor",
    0x0080: "drones",
    0x0100: "antiMine",
    0x0200: "antiTorp",
    0x0400: "shieldDrain"
});

// Game types
exports.gameType = createEnum({
    0x00: "seige",
    0x01: "singleFront",
    0x02: "doubleFront",
    0x03: "deepStrike",
    0x04: "peacetime",
    0x05: "borderWar"
});

// Main screen views
exports.mainScreenView = createEnum({
    0x00: "fore",
    0x01: "port",
    0x02: "starboard",
    0x03: "aft",
    0x04: "tactical",
    0x05: "longRange",
    0x06: "status"
});

// Object types
exports.objectType = createEnum({
    0x01: "player",
    0x02: "wepConsole",
    0x03: "engConsole",
    0x04: "ship",
    0x05: "station",
    0x06: "mine",
    0x07: "anomaly",
    0x09: "nebula",
    0x0a: "torpedo",
    0x0b: "blackHole",
    0x0c: "asteroid",
    0x0d: "generic",
    0x0e: "monster",
    0x0f: "whale",
    0x10: "drone"

    // For 'internal' entities like some consoles
    //0xff: "internal"
});

// Ordnance types
exports.ordanceType = createEnum({
    0x00: "homing",
    0x01: "nuke",
    0x02: "mine",
    0x03: "emp"
});

// Ship system types
exports.shipSystem = createEnum({
    0x00: "beams",
    0x01: "torpedos",
    0x02: "sensors",
    0x03: "maneuvering",
    0x04: "impulse",
    0x05: "drive",
    0x06: "foreShields",
    0x07: "aftShields"
});

// Tube statuses
exports.tubeStatus = createEnum({
    0x00: "unloaded",
    0x01: "loaded",
    0x02: "loading",
    0x03: "unloading"
});