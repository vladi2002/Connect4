//@ts-check

const express = require("express");
const http = require("http");
const websocket = require("ws");

const messages = require("./public/javascripts/messages");

const gameStatus = require("./statTracker");
const Game = require("./game");
const { gamesCompleted } = require("./statTracker");
//const game = require("./game");
//comment
if(process.argv.length < 3) {
  console.log("Error: expected a port as argument (eg. 'node app.js 3000').");
  process.exit(1);
}
const port = process.argv[2];
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/connect4", function (req, res) {
  res.sendFile("connect4.html", {root: "./public"});
});
app.get("/", function (req, res) {
  res.render("splash.ejs", {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesCompleted: gameStatus.gamesCompleted
  });
});

const server = http.createServer(app);
const wss = new websocket.Server({ server });

const websockets = {}; //property: websocket, value: game

/*
 * regularly clean up the websockets object
 */
setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);

let currentGame = new Game(gameStatus.gamesInitialized++);
let connectionID = 0; //each websocket receives a unique ID
wss.on("connection", function connection(ws) {
  //debugger
  /*
   * two-player game: every two players are added to the same game
   */
  const con = ws;
  con["id"] = connectionID++;
  const playerType = currentGame.addPlayer(con);
  websockets[con["id"]] = currentGame;

  console.log(
    `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
  );

  /*
   * inform the client about its assigned player type
   */
  con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B);

  /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = new Game(gameStatus.gamesInitialized++);

  }

  /*
   * message coming in from a player:
   *  1. determine the game object
   *  2. determine the opposing player OP
   *  3. send the message to OP
   */
  con.on("message", function incoming(message) {
    const oMsg = JSON.parse(message.toString());
    const gameObj = websockets[con["id"]];
    const isPlayerA = gameObj.playerA == con ? true : false;
    if (!isPlayerA && gameObj.hasTwoConnectedPlayers() && message.toString() == '{}') {
      gameObj.playerA.send(messages.S_GAME_STARTED);
      gameObj.playerB.send(messages.S_GAME_STARTED);
      gameObj.playerB.send(messages.S_DISABLE);
    }
    if (isPlayerA && oMsg.type == messages.T_PICK_A_SLOT) {
      gameObj.playerB.send(message);
      gameObj.playerA.send(messages.S_DISABLE);
    } else if (!isPlayerA && oMsg.type == messages.T_PICK_A_SLOT) {
      gameObj.playerA.send(message);
      gameObj.playerB.send(messages.S_DISABLE);
    }

    if(oMsg.type == messages.T_GAME_WON_BY) {
      gameObj.setStatus(oMsg.data);
      if(oMsg.data == 'A') {
        gameObj.playerA.send(messages.S_GAME_WON_BY);
        gameObj.playerB.send(messages.S_GAME_LOST_BY);
      } else {
        gameObj.playerB.send(messages.S_GAME_WON_BY);
        gameObj.playerA.send(messages.S_GAME_LOST_BY);
      }
      gameStatus.gamesCompleted++;
      gameObj.playerA.send(messages.S_DISABLE);
      gameObj.playerB.send(messages.S_DISABLE);
    }
    if(oMsg.type == messages.T_GAME_DRAW) {
      gameObj.setStatus("DRAW");
      gameObj.playerA.send(messages.S_GAME_DRAW);
      gameObj.playerB.send(messages.S_GAME_DRAW);
      gameStatus.gamesCompleted++;
      gameObj.playerA.send(messages.S_DISABLE);
      gameObj.playerB.send(messages.S_DISABLE);
    }
  });

  con.on("close", function(code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    console.log(`${con["id"]} disconnected ...`);
    const gameObj = websockets[con["id"]];
    if (code == 1001) {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      

      if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
        gameObj.setStatus("ABORTED");
        gameStatus.gamesAborted++;
      }
    }
    
        /*
         * determine whose connection remains open;
         * close it
         */
        try {
          gameObj.playerA.close();
          gameObj.playerA = null;
        } catch (e) {
          console.log("Player A closing: " + e);
        }

        try {
          gameObj.playerB.close();
          gameObj.playerB = null;
        } catch (e) {
          console.log("Player B closing: " + e);
        }
  });
});

server.listen(port);