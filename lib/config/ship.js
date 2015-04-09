/**
 * Configuration for ships
 *
 * ---READ BEFORE MODIFYING---
 * These values have been selected to try to emulate the movement in the game as close as possible. Modifying these
 * values will result in glitchy visuals on the main screen, as the Artemis client simulates movement between
 * updates.
 */

module.exports = {
    /**
     * The 'center' point for the rudder, between 0 and 1.
     *
     * Default: 0.5
     */
    rudderCalibrate: 0.5,

    /**
     * The speed in which the rudder turns the ship per millisecond.
     *
     * Default: 10
     */
    rudderSpeed: 0.04,

    /**
     * When multiplied by the velocity, gives the length of the velocity vector (the amount to move) per millisecond.
     *
     * Default: 23
     */
    velocityCoeff: 0.092,

    /**
     * The speed to accelerate per millisecond.
     *
     * Default: 0.2
     */
    accelerationSpeed: 0.0008,

    /**
     * The speed to decelerate per millisecond.
     *
     * Default: 0.2
     */
    decelerationSpeed: 0.0008,

    /**
     * When multiplied by the ship top speed and the current impulse, gives the maximum velocity.
     *
     * Default: 1
     */
    maxVelocityCoeff: 1
};