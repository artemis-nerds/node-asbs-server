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
     */
    ships: [
        {
            number:     0,
            name:       'Artemis',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     1,
            name:       'Intrepid',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     2,
            name:       'Aegis',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     3,
            name:       'Horatio',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     4,
            name:       'Excalibur',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     5,
            name:       'Hera',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     6,
            name:       'Ceres',
            driveType:  'warp',
            type:       'Light Cruiser'
        },
        {
            number:     7,
            name:       'Diana',
            driveType:  'warp',
            type:       'Light Cruiser'
        }
    ],

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