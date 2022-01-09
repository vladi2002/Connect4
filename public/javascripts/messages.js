// @ts-nocheck

(function (exports) {
  /*
   * Client to server: game is complete, the winner is ...
   */
  exports.T_GAME_WON_BY = "GAME-WON-BY";
  exports.O_GAME_WON_BY = {
    type: exports.T_GAME_WON_BY,
    data: null,
  };
  exports.S_GAME_WON_BY = JSON.stringify(exports.O_GAME_WON_BY);

  exports.T_GAME_LOST_BY = "GAME-LOST-BY";
  exports.O_GAME_LOST_BY = {
    type: exports.T_GAME_LOST_BY,
    data: null,
  };
  exports.S_GAME_LOST_BY = JSON.stringify(exports.O_GAME_LOST_BY);

  /*
   * Server to client: abort game (e.g. if second player exited the game)
   */
  exports.O_GAME_ABORTED = {
    type: "GAME-ABORTED",
  };
  exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

  /*
   * Server to client: start game (e.g. if second player entered the game)
   */
  exports.T_GAME_STARTED ="GAME-STARTED";
  exports.O_GAME_STARTED = {
    type: exports.T_GAME_STARTED,
  };
  exports.S_GAME_STARTED = JSON.stringify(exports.O_GAME_STARTED);

  exports.T_DISABLE ="PLAY-DISABLED";
  exports.O_DISABLE = {
    type: exports.T_DISABLE,
  };
  exports.S_DISABLE = JSON.stringify(exports.O_DISABLE);


  /*
   * Server to client: set as player A
   */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE";
  exports.O_PLAYER_A = {
    type: exports.T_PLAYER_TYPE,
    data: "A",
  };
  exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

  /*
   * Server to client: set as player B
   */
  exports.O_PLAYER_B = {
    type: exports.T_PLAYER_TYPE,
    data: "B",
  };
  exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

  /*
   * Server to Player A & B: game over with result won/loss
   */
  exports.T_GAME_OVER = "GAME-OVER";
  exports.O_GAME_OVER = {
    type: exports.T_GAME_OVER,
    data: null,
  };

    /*
   * Player B to server OR server to Player A: guessed character
   */
    exports.T_PICK_A_SLOT = "PICK-A-SLOT";
    exports.O_PICK_A_SLOT = {
      type: exports.T_PICK_A_SLOT,
      row: null,
      col: null,
      color: null,
    };
    
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server
