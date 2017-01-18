 window.onload = function() {

     // Variables //////////////////////////////////////////
     var canvas = document.getElementById("game");
     var ctx = canvas.getContext("2d");
     var score = 0;
     var level = {
         columns: 0,
         rows: 0,
         radius: 20,
         balls: [],
         selectedball: { selected: false, column: 0, row: 0 }
     };

     var ballscolors = [
         ["hotpink"],
         ["green"],
         ["yellow"],
         ["blue"]
     ];


     var matchesArray = [];
     var moves = false;
     var gameStart = false;


     //_________________________________________________________//

     // Initialize the game
     function init(colNumber) {
         //Set number of row and columns in the game
         level.columns = colNumber;
         level.rows = colNumber;

         //Clear array of balls in level
         level.balls = []

         // Initialize the two-dimensional balls array
         for (var i = 0; i < level.columns; i++) {
             level.balls[i] = [];
             for (var j = 0; j < level.rows; j++) {
                 level.balls[i][j] = { type: 0, shift: 0 }
             }
         }
         //Event listener CLICK
         canvas.addEventListener("mousedown", onMouseDown);

         newGame();

     }


     // Start New Game.
     function newGame() {

         gameStart = true;

         // Prepare our game.
         renderGameField();
         createLevel();
         prepareGame();
         renderBalls();

         //Set score to 0
         score = 0;

         // Set Intervals of frames changes in Canvas
         setInterval(function() {
             renderSelectedBall()
             document.getElementById('score').innerHTML = score
         }, 1000 / 60);


         setInterval(function() {
             renderAll()
         }, 1000 / 60);

     }

     // Check is game valid. 
     function prepareGame() {
         findMatches();

         while (matchesArray.length > 0) {
             removeMatches();
             shift();
             findMatches();
         }

         findMoves();
         if (moves == false) {
             prepareGame();
         }
     }


     // Create a level with random balls
     function createLevel() {
         for (var i = 0; i < level.columns; i++) {
             for (var j = 0; j < level.rows; j++) {
                 level.balls[i][j].type = getRandomBalls();
             }
         }
     }


     // Get random Balls by colors
     function getRandomBalls() {
         return Math.floor(Math.random() * ballscolors.length);
     }


     // Finding balls positions
     function findBallCoordinate(column, row) {
         var ballX = column * (level.radius + 25) + 22;
         var ballY = row * (level.radius + 25) + 22;
         return { ballX: ballX, ballY: ballY };
     };


     // Brut-Force method of finding matches of 3 and more balls in vertical and horizontal 
     function findMatches() {
         matchesArray = []

         //horizontal
         for (var j = 0; j < level.rows; j++) {
             var Matches = 1;
             for (var i = 0; i < level.columns; i++) {
                 var check = false;
                 if (i == level.columns - 1) {
                     check = true;
                 } else {
                     if (level.balls[i][j].type == level.balls[i + 1][j].type) {
                         Matches += 1;
                     } else {
                         check = true;
                     }
                 }
                 if (check) {
                     if (Matches >= 3) {
                         matchesArray.push({
                             column: i + 1 - Matches,
                             row: j,
                             count: Matches,
                             horizontal: true
                         })
                     }
                     Matches = 1;
                 }
             }
         }

         //vertical 
         for (var i = 0; i < level.columns; i++) {
             var Matches = 1;
             for (var j = 0; j < level.rows; j++) {
                 var check = false;
                 if (j == level.rows - 1) {
                     check = true;
                 } else {
                     if (level.balls[i][j].type == level.balls[i][j + 1].type) {
                         Matches += 1;
                     } else {
                         check = true;
                     }
                 }
                 if (check) {
                     if (Matches >= 3) {
                         matchesArray.push({
                             column: i,
                             row: j + 1 - Matches,
                             count: Matches,
                             horizontal: false
                         })
                     }
                     Matches = 1;
                 }
             }
         }

     }


     //Remove matches  and calling "shift from TOP" function
     function removeMatches() {
         for (var i = 0; i < matchesArray.length; i++) {
             var c = 0;
             var r = 0;
             var matches = matchesArray[i];
             for (j = 0; j < matches.count; j++) {
                 if (matches.horizontal === false) {
                     level.balls[matches.column][matches.row + r].type = -1;
                     r += 1
                     score += 10
                 } else {
                     level.balls[matches.column + c][matches.row].type = -1;
                     c += 1
                     score += 10
                 }
             }
         }
     }


     // Shift from TOP and random generate new balls 
     function shift() {
         for (var i = 0; i < level.columns; i++) {
             var shift = 0;
             for (var j = level.rows - 1; j >= 0; j--) {
                 if (level.balls[i][j].type == -1) {
                     shift++
                     level.balls[i][j].shift = 0
                 } else {
                     level.balls[i][j].shift = shift
                     if (shift > 0) {
                         swap(i, j, i, j + shift)
                         level.balls[i][j].shift = 0;
                     }
                 }
                 if (level.balls[i][j].type == -1) {
                     level.balls[i][j].type = getRandomBalls();
                 }
             }
         }

         //Check have we still any valid move. If not - the Game is OVER.
         findMoves();
         if (moves == false) {
             alert('Game Over!' + 'Вы набрали: ' + score + ' очков!');
         }

     }

     // looking for available moves in our game. 
     function findMoves() {
         moves = false
         for (var i = 0; i < level.columns; i++) {
             for (var j = 0; j < level.rows - 1; j++) {
                 swap(i, j, i, j + 1)
                 findMatches();
                 swap(i, j, i, j + 1)
                 if (matchesArray.length > 0) {
                     moves = true;
                 }
             }
         }
         for (var j = 0; j < level.rows; j++) {
             for (var i = 0; i < level.columns - 1; i++) {
                 swap(i, j, i + 1, j)
                 findMatches();
                 swap(i, j, i + 1, j)
                 if (matchesArray.length > 0) {
                     moves = true;
                 }
             }
         }
         matchesArray = []
     }


     // Swap balls function 
     function swap(x1, y1, x2, y2) {
         var typeswap = level.balls[x1][y1].type;
         level.balls[x1][y1].type = level.balls[x2][y2].type;
         level.balls[x2][y2].type = typeswap;
     }

     // On mouse click function
     function onMouseDown(e) {
         var x = e.layerX
         var y = e.layerY
         clickBall(x, y)
     }


     // Checking possibility of moving balls. If yes - swap balls!
     function canMove(c1, r1, c2, r2) {
         if (c2 == c1 && Math.abs(r1 - r2) == 1 || r2 == r1 && Math.abs(c1 - c2) == 1) {
             if (check(c1, r1, c2, r2)) {
                 swap(c1, r1, c2, r2);
             }
         }
     }


     //Check is our move will made a combination of 3 or more
     function check(c1, r1, c2, r2) {
         //  return true
         swap(c1, r1, c2, r2);
         findMatches()
         swap(c1, r1, c2, r2);
         if (matchesArray.length >= 1) {
             var goodMove = true
         } else {
             goodMove = false
         }
         matchesArray = []
         return goodMove
     }


     // By this way we are looking for the ball we clicked and save it as clicked one.
     // The secound click will be saved too and position of this 2 balls  will be send for check in our check function.
     function clickBall(x, y) {
         for (var i = 0; i < level.columns; i++) {
             for (var j = 0; j < level.rows; j++) {
                 var maxX = Math.round(level.balls[i][j].posX + level.radius + 1)
                 var maxY = Math.round(level.balls[i][j].posY + level.radius + 1)
                 var minX = Math.round(level.balls[i][j].posX - level.radius - 1)
                 var minY = Math.round(level.balls[i][j].posY - level.radius - 1)
                 if (x > minX && x < maxX && y > minY && y < maxY && level.selectedball.selected != true) {
                     level.selectedball.selected = true;
                     level.selectedball.column = i;
                     level.selectedball.row = j;
                 } else if (x > minX && x < maxX && y > minY && y < maxY) {
                     var c1 = level.selectedball.column
                     var r1 = level.selectedball.row
                     var c2 = i;
                     var r2 = j;
                     canMove(c1, r1, c2, r2);
                     level.selectedball.selected = false;
                 }
             }
         }
     }


     // RENDERING THE GAME

     // Render game field 
     function renderGameField() {
         canvas.width = level.columns * level.radius * 2 + level.columns * 5;
         canvas.height = level.columns * level.radius * 2 + level.columns * 5;
         ctx.fillStyle = "black";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
     }


     // Render balls. All balls will be rended randomly.
     function renderBalls() {
         for (var i = 0; i < level.columns; i++) {
             for (var j = 0; j < level.rows; j++) {
                 if (level.balls[i][j].type > -1) {
                     // Calculate the tile coordinates
                     var coord = findBallCoordinate(i, j);
                     var col = ballscolors[level.balls[i][j].type];
                     level.balls[i][j].posX = coord.ballX;
                     level.balls[i][j].posY = coord.ballY;
                     drawBall(coord.ballX, coord.ballY, col);
                     if (level.selectedball.selected) {
                         renderSelectedBall(); // We use this, to avoid blinking of selected ball
                     }
                 }
             }

         }
     }


     // Paint our selected ball in RED
     function renderSelectedBall() {
         for (var i = 0; i < level.columns; i++) {
             for (var j = 0; j < level.rows; j++) {
                 if (level.selectedball.selected) {
                     drawBall(level.balls[level.selectedball.column][level.selectedball.row].posX, level.balls[level.selectedball.column][level.selectedball.row].posY, 'red')
                 }
             }
         }
     }


     //Draw Balls
     function drawBall(x, y, color) {
         ctx.beginPath();
         ctx.arc(x, y, level.radius, 0, 2 * Math.PI, false);
         ctx.fillStyle = color;
         ctx.stroke();
         ctx.fill();

     }


     // Rendering all function
     function renderAll() {
         renderBalls()
         findMatches()
         removeMatches();
         shift();
     }



     //START THE GAME
     start.onclick = function() {
         if (gameStart == false) {
             var colNumber = document.getElementById('number').value;
             if (colNumber <= 4) {
                 alert('Выберите число рядов и строк больше или равно 5')
             } else if (colNumber >= 13) {
                 alert('Для комфортной игры выберите число меньше 13')
             } else {
                 init(colNumber);
                 document.getElementById('start').value = 'Закончить игру!'
             }
         } else {
             document.getElementById('start').value = 'Начать игру'
             alert('GAME OVER! ' + ' Вы набрали: ' + score + ' очков!!!');
             gameStart = false;

         }

     }

 }