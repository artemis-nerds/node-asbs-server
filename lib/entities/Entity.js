var EventEmitter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash-node');

var currentId = 1000;

/*var typeMap = {
    'player': 'playerUpdate'
};*/

/**
 * An entity
 *
 * @constructor
 * @inherits EventEmitter
 */
function Entity(server) {
    EventEmitter.call(this);

    this.server = server;
    //this.energy = 0;
    this.parents = [];

    this._whileHandlers = {};

    // Only allocate to 'public' entities
    if (this.entityType != null) this.id = currentId++;

    // Create while handlers
    var whiles = new EventEmitter();
    var pb = {}, name, self = this;
    function onPublic(name, func) {
        pb[name] = function() {
            func.call(self, function(f) {
                whiles.once('start', function() { f.call(self); });
            }, function(f) {
                whiles.once('end', function() { f.call(self); });
            }, arguments);

            return pb;
        }
    }
    var items = this._whiles;
    for (name in items) {
        if (!items.hasOwnProperty(name)) continue;
        onPublic(name, items[name]);
    }
    whiles.pb = pb;
    this._whileItems = whiles;

    this.children = {};

    this.on('tick', function(delta) {
        // Update all children
        for (var ch in self.children) {
            if (!self.children.hasOwnProperty(ch)) continue;
            var child = self.children[ch];
            for (var i = 0; i < child.length; i++) child[i].emit('tick', delta);
        }

        if (self._hasChanged && self.entityType) {
            server.triggerHook('entity.update', self, self._changedProps);
        }
    });

    this._props = {};
    this._changedProps = {};
    this._hasChanged = false;

    // Initialize default properties
    this.props({
        energy: 0
    }, true);
}
util.inherits(Entity, EventEmitter);

Entity.prototype.entityName = 'entity';
Entity.prototype.entityType = false;
Entity.prototype._whiles = {};

module.exports = Entity;

/**
 * Creates functions returned by `while` for each item
 *
 * @param entity
 * @param items
 */
Entity.createWhiles = function(entity, items) {
    //if (!entity.prototype._whiles) entity.prototype._whiles = items;
    /*else*/ entity.prototype._whiles = _.defaults({}, items, entity.prototype._whiles);
};

Entity.prototype.props = function(items, dontUpdate) {
    for (var k in items) {
        if (!items.hasOwnProperty(k)) continue;
        if (dontUpdate) this._props[k] = items[k];
        else this.prop(k, items[k]);
    }
    return this;
};

Entity.prototype.prop = function(name, val) {
    if (arguments.length < 2) return this._props[name];

    this._props[name] = val;
    this._changedProps[name] = val;
    this._hasChanged = true;
    return this;
};

Entity.prototype.forceUpdate = function() {
    if (this.entityType) this.server.triggerHook('entity.update', this, this._props);

    // Update all children
    for (var type in this.children) {
        if (!this.children.hasOwnProperty(type)) continue;
        var childList = this.children[type];
        for (var i = 0; i < childList.length; i++) {
            childList[i].forceUpdate();
        }
    }
};

/**
 * Adds an entity as the child
 *
 * @param {Entity} entity
 * @returns {Entity} this
 */
Entity.prototype.addChild = function(entity) {
    if (!(entity instanceof Entity)) throw new TypeError('Entity is not an instance of Entity class');
    if (this.hasChild(entity)) return this;

    var type = entity.entityName;
    if (!this.children[type]) this.children[type] = [];
    this.children[type].push(entity);
    //entity.id = currentId++;
    entity.parents.push(this);
    entity.emit('addParent', this);

    //entity.forceUpdate();
};

/**
 * Removes a child entity
 *
 * @param {Entity} entity
 * @returns {Entity} this
 */
Entity.prototype.removeChild = function(entity) {
    if (!(entity instanceof Entity)) throw new TypeError('Entity is not an instance of Entity class');
    for (var type in this.children) {
        if (!this.children.hasOwnProperty(type)) continue;
        var index = this.children[type].indexOf(entity);
        if (index !== -1) this.children[type].splice(index, 1);
    }

    var parentIndex = entity.parents.indexOf(this);
    if (parentIndex !== -1) entity.parents.splice(parentIndex, 1);
    entity.emit('removeParent', this);
    return this;
};

/**
 * Finds if the entity is a child
 *
 * @param {Entity} entity
 * @returns {boolean}
 */
Entity.prototype.hasChild = function(entity) {
    for (var type in this.children) {
        if (!this.children.hasOwnProperty(type)) continue;
        if (this.children[type].indexOf(entity) !== -1) return true;
    }
    return false;
};

/**
 * Gets all children of a certain type
 *
 * @param {String} type
 * @returns {Array<Entity>}
 */
Entity.prototype.getChildren = function(type) {
    return this.children[type].slice();
};

/**
 * Does things while a 'condition' is true.
 * Yeah, I know, `while` is a reserved keyword. But it doesn't make sense otherwise!
 *
 * @param {String} condition The condition name
 * @returns {Object} The functions
 */
Entity.prototype['while'] = function(condition) {
    var whiles = this._whileItems;

    var whileHandlers = this._whileHandlers[condition];
    if (!whileHandlers) whileHandlers = this._whileHandlers[condition] = { start: [], end: [], runnning: false };

    // If the while is already running, emit the start
    if (whileHandlers.running) whiles.emit('start');

    var f1, f2;
    whileHandlers.start.push(f1 = function() {
        // Call all of the 'start' functions
        whiles.emit('start');

        var f1Index = whileHandlers.start.indexOf(f1);
        if (f1Index !== -1) whileHandlers.start.splice(f1Index, 1);
    });
    whileHandlers.end.push(f2 = function() {
        console.log('emitting end');
        // Call all of the 'end' functions
        whiles.emit('end');
        console.log('done');

        var f2Index = whileHandlers.end.indexOf(f2);
        if (f2Index !== -1) whileHandlers.end.splice(f2Index, 1);
    });

    return whiles.pb;
};

/**
 * Starts a while condition
 *
 * @param {String} name The name of the condition
 * @returns {Entity} this
 */
Entity.prototype.start = function(name) {
    var handlers = this._whileHandlers[name];
    if (!handlers) return this;

    handlers.running = true;

    var i, startHandlers = handlers.start;
    for (i = 0; i < startHandlers.length; i++) {
        startHandlers[i]();
    }
    return this;
};

/**
 * Stops a while condition
 *
 * @param {String} name The name of the condition
 * @returns {Entity} this
 */
Entity.prototype.stop = function(name) {
    var handlers = this._whileHandlers[name];
    if (!handlers) return this;

    handlers.running = false;

    var i, endHandlers = handlers.end;
    for (i = 0; i < endHandlers.length; i++) {
        endHandlers[i]();
    }
    return this;
};

/**
 * Transfers energy from an entity to this entity
 * If the from entity doesn't have as much energy as amount, it's remaining energy
 * will be transferred, and the number returned will reflect the amount transferred.
 *
 * @param {Entity} from The entity to transfer from
 * @param {Number} amount The amount of energy units to transfer
 * @returns {Number} The amount of units transferred
 */
Entity.prototype.transferEnergy = function(from, amount) {
    if (!from.prop('energy')) return 0;
    if (from.prop('energy') < amount) amount = from.prop('energy');
    this.server.triggerHook('entity.transferEnergy', this, from, amount);
    return amount;
};

/**
 * Transfers energy from an entity to this entity over time
 *
 * @param {Entity} from The entity to transfer from
 * @param {Number} amount The amount of energy units to transfer
 * @param {Number} time The time to transfer them in seconds
 * @returns {Function} The tick function, use ship#removeListener('tick', f) to stop transferring
 */
Entity.prototype.transferEnergyFrom = function(from, amount, time) {
    var f, perMillisecond = amount / (time * 1000), self = this, totalTransferred = 0;
    this.on('tick', f = function(server, delta) {
        var transferAmount = perMillisecond * delta;
        var tamt = self.transferEnergy(from, transferAmount);
        totalTransferred += transferAmount;

        if (tamt < transferAmount || totalTransferred >= amount) self.removeListener('tick', f);
    });
    return f;

    // todo: handles (maybe?)
};

// Create 'while' utility functions
Entity.createWhiles(Entity, {
    transferEnergyFrom: function(start, end, args) {
        var f;
        start(function() {
            f = this.transferEnergyFrom(args[0], args[1], args[2]);
        });
        end(function() {
            this.removeListener('tick', f);
        });
    }
});

// Assign default handle callbacks
Entity.assignHooks = function(server) {
    // Send update to client
    server.hook('entity.update', function(entity, props, next, args) {
        props = args.length ? args[0] : props;
        if (entity.id != null) props.id = entity.id;
        server.send(entity.entityName + 'Update', props);
        entity._changedProps = {};
        entity._hasChanged = false;
        next();
    });

    // Transfer energy
    server.hook('entity.transferEnergy', function(entity, from, amount, next) {
        from.prop('energy', from.prop('energy') - amount);
        entity.prop('energy', entity.prop('energy') + amount);
        next();
    });
};