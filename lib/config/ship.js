/**
 * Configuration for ships
 */

module.exports = {
    /**
     * When multiplied by the impulse amount (from 0 to 1), results in the amount to add to the
     * current velocity per tick.
     *
     * Default: 0.001
     */
    accelerationCoeff: 0.001,

    /**
     * When multiplied by the velocity, results in the amount to add to the position per millisecond.
     *
     * Default: 20
     */
    velocityCoeff: 23,

    /**
     * The amount to subtract from the current velocity per tick. This should be lower than the
     * acceleration coefficient, otherwise you might not be able to start moving.
     *
     * Default: 0.001
     */
    deceleration: 0.001,

    /**
     * The 'centre' point for the rudder, from 0 to 1.
     *
     * Default: 0.5
     */
    rudderCalibrate: 0.5
};