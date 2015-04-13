/**
 * node-artemis default configuration
 *
 * Contains the default configuration options for a node-artemis server
 */

module.exports = {
    server:     require('./server'),
    lobby:      require('./lobby'),
    vesselData: require('./vesselData'),
    ship:       require('./ship'),
    npc:        require('./npc'),
    comms:      require('./comms')
};