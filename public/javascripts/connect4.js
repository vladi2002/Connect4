var tableData = document.getElementsByTagName('td');
var tableRow = document.querySelectorAll('.slot-row');
var playerTurn = document.querySelector('.player-turn');
const slots = document.querySelectorAll('.slot');

playerTurn.textContent = `Player 1's turn!`

//pushes the token to the lowest possible position of the given column and does all the checks of the game state before 
//it proceeds to inform the opponent
//we provide the column clicked and the player's color
function changeColor(column, color){
    // Get clicked column index
    let row = [];
    let result = {
        row: null,
        col: column,
        color: color,
        type: null, 
    };

    for (i = 5; i > -1; i--){
        if (tableRow[i].children[column].style.backgroundColor == 'white'){
            row.push(tableRow[i].children[column]);
                row[0].style.backgroundColor = color;
                result.row = i;
                if (horizontalCheck() || verticalCheck() || diagonalCheck() || diagonalCheck2()){
                    playerTurn.style.color = color;
                    result.type = "WINNER";
                    return result;
                }else if (drawCheck()){
                    playerTurn.textContent = 'DRAW!';
                    result.type = "DRAW";
                    return result;
                }else{
                    return result;
                }
        }
    }
   
}

//changes the color of a given cell
function changeColorCell(row, column, color) {
    const el = document.getElementById(`${row}${column}`);
    el.style.backgroundColor = color;
}

//reveals the hidden play again button once the game is over
function playAgain() {
    const playButton = document.getElementById('play-again-id');
    playButton.style.display = "block";
}

// checks if four given cells are the same color
function colorMatchCheck(one, two, three, four){
    return (one === two && one === three && one === four && one !== 'white' && one !== undefined);
}
/*
*  methods from here below check whether four have been connected after the current move
*/
function horizontalCheck(){
    for (let row = 0; row < tableRow.length; row++){
        for (let col =0; col < 4; col++){
           if (colorMatchCheck(tableRow[row].children[col].style.backgroundColor,tableRow[row].children[col+1].style.backgroundColor, 
                                tableRow[row].children[col+2].style.backgroundColor, tableRow[row].children[col+3].style.backgroundColor)){
               return true;
           }
        }
    }
}

function verticalCheck(){
    for (let col = 0; col < 7; col++){
        for (let row = 0; row < 3; row++){
            if (colorMatchCheck(tableRow[row].children[col].style.backgroundColor, tableRow[row+1].children[col].style.backgroundColor,
                                tableRow[row+2].children[col].style.backgroundColor,tableRow[row+3].children[col].style.backgroundColor)){
                return true;
            };
        }   
    }
}

function diagonalCheck(){
    for(let col = 0; col < 4; col++){
        for (let row = 0; row < 3; row++){
            if (colorMatchCheck(tableRow[row].children[col].style.backgroundColor, tableRow[row+1].children[col+1].style.backgroundColor,
                tableRow[row+2].children[col+2].style.backgroundColor,tableRow[row+3].children[col+3].style.backgroundColor)){
                    return true;
                }
            }
        }

}

function diagonalCheck2(){
    for(let col = 0; col < 4; col++){
        for (let row = 5; row > 2; row--){
            if (colorMatchCheck(tableRow[row].children[col].style.backgroundColor, tableRow[row-1].children[col+1].style.backgroundColor,
                tableRow[row-2].children[col+2].style.backgroundColor,tableRow[row-3].children[col+3].style.backgroundColor)){
                    return true;
            }
        }
    }
}

function drawCheck(){
    let fullSlot = []
    for (i=0; i < tableData.length; i++){
        if (tableData[i].style.backgroundColor !== 'white'){
            fullSlot.push(tableData[i]);
        }
    }
    if (fullSlot.length === tableData.length){
        return true;
    }
}
