var util = require('util');
var EventEmitter = require('events').EventEmitter;
var states = require('./states');

var _ = require('lodash');

/**
 * Manages game states
 *
 * @param {String?} def The name of the default state
 * @constructor
 * @inherits EventEmitter
 */
function StateManager(def) {
    EventEmitter.call(this);
    def = def || "default";

    this._args = [].slice.call(arguments, 1);
    this._args.push(this);
    this._def = def;
}
util.inherits(StateManager, EventEmitter);

module.exports = StateManager;

/**
 * Initialize the state manager
 *
 * @returns {StateManager} this
 */
StateManager.prototype.initStates = function() {
    this._stateList = {};
    for (var name in states) {
        if (!states.hasOwnProperty(name)) continue;
        var state = states[name];
        if (typeof state !== 'object') throw new TypeError('Expected state object, got ' + typeof state);
        state._context = {};
        this._stateList[name] = state;

        if (state.setup) state.setup.apply(state._context, this._args);
    }

    if (!this._stateList[this._def]) {
        this._stateList[this._def] = { _context: {} };
    }

    this._current = false;
    this.switchTo(this._def);
    return this;
};

/**
 * Get a state
 *
 * @param {String} name
 * @returns {Object}
 * @private
 */
StateManager.prototype._get = function(name) {
    if (!this._stateList || !this._stateList[name]) throw new Error('No state called ' + name);
    return this._stateList[name];
};

/**
 * Switches to a state
 *
 * @param {String} name
 * @returns {StateManager} this
 */
StateManager.prototype.switchTo = function(name) {
    // Return if we are already on that state
    if (this.current === name) return this;

    var newState = this._get(name);
    if (this._current) {
        if (this._current.stop) this._current.stop.apply(this._current._context, this._args);
        this.emit('stateStop', name);
        this.emit('stop.' + name);
    }

    this.current = name;
    var startArgs = this._args.slice();
    // Pass the previous context
    startArgs.push(this._current._context);
    this._current = newState;
    if (newState.start) newState.start.apply(newState._context, startArgs);

    this.emit('stateStart', name);
    this.emit('start.' + name);

    return this;
};

/**
 * Calls a function on the current state
 *
 * @param {String} name
 * @param {Array} args
 * @returns {*} The result of the function
 */
StateManager.prototype.call = function(name, args) {
    var state = this._current;
    if (!state) throw new Error('No current state');
    args = [].slice.call(arguments, 1);
    return state[name].apply(state._context, args);
};