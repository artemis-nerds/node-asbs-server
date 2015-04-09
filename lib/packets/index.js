module.exports = {
    comm:               expand(require('./comm')),
    eng:                expand(require('./eng')),
    helm:               expand(require('./helm')),
    sci:                expand(require('./sci')),
    setup:              expand(require('./setup')),
    weap:               expand(require('./weap')),
    world:              expand(require('./world')),

    captainSelect:      require('./captainSelect'),
    dmxMessage:         require('./dmxMessage'),
    gameMasterMessage:  require('./gameMasterMessage'),
    gameMasterSelect:   require('./gameMasterSelect'),
    gameMessage:        require('./gameMessage'),
    gameOver:           require('./gameOver'),
    gameOverReason:     require('./gameOverReason'),
    gameOverStats:      require('./gameOverStats'),
    gameRestart:        require('./gameRestart'),
    gameStart:          require('./gameStart'),
    heartbeat:          require('./heartbeat'),
    keyCaptureToggle:   require('./keyCaptureToggle'),
    keystroke:          require('./keystroke'),
    mainScreen:         require('./mainScreen'),
    playerShipDamage:   require('./playerShipDamage'),
    setPerspective:     require('./setPerspective'),
    skybox:             require('./skybox'),
    togglePause:        require('./togglePause'),
    togglePerspective:  require('./togglePerspective'),
    toggleShields:      require('./toggleShields')
};

function expand(item) { item.doExpand = true; return item; }