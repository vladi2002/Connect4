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
  this.color = null;
  this.statusBar = sb;
  this.socket = socket;
}

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

GameState.prototype.getColor = function () {
  return this.color;
};

GameState.prototype.setColor = function (c) {
  this.color = c;
};

// /**
//  * Check if anyone one won.
//  * @returns {string|null} player who whon or null if there is no winner yet
//  */
// GameState.prototype.whoWon = function () {
//   //too many wrong guesses? Player A (who set the word) won
//   if (this.wrongGuesses > Setup.MAX_ALLOWED_GUESSES) {
//     return "A";
//   }
//   //word solved? Player B won
//   if (this.visibleWordArray.indexOf(Setup.HIDDEN_CHAR) < 0) {
//     return "B";
//   }
//   return null; //nobody won yet
// };

/**
 * Update the game state given the slot that was just clicked.
 * @param {string} clickedSlot
 */
GameState.prototype.updateGame = function (clickedSlot) {
  const cc = changeColor(clickedSlot.charAt(1), this.getColor());
  const outgoingMsg = Messages.O_PICK_A_SLOT;
  outgoingMsg.row = cc.row;
  outgoingMsg.col = cc.col;
  outgoingMsg.color = cc.color;
  this.socket.send(JSON.stringify(outgoingMsg));

  // //is the game complete?
  // const winner = this.whoWon();

  if (cc.type == "WINNER") {

    /* disable further clicks by cloning each alphabet
     * letter and not adding an event listener; then
     * replace the original node through some DOM logic
     */
    const elements = document.querySelectorAll(".slot");
    Array.from(elements).forEach(function (el) {
      // @ts-ignore
      el.style.pointerEvents = "none";
    });

    // let alertString;
    // if (winner == this.playerType) {
    //   alertString = Status["gameWon"];
    // } else {
    //   alertString = Status["gameLost"];
    // }
    // alertString += Status["playAgain"];
    // this.statusBar.setStatus(alertString);

    //player sends final message
      let finalMsg = Messages.O_GAME_WON_BY;
      finalMsg.data = this.playerType;
      this.socket.send(JSON.stringify(finalMsg));
    //this.socket.close();
  } else if (cc.type == "DRAW") {
      this.socket.send(JSON.stringify(Messages.O_GAME_DRAW));
  }
};

/**
 * Initialize the slots table.
 * @param {*} gs
 */
 function SlotsTableSetup(gs) {
  //only initialize for player that should actually be able to use the board
  this.initialize = function () {
    const elements = document.getElementsByTagName('td');

    Array.from(elements).forEach(function (el) {
      el.style.backgroundColor = "white";
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

  this.pauseEventListener = function () {
    const elements = document.getElementsByTagName('td');

    Array.from(elements).forEach(function (el) {
        el.style.pointerEvents = "none";
    });
  };

  this.restoreEventListener = function () {
    const elements = document.getElementsByTagName('td');

    Array.from(elements).forEach(function (el) {
        el.style.pointerEvents = "auto";
    });
  };
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
  const socket = new WebSocket("ws://localhost:3000");

  /*
   * initialize all UI elements of the game:
   * - table with slots
   * - status bar
   *
   * the GameState object coordinates everything
   */
  // @ts-ignore
  const sb = new StatusBar();

  const gs = new GameState(sb, socket);
  const slotsTableSetup = new SlotsTableSetup(gs);
  var playerTurn = document.querySelector('.player-turn');

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);
    console.log('incomingMsg  ', incomingMsg);
    slotsTableSetup.restoreEventListener();
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      gs.setPlayerType(incomingMsg.data);
      gs.setColor(gs.getPlayerType() == 'A' ? 'red' : 'yellow');
      document.getElementById('player-ball').style.backgroundColor = gs.getColor();
      playerTurn.textContent = gs.getPlayerType() == 'A' ? "Player 1" : "Player 2";
    }
    if (incomingMsg.type == Messages.T_GAME_STARTED) {
      slotsTableSetup.initialize();
      sb.setStatus(gs.getPlayerType() == 'A' ? Status["player1Intro"] : Status["player2Intro"]);
      playerTurn.textContent = "Player 1's turn";
      
    }
    if (incomingMsg.type == Messages.T_DISABLE) {
      slotsTableSetup.pauseEventListener();
      sb.setStatus(Status["turnPending"]);
      playerTurn.textContent = "Opponent's turn";
    }
    if (incomingMsg.type == Messages.T_PICK_A_SLOT) {
      changeColorCell(incomingMsg.row, incomingMsg.col, incomingMsg.color);
      sb.setStatus(Status["turnActive"]);
      playerTurn.textContent = "Your turn";
    }
    if (incomingMsg.type == Messages.T_GAME_WON_BY) {
      console.log("Game won by "+ incomingMsg.data);
      sb.setStatus(Status["gameWon"]);
      playerTurn.textContent = "You connected four :)";
      gs.socket.close();
    }
    if (incomingMsg.type == Messages.T_GAME_LOST_BY) {
      console.log("Game lost by "+ incomingMsg.data);
      sb.setStatus(Status["gameLost"]);
      playerTurn.textContent = "You lost ;( Please try again!";
      playerTurn.style.color = gs.getColor();
      gs.socket.close();
    }
    if (incomingMsg.type == Messages.T_GAME_DRAW) {
      console.log("Game tie!");
      sb.setStatus(Status["gameTied"]);
      gs.socket.close();
    }
  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    // if (gs.whoWon() == null) {
    //   sb.setStatus(Status["aborted"]);
    // }
    console.log ("Socket closed!");
  };

  socket.onerror = function () {};
})(); //execute immediately
