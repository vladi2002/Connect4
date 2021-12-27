/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
//@ts-check

/**
 * Object containing all status messages.
 */
const Status = {
  gameWon: "Congratulations! You won! ",
  gameLost: "Game over. You lost! ",
  playAgain: "&nbsp;<a href='/play'>Play again!</a>",
  player1Intro: "Player 1. Pick the English word to guess (5-15 [A-Z] chars)!",
  prompt: "Word to guess",
  promptAgainLength: "Try again! 5-15 [A-Z] characters please!",
  promptChars: "Try again! A-Z only!",
  promptEnglish: "Try again, it has to be a valid English word!",
  chosen: "Your chosen word: ",
  player2Intro: `Player 2. You win if you can guess the word within ${Setup.MAX_ALLOWED_GUESSES} tries.`,
  player2IntroNoTargetYet: `Player 2. Waiting for word to guess. You win if you can guess it within ${Setup.MAX_ALLOWED_GUESSES} tries.`,
  guessed: "Player 2 guessed letter ",
  aborted: "Your gaming partner is no longer available, game aborted. <a href='/play'>Play again!</a>"
};


