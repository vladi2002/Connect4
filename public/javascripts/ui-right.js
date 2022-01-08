/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Object representing the word to guess.
 */
function VisibleWordBoard() {
  this.setWord = function(visibleWord) {
    document.getElementById("word").innerHTML = (Array.isArray(visibleWord) ? visibleWord.join("") : visibleWord);
  };
}

/**
 * Create the balloons on the game board.
 */
function createBalloons() {

  const colors = ["lightsalmon","darksalmon","salmon","lightcoral","indianred","crimson","firebrick","red","darkred"];
  let colorPick = 0;

  const div = document.getElementById("balloons");
  const size = 0.8 * 40 / Setup.MAX_ALLOWED_GUESSES;//40vw total width, leave some room (thus x0.8)

  div.style.gridTemplateColumns = `repeat(${Setup.MAX_ALLOWED_GUESSES}, ${size}vw)`;

  //add balloon elements
  for (let i = Setup.MAX_ALLOWED_GUESSES; i >= 1; i--) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.setAttribute("id", "b" + i);
    b.style.backgroundColor = colors[colorPick++%colors.length];
    b.style.height = `${size}vw`;
    b.style.width = `${size}vw`;
    div.appendChild(b);
  }
}


