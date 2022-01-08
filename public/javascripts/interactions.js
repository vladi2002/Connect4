/* eslint-disable no-undef */
//@ts-check

const clickSound = new Audio("../data/click.wav");

/**
 * Game state object
 * @param {*} sb
 * @param {*} socket
 */
function GameState(sb, socket) {
  this.playerType = null;
  this.wrongGuesses = 0;
  this.visibleWordArray = null;
  this.alphabet = new Alphabet();
  this.alphabet.initialize();
  this.targetWord = null;
  this.statusBar = sb;
  this.socket = socket;
}

/**
 * Initializes the word array.
 */
GameState.prototype.initializeVisibleWordArray = function () {
  this.visibleWordArray = new Array(this.targetWord.length);
  this.visibleWordArray.fill(Setup.HIDDEN_CHAR);
};

/**
 * Retrieve the player type.
 * @returns {string} player type
 */
GameState.prototype.getPlayerType = function () {
  return this.playerType;
};

/**
 * Set the player type.
 * @param {string} p player type to set
 */
GameState.prototype.setPlayerType = function (p) {
  this.playerType = p;
};

/**
 * Set the word to guess.
 * @param {string} w word to set
 */
GameState.prototype.setTargetWord = function (w) {
  this.targetWord = w;
};

/**
 * Retrieve the word array.
 * @returns {string[]} array of letters
 */
GameState.prototype.getVisibleWordArray = function () {
  return this.visibleWordArray;
};

/**
 * Increase the wrong-guess count.
 */
GameState.prototype.incrWrongGuess = function () {
  this.wrongGuesses++;

  if (this.whoWon() == null) {
    //hide a balloon
    const id = "b" + this.wrongGuesses;
    document.getElementById(id).className += " balloonGone";
  }
};

/**
 * Check if anyone one won.
 * @returns {string|null} player who whon or null if there is no winner yet
 */
GameState.prototype.whoWon = function () {
  //too many wrong guesses? Player A (who set the word) won
  if (this.wrongGuesses > Setup.MAX_ALLOWED_GUESSES) {
    return "A";
  }
  //word solved? Player B won
  if (this.visibleWordArray.indexOf(Setup.HIDDEN_CHAR) < 0) {
    return "B";
  }
  return null; //nobody won yet
};

/**
 * Retrieve the positions of the given letter in the target word.
 * @param {string} letter
 * @param {number[]} indices
 */
GameState.prototype.revealLetters = function (letter, indices) {
  for (let i = 0; i < indices.length; i++) {
    this.visibleWordArray[indices[i]] = letter;
  }
};

/**
 * Reveal all letters.
 */
GameState.prototype.revealAll = function () {
  this.visibleWordBoard.setWord(this.targetWord);
};

/**
 * Update the game state given the letter that was just clicked.
 * @param {string} clickedLetter
 */
GameState.prototype.updateGame = function (clickedSlot) {
  debugger

  changeColor(clickedSlot.charAt(1));
  const outgoingMsg = Messages.O_PICK_A_SLOT;
  outgoingMsg.row = clickedSlot.charAt(0);
  outgoingMsg.col = clickedSlot.charAt(1);
  outgoingMsg.color = this.playerType === 'A' ? 'red' : 'yellow';
  this.socket.send(JSON.stringify(outgoingMsg));

  //is the game complete?
  const winner = this.whoWon();

  if (winner != null) {
    this.revealAll();

    /* disable further clicks by cloning each alphabet
     * letter and not adding an event listener; then
     * replace the original node through some DOM logic
     */
    const elements = document.querySelectorAll(".letter");
    Array.from(elements).forEach(function (el) {
      // @ts-ignore
      el.style.pointerEvents = "none";
    });

    let alertString;
    if (winner == this.playerType) {
      alertString = Status["gameWon"];
    } else {
      alertString = Status["gameLost"];
    }
    alertString += Status["playAgain"];
    this.statusBar.setStatus(alertString);

    //player B sends final message
    if (this.playerType == "B") {
      let finalMsg = Messages.O_GAME_WON_BY;
      finalMsg.data = winner;
      this.socket.send(JSON.stringify(finalMsg));
    }
    this.socket.close();
  }
};

// var tableRow = document.getElementsByTagName('tr');
// var tableData = document.getElementsByTagName('td');
// var playerTurn = document.querySelector('.player-turn');
// function changeColor(column){
//   // Get clicked column index
//   let row = [];

//   for (let i = 5; i > -1; i--){
//       if (tableRow[i].children[column].style.backgroundColor == 'white'){
//           row.push(tableRow[i].children[column]);
//           if (this.playerType === 'A'){
//               row[0].style.backgroundColor = 'red';
//               if (horizontalCheck() || verticalCheck() || diagonalCheck() || diagonalCheck2()){
//                   playerTurn.textContent = `Player 1 WINS!!`;
//                   //playerTurn.style.color = player1Color;
//                   return alert(`Player 1 WINS!!`);
//               }else if (drawCheck()){
//                   playerTurn.textContent = 'DRAW!';
//                   return alert('DRAW!');
//               }else{
//                   playerTurn.textContent = `Player 2's turn`
//                   // return currentPlayer = 2;
//                   return;
//               }
//           }else{
//               row[0].style.backgroundColor = 'yellow';
//               if (horizontalCheck() || verticalCheck() || diagonalCheck() || diagonalCheck2()){
//                   playerTurn.textContent = `Player 2 WINS!!`;
//                   //playerTurn.style.color = player2Color;
//                   return alert(`Player2 WINS!!`);
//               }else if (drawCheck()){
//                   playerTurn.textContent = 'DRAW!';
//                   return alert('DRAW!');
//               }else{
//                   playerTurn.textContent = `Player1's turn`;
//                   //return currentPlayer = 1;
//                   return;
//               }
              
//           }
//       }
//   }
 
// }


/**
 * Initialize the alphabet board.
 * @param {*} gs
 */
function AlphabetBoard(gs) {
  //only initialize for player that should actually be able to use the board
  this.initialize = function () {
    const elements = document.querySelectorAll(".letter");
    Array.from(elements).forEach(function (el) {
      el.addEventListener("click", function singleClick(e) {
        const clickedLetter = e.target["id"];
        clickSound.play();

        gs.updateGame(clickedLetter);

        /*
         * every letter can only be clicked once;
         * here we remove the event listener when a click happened
         */
        el.removeEventListener("click", singleClick, false);
      });
    });
  };
}

/**
 * Initialize the slots table.
 * @param {*} gs
 */
 function SlotsTableSetup(gs) {
  //only initialize for player that should actually be able to use the board
  this.initialize = function () {
    const elements = document.getElementsByTagName('td');
    Array.from(elements).forEach(function (el) {
      el.addEventListener("click", function singleClick(e) {
        const clickedSlot = e.target["id"];
        clickSound.play();

        gs.updateGame(clickedSlot);

        // /*
        //  * every letter can only be clicked once;
        //  * here we remove the event listener when a click happened
        //  */
        // el.removeEventListener("click", singleClick, false);
      });
    });
  };
}

/**
 * Disable the alphabet buttons.
 */
function disableAlphabetButtons() {
  const alphabet = document.getElementById("alphabet");
  const letterDivs = alphabet.getElementsByTagName("div");
  for (let i = 0; i < letterDivs.length; i++) {
    letterDivs.item(i).className += " alphabetDisabled";
  }
}

/**
 * Object representing the status bar.
 */
 function StatusBar() {
  this.setStatus = function(status) {
    document.getElementById("status").innerHTML = status;
  };
}

//set everything up, including the WebSocket
(function setup() {
  //debugger
  const socket = new WebSocket("ws://localhost:3000");

  /*
   * initialize all UI elements of the game:
   * - visible word board (i.e. place where the hidden/unhidden word is shown)
   * - status bar
   * - alphabet board
   *
   * the GameState object coordinates everything
   */

  // @ts-ignore
  const sb = new StatusBar();

  const gs = new GameState(sb, socket);
  const slotsTableSetup = new SlotsTableSetup(gs);

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);
    if (incomingMsg.type == Messages.T_GAME_STARTED) {
      slotsTableSetup.initialize();
    }
    

    // //set player type
    // if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
    //   gs.setPlayerType(incomingMsg.data); //should be "A" or "B"

    //   //if player type is A, (1) pick a word, and (2) sent it to the server
    //   if (gs.getPlayerType() == "A") {
    //     disableAlphabetButtons();

    //     sb.setStatus(Status["player1Intro"]);
    //     let validWord = -1;
    //     let promptString = Status["prompt"];
    //     let res = null;


    //     sb.setStatus(Status["chosen"] + res);
    //     gs.setTargetWord(res);
    //     gs.initializeVisibleWordArray(); // initialize the word array, now that we have the word
    //     vw.setWord(gs.getVisibleWordArray());

    //     let outgoingMsg = Messages.O_TARGET_WORD;
    //     outgoingMsg.data = res;
    //     socket.send(JSON.stringify(outgoingMsg));
    //   } else {
    //     sb.setStatus(Status["player2IntroNoTargetYet"]);
    //   }
    // }

    // //Player B: wait for target word and then start guessing ...
    // if (
    //   incomingMsg.type == Messages.T_TARGET_WORD &&
    //   gs.getPlayerType() == "B"
    // ) {
    //   gs.setTargetWord(incomingMsg.data);

    //   sb.setStatus(Status["player2Intro"]);
    //   gs.initializeVisibleWordArray(); // initialize the word array, now that we have the word
    //   slotsTableSetup.initialize();
    //   vw.setWord(gs.getVisibleWordArray());
    // }

    // //Player A: wait for guesses and update the board ...
    // if (
    //   incomingMsg.type == Messages.T_MAKE_A_GUESS &&
    //   gs.getPlayerType() == "A"
    // ) {
    //   sb.setStatus(Status["guessed"] + incomingMsg.data);
    //   gs.updateGame(incomingMsg.data);
    // }
  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    if (gs.whoWon() == null) {
      sb.setStatus(Status["aborted"]);
    }
  };

  socket.onerror = function () {};
})(); //execute immediately
