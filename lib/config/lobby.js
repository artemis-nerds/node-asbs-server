/**
 * Configuration for the lobby state
 */

module.exports = {
    /**
     * How long to wait in seconds after all players are ready before starting the game.
     * Note: this will only take effect if the default 'lobby.allPlayersReady' handle
     * is called, and the value is not overriden with `next`.
     *
     * Default: 5
     */
    readyWait: 5,

    /**
     * The default values for each ship. This can be intercepted with the 'lobby.start' handle
     * by passing the new value to `next`.
     *
     * This object contains the 'raw' values for each property. When using 'lobby.start', an array
     * of ships with `number`, `driveType`, `type` and `ship` attributes should be passed
     */
    ships: {
        0: {
            driveType: 0x00, // warp
            type:      6000,    // light cruiser // TSN Deep Space Base
            unknown:   1,    // always 1
            name:      'Potato'
        },
        1: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Wat'
        },
        2: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Hai'
        },
        3: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Umm'
        },
        4: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'I can haz potato'
        },
        5: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Lalala'
        },
        6: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Oh'
        },
        7: {
            driveType: 0x00, // warp
            type:      0,    // light cruiser
            unknown:   1,    // always 1
            name:      'Diana?'
        }
    },

    /**
     * Station properties for each ship.
     * Count is per-ship. 0 means there can be any amount of this station per ship, any other number
     * sets a limit.
     */
    stations: {
        mainScreen: {
            count: 0 // infinite consoles
        },
        helm: {
            count: 1 // 1 console
        },
        weapons: {
            count: 1 // 1 console
        },
        engineering: {
            count: 1 // 1 console
        },
        science: {
            count: 1 // 1 console
        },
        communications: {
            count: 1 // 1 console
        },
        data: {
            count: 0 // infinite consoles
        },
        observer: {
            count: 0 // infinite consoles
        },
        captainsMap: {
            count: 0 // infinite consoles
        },
        gameMaster: {
            count: 1 // 1 console
        }
    }
};