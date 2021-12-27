/* eslint-disable no-unused-vars */
//@ts-check

const USED = -1; //letter has been used, not available anymore
const AVAIL = 1; //letter has not been used yet

function Alphabet() {
  this.letters = undefined;

  this.initialize = function () {
    this.letters = {
      A: AVAIL,
      B: AVAIL,
      C: AVAIL,
      D: AVAIL,
      E: AVAIL,
      F: AVAIL,
      G: AVAIL,
      H: AVAIL,
      I: AVAIL,
      J: AVAIL,
      K: AVAIL,
      L: AVAIL,
      M: AVAIL,
      N: AVAIL,
      O: AVAIL,
      P: AVAIL,
      Q: AVAIL,
      R: AVAIL,
      S: AVAIL,
      T: AVAIL,
      U: AVAIL,
      V: AVAIL,
      W: AVAIL,
      X: AVAIL,
      Y: AVAIL,
      Z: AVAIL,
    };
  };

  /**
   * Checks whether the input is a letter.
   * @param {string} letter
   * @returns {boolean} true if `letter` is a letter, false otherwise
   */
  this.isLetter = function (letter) {
    return Object.prototype.hasOwnProperty.call(this.letters, letter);
  };

  /**
   * Checks whether the input letter is available.
   * @param {string} letter
   * @returns {boolean} true if `letter` is available, false otherwise
   */
  this.isLetterAvailable = function (letter) {
    return this.isLetter(letter) && this.letters[letter] == AVAIL;
  };

  /**
   * Makes a letter unavailable for further use.
   * @param {string} letter
   */
  this.makeLetterUnAvailable = function (letter) {
    if (this.isLetter(letter)) {
      this.letters[letter] = USED;

      //switch off the UI element by adding the 'disabled' class name (defined in game.css)
      document.getElementById(letter).className += " disabled";
    }
  };

  /**
   * Checks if letter `letter` appears in word `word`.
   * @param {*} letter Letter to check
   * @param {*} word Word to check
   * @returns {boolean} true if `letter` appears in `word`, false otherwise
   */
  this.isLetterIn = function (letter, word) {
    if (!this.isLetter(letter) || !this.isLetterAvailable(letter)) {
      return false;
    }
    return word.indexOf(letter) >= 0;
  };

  /**
   * Retrieves the indices of all occurrences of letter `letter` in word `word`.
   * @param {*} letter letter to search for in `word`
   * @param {*} word word to look up `letter` in
   * @returns {number[]} array of indices of all occurrences of `letter` in `word`
   */
  this.getLetterInWordIndices = function (letter, word) {
    let res = [];

    if (!this.isLetterIn(letter, word)) {
      console.log(`Letter ${letter} is not in target word ${word}!`);
      return res;
    }

    for (let i = 0; i < word.length; i++) {
      if (word.charAt(i) == letter) {
        res.push(i);
      }
    }
    return res;
  };
}
