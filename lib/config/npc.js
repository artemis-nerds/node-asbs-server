/**
 * Configuration for NPCs and AI
 */
module.exports = {
    /**
     * The minimum amount of immunities for a ship
     *
     * Default: 0
     */
    minImmunities: 0,

    /**
     * The maximum amount of immunities for a ship
     *
     * Default: 3
     */
    maxImmunities: 3,

    /**
     * When immunities are selected, first a random set of immunities are picked from the ones available
     * in vessel-data. The amount of immunities selected follows the above minImmunities and maxImmunities
     * options. Then, for each of these immunities, the immunityChance will be compared with a random number,
     * and if it passes, the ship will have the immunity. If the amount of immunities selected is less than
     * the minimum amount of immunities, this process will be repeated with all non-selected immunities,
     * and added to the current set of immunities.
     *
     * This system means that the amount of immunities is weighted towards the lower end, preventing most ships
     * from having a large amount of immunities.
     *
     * Default: 0.7
     */
    immunityChance: 0.7
};