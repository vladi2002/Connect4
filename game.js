
const websocket = require("ws");
/**
 * Create game
 * @param  {} gameID
 */
const game = function(gameID) {
    this.playerA = null;
    this.playerB = null;
    this.id = gameID;
    this.gameState = "0 JOINED"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
};

/**
 * Valid transitions
 */
game.prototype.transitionStates = { 
    "0 JOINED": 0, 
    "1 JOINED": 1, 
    "2 JOINED": 2,
    "DRAW": 3,
    "A": 4, //A won
    "B": 5, //B won
    "ABORTED": 6
};

/**
 * Shows whether the current game has 2 players
 */
game.prototype.hasTwoConnectedPlayers = function() {
    return this.gameState == "2 JOINED";
};

/**
 * Adds a player p to the game if it's possible and sets the game's status accordingly
 * @param  {} p
 */
game.prototype.addPlayer = function(p) {
    if (this.gameState != "0 JOINED" && this.gameState != "1 JOINED") {
      return new Error(
        `Invalid call to addPlayer, current state is ${this.gameState}`
      );
    }
  
    const error = this.setStatus("1 JOINED");
    if (error instanceof Error) {
      this.setStatus("2 JOINED");
    }
  
    if (this.playerA == null) {
      this.playerA = p;
      return "A";
    } else {
      this.playerB = p;
      return "B";
    }
};

/*
 * Not all game states can be transformed into each other; the transitionMatrix object encodes the valid transitions.
 * Valid transitions have a value of 1. Invalid transitions have a value of 0.
 */
game.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0, 0], //0 JOINED
    [1, 0, 1, 0, 0, 0, 0], //1 JOINED
    [0, 0, 0, 1, 0, 0, 1], //2 JOINED (note: once we have two players, there is no way back!)
    [0, 0, 0, 0, 0, 0, 0], //DRAW
    [0, 0, 0, 0, 0, 0, 0], //A WON
    [0, 0, 0, 0, 0, 0, 0], //B WON
    [0, 0, 0, 0, 0, 0, 0] //ABORTED
  ];
  
  /**
   * Determines whether the transition from state `from` to `to` is valid.
   * @param {string} from starting transition state
   * @param {string} to ending transition state
   * @returns {boolean} true if the transition is valid, false otherwise
   */
  game.prototype.isValidTransition = function(from, to) {
    let i, j;
    if (!(from in game.prototype.transitionStates)) {
      return false;
    } else {
      i = game.prototype.transitionStates[from];
    }
  
    if (!(to in game.prototype.transitionStates)) {
      return false;
    } else {
      j = game.prototype.transitionStates[to];
    }
  
    return game.prototype.transitionMatrix[i][j] > 0;
  };
  
  /**
   * Determines whether the state `s` is valid.
   * @param {string} s state to check
   * @returns {boolean}
   */
  game.prototype.isValidState = function(s) {
    return s in game.prototype.transitionStates;
  };
  
  /**
   * Updates the game status to `w` if the state is valid and the transition to `w` is valid.
   * @param {string} w new game status
   */
  game.prototype.setStatus = function(w) {
    if (
      game.prototype.isValidState(w) &&
      game.prototype.isValidTransition(this.gameState, w)
    ) {
      this.gameState = w;
      console.log("[STATUS] %s", this.gameState);
    } else {
      return new Error(
        `Impossible status change from ${this.gameState} to ${w}`
      );
    }
};

module.exports = game;
  
