/**
 * Packet List
 */

module.exports = {
    clientActions1:     expand(require('./clientActions1')),
    clientActions2:     expand(require('./clientActions2')),
    clientActions3:     expand(require('./clientActions3')),
    gameMessage:        expand(require('./gameMessage')),
    objectUpdate:       expand(require('./objectUpdate')),
    audioCommand:       require('./audioCommand'),
    beamFired:          require('./beamFired'),
    commsIncoming:      require('./commsIncoming'),
    commsOutgoing:      require('./commsOutgoing'),
    consoleStatus:      require('./consoleStatus'),
    damcon:             require('./damcon'),
    destroyObject:      require('./destroyObject'),
    difficulty:         require('./difficulty'),
    fireBeam:           require('./fireBeam'),
    gameMasterMessage:  require('./gameMasterMessage'),
    heartbeat:          require('./heartbeat'),
    incomingAudio:      require('./incomingAudio'),
    intel:              require('./intel'),
    version:            require('./version'),
    welcome:            require('./welcome')
};

function expand(item) { item.doExpand = true; return item; }