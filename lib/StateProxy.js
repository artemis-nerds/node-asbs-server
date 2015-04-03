/**
 * Controls communications between the server and state to prevent a state from getting or triggering events or hooks
 * when it is inactive or for any clients that are not in the state. Also is a storage medium for state data
 */

var Client = require('./Client');
var ClientGroup = require('./ClientGroup');
var util = require('util');

function StateProxy(state, server) {
    ClientGroup.call(this);

    this._proxyState = state;
    this._proxyServer = server;
    this._proxyCallbacks = [];
    this._proxyCallbacksRef = [];

    this._clientDontEmit = true;
}
util.inherits(StateProxy, ClientGroup);

module.exports = StateProxy;

StateProxy.prototype._isAllowed = function(client) {
    return !(!this.clients.length || (client instanceof Client && this.clients.indexOf(client) === -1));
};

StateProxy.prototype.on = function(event, func) {
    var p, self = this;
    this._proxyServer.on(event, p = function(client) {
        if (self._isAllowed(client)) return func.apply(this, arguments);
    });
    this._proxyCallbacksRef[this._proxyCallbacks.length] = p;
    this._proxyCallbacks.push(func);

    return this;
};
StateProxy.prototype.addListener = StateProxy.prototype.on;

StateProxy.prototype.once = function(event, func) {
    var p, self = this;
    this._proxyServer.once(event, p = function(client) {
        if (self._isAllowed(client)) return func.apply(this, arguments);
    });
    this._proxyCallbacksRef[this._proxyCallbacks.length] = p;
    this._proxyCallbacks.push(func);

    return this;
};

StateProxy.prototype.removeListener = function(event, func) {
    // todo: prevent memory leaks
    var index = 0;
    while ((index = this._proxyCallbacks.indexOf(func, index)) !== -1) {
        var refFunc = this._proxyCallbacksRef[index];
        this._proxyServer.removeListener(event, refFunc);
    }

    return this;
};

StateProxy.prototype.removeAllListeners = function(event) {
    this._proxyServer.removeAllListeners(event);
    return this;
};

StateProxy.prototype.setMaxListeners = function(n) {
    this._proxyServer.setMaxListeners(n);
    return this;
};

StateProxy.prototype.listeners = function(event) {
    return this._proxyServer.listeners(event);
};

StateProxy.prototype.emit = function() {
    return this._proxyServer.emit.apply(this._proxyServer, arguments);
};

StateProxy.prototype.hook = function(name, cb) {
    var self = this;

    var forceIsAllowed = name.indexOf('{' + this._proxyState + '}') === 0;
    this._proxyServer.hook(name, function(client) {
        if (forceIsAllowed || self._isAllowed(client)) return cb.apply(this, arguments);
        // call next if the callback cannot be executed
        arguments[arguments.length - 1]();
    });
    return this;
};

StateProxy.prototype.triggerHook = function() {
    // todo: do we need to do anything here?
    this._proxyServer.triggerHook.apply(this._proxyServer, arguments);
    return this;
};

StateProxy.prototype.cancelHook = function(name) {
    this._proxyServer.cancelHook(name);
    return this;
};
StateProxy.prototype.pauseHook = StateProxy.prototype.cancelHook;

StateProxy.prototype.resumeHook = function(name) {
    this._proxyServer.resumeHook(name);
    return this;
};