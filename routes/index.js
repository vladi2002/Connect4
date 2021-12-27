const express = require("express");
const router = express.Router();

const gameStatus = require("../statTracker");

// /* GET home page */
// router.get("/splash", function(req, res) {
//   res.sendFile("splash.html", { root: "./public" });
// });


/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});
/* GET home page */
router.get("/", function(req, res) {
  res.render("../HTML/splash.ejs", {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesCompleted: gameStatus.gamesCompleted
  });
});

module.exports = router;
