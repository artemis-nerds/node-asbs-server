/**
 * Configuration for the core server
 */

module.exports = {
    /**
     * The port to host the server on.
     * You can change the port that the client connects to in the artemis.ini file.
     *
     * Default: 2010
     */
    port: 2010,

    /**
     * How often to send the heartbeat packet in milliseconds.
     * Set to 0 to disable the heartbeat packet being sent.
     *
     * Default: 1000
     */
    heartbeat: 0,

    /**
     * The speed of the internal game tick loop in Hz.
     * Must be greater than 0.
     *
     * Default: 60
     */
    tickSpeed: 1000 / 60, //250,

    /**
     * The welcome message to send to the client.
     * Recommended to be 111 chars long.
     *
     * Vanilla server default: "You have connected to Thom Robertson's Artemis Bridge Simulator. Please connect with an authorized game client."
     * Default:                "You've joined a custom Artemis SBS server running node-artemis.  Please connect with an authorized game client."
     */
    welcome: "You've joined a custom Artemis SBS server running node-artemis.  Please connect with an authorized game client.",

    /**
     * The server version to be reported.
     */
    version: {
        // Default: 2
        major: 2,

        // Default: 1
        minor: 1,

        // Default: 5
        patch: 5
    }
};