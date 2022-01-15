# Demo game for CSE1500

This connect four game is the demo game for the Web technology part of CSE1500, the first-year *Database and Web Technology* course within TU Delft's computer science curriculum.

## Installation and starting

Make sure that you have [Node.js](https://nodejs.org/en/) installed.

To start the game, execute the following steps in the terminal:

```console
cd Connect4
npm install
npm start
```

You can now access the game at [http://localhost:3000/](http://localhost:3000/) in the browser. Bear in mind that port 3000 is hardcoded. Open another browser window to access the game as another player.

If you want to change the port two actions are required: 

1. Alter `balloons-game/package.json` (change the line `node app.js 3000` and replace `3000` in `Connect4/public/interactions.js` with your preferred port).

A click on the "Play" button brings you to the game. If you are Player 1, you are asked to click a column and start the game. If you are Player 2, you are asked to read the rules and wait for your turn.

**If you attempt to play in a browser tab whose size is below min. `800px` x `600px` you will see a _Your window is too small to play this game._ message.** You can either increase the browser window size, or zoom out (<kbd>Control</kbd><kbd>+</kbd>) or disable the CSS media query via the browser developer tools.

## Game resources

- [Button click sound](http://www.pachd.com/button.html)
- [Course demo](https://github.com/chauff/cse1500-balloons-game)
