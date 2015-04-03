/**
 * node-artemis
 *
 * An Artemis SBS server interface written in Node
 */

var Server = exports.Server = require('./Server');
exports.Client = require('./Client');

/**
 * Create an Artemis server
 *
 * @param {Object} config Configuration options for the server
 * @returns {Server}
 */
exports.createServer = function(config) {
    return new Server(config);
};