/**
 * Configure the text from received messages
 */

module.exports = {
    /**
     * The text to send to players for each message type.
     *
     * Format is: [message, priority] where priority is a number from 0 to 8, 8 is the lowest
     */
    playerMessages: {
        yes:            ["Yes.",                                8],
        no:             ["No.",                                 8],
        help:           ["Help!",                               8],
        greetings:      ["Greetings.",                          8],
        die:            ["Die!",                                8],
        leavingSector:  ["We're leaving the sector. Bye.",      8],
        readyToGo:      ["Ready to go.",                        8],
        followUs:       ["Please follow us.",                   8],
        weFollowYou:    ["We'll follow you.",                   8],
        badlyDamaged:   ["We're badly damaged.",                8],
        backToBase:     ["We're headed back to the base.",      8],
        disregard:      ["Sorry, please disregard.",            8]
    },

    /**
     * The text to send to enemies for each message type.
     * Three of the four messages that can be sent to an enemy are taunts, and depend on the race
     * and the vessel data.
     *
     * Normally these values won't even be used, they will only be required if the server is made
     * to disguise players as NPCs.
     */
    enemyMessages: {
        surrender:      "Will you surrender?"
        // Other messages depend on the race of the enemy
    },

    /**
     * The text to send to bases for each message type.
     *
     * Normally these values won't even be used, they will only be required if the server is made
     * to disguise players as bases.
     */
    baseMessages: {
        docking:        "Stand by for docking.",
        status:         "Please report status.",
        buildHoming:    "Build homing missiles",
        buildNukes:     "Build nukes",
        buildMines:     "Build mines",
        buildEMPs:      "Build EMPs"
    },

    /**
     * The text to send to other ships for each message type.
     *
     * Normally these values won't even be used, they will only be required if the server is made
     * to disguise players as NPCs.
     */
    shipMessages: {
        reportStatus:           "Report status",
        heading0:               "Turn to heading 0",
        heading90:              "Turn to heading 90",
        heading180:             "Turn to heading 180",
        heading270:             "Turn to heading 270",
        port10:                 "Turn 10 degrees to port",
        starboard10:            "Turn 10 degrees to starboard",
        port25:                 "Turn 25 degrees to port",
        starboard25:            "Turn 25 degrees to starboard",
        attackNearest:          "Attack nearest enemy",
        proceedToDestination:   "Proceed to your destination",
        defendTarget:           "Go defend [target]"
    }
};
