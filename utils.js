// ===================================================================================
//
//                        Utility Functions
//
// ===================================================================================

const Utils = {
  /**
   * Plays a sound effect from a given path.
   * @param {string} soundPath - The path to the sound file.
   */
  playSoundEffect: (soundPath) => {
    try {
      const audio = new Audio(soundPath);
      audio.play();
    } catch (error) {
      console.error(`Could not play sound at path: ${soundPath}`, error);
    }
  },

  /**
   * Generates a random integer between min (inclusive) and max (inclusive).
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @returns {number} A random integer.
   */
  getRandomInt: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Add other utility functions here
};

// To make it usable in a browser environment without modules
window.Utils = Utils;
