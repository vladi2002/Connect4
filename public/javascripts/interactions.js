const clickSound = new Audio("../data/click.wav");

/**
 * Game state object
 * @param playerType - whether the player type is 'A' or 'B'
 * @param color - red or yellow depending on the player type
 * @param {*} sb - shows the status of the gamestate as listed in the statuses file
 * @param {*} socket - the current client-server websocket in use
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

/**
 * Retrieve the player color.
 * @returns {string} player color
 */
GameState.prototype.getColor = function () {
  return this.color;
};

/**
 * Set the player color.
 * @param {string} c player color to set
 */
GameState.prototype.setColor = function (c) {
  this.color = c;
};

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

  if (cc.type == "WINNER") {

    /* disable further clicks  on the table; then
     * replace the original node through some DOM logic
     */
    const elements = document.querySelectorAll(".slot");
    Array.from(elements).forEach(function (el) {
      // @ts-ignore
      el.style.pointerEvents = "none";
    });

    //player sends final message to server so that it concludes the game and alerts both players
      let finalMsg = Messages.O_GAME_WON_BY;
      finalMsg.data = this.playerType;
      this.socket.send(JSON.stringify(finalMsg));
  } else if (cc.type == "DRAW") {
      const elements = document.querySelectorAll(".slot");
      Array.from(elements).forEach(function (el) {
        // @ts-ignore
        el.style.pointerEvents = "none";
      });
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
      });
    });
  };

  //disables the table of slots for the player when it's not their turn
  this.pauseEventListener = function () {
    const elements = document.getElementsByTagName('td');

    Array.from(elements).forEach(function (el) {
        el.style.pointerEvents = "none";
    });
  };

  //enables the table of slots for the player when it's their turn
  this.restoreEventListener = function () {
    const elements = document.getElementsByTagName('td');

    Array.from(elements).forEach(function (el) {
        el.style.pointerEvents = "auto";
    });
  };
}

/**
 * Object representing the status bar of the gamestate containing the function that sets it
 */
 function StatusBar() {
  this.setStatus = function(status) {
    document.getElementById("status").innerHTML = status;
  };
}

//set everything up, including the WebSocket;mthis function is immediate. Here we place all the event listeners
(function setup() {
  //We hardcoded the address because clients don't have access to the port
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
  /**
   * Determine what the client should do with each message it receives from the server:
   * game started
   * player type
   * disable
   * enable to make a turn
   * game lost/won
   * draw
   * @param {*} event 
   */
  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);
    console.log('incomingMsg  ', incomingMsg);
    slotsTableSetup.restoreEventListener();
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      gs.setPlayerType(incomingMsg.data);
      gs.setColor(gs.getPlayerType() == 'A' ? 'red' : 'yellow');
      if (gs.getPlayerType() == 'A' ) {
        document.getElementById('player-ball-red').style.display = 'block';
      } else {
        document.getElementById('player-ball-yellow').style.display = 'block';
      }
      playerTurn.textContent = gs.getPlayerType() == 'A' ? "Player 1" : "Player 2";
    }
    if (incomingMsg.type == Messages.T_GAME_STARTED) {
      slotsTableSetup.initialize();
      sb.setStatus(gs.getPlayerType() == 'A' ? Status["player1Intro"] : Status["player2Intro"]);
      playerTurn.textContent = "Player 1's turn";
      
    }
    if (incomingMsg.type == Messages.T_DISABLE) {
      slotsTableSetup.pauseEventListener();
      document.getElementById('board').style.background = "grey";
      sb.setStatus(Status["turnPending"]);
      playerTurn.textContent = "Opponent's turn";
    }
    if (incomingMsg.type == Messages.T_PICK_A_SLOT) {
      document.getElementById('board').style.background = "#2E8BC0";
      changeColorCell(incomingMsg.row, incomingMsg.col, incomingMsg.color);
      sb.setStatus(Status["turnActive"]);
      playerTurn.textContent = "Your turn";
    }
    if (incomingMsg.type == Messages.T_GAME_WON_BY) {
      slotsTableSetup.pauseEventListener();
      playAgain();
      console.log("Game won by "+ incomingMsg.data);
      sb.setStatus(Status["gameWon"]);
      playerTurn.textContent = "You connected four :)";
      gs.socket.close();
    }
    if (incomingMsg.type == Messages.T_GAME_LOST_BY) {
      slotsTableSetup.pauseEventListener();
      playAgain();
      console.log("Game lost by "+ incomingMsg.data);
      sb.setStatus(Status["gameLost"]);
      playerTurn.textContent = "You lost ;( Please try again!";
      playerTurn.style.color = gs.getColor();
      gs.socket.close();
    }
    if (incomingMsg.type == Messages.T_GAME_DRAW) {
      slotsTableSetup.pauseEventListener();
      playAgain();
      console.log("Game tie!");
      sb.setStatus(Status["gameTied"]);
      gs.socket.close();
    }
  };

  //client sends an empty message once the slot opens so that the server responds by assigning it a player type
  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    console.log ("Socket closed!");
  };

  socket.onerror = function () {};
})(); //execute immediately
