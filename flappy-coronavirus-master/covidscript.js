const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
const corona = new Image();
const bg = new Image();
const fg = new Image();
const upperPipe = new Image();
const lowerPipe = new Image();
const scoreSound = new Audio("score.mp3");

corona.src = "images/coronavirus.png";
bg.src = "images/background.png";
fg.src = "images/foreground.png";
upperPipe.src = "images/upperPipe.png";
lowerPipe.src = "images/lowerPipe.png";

// some variables
var gap = 90;
var bX = 10;
var bY = 150;
var gravity = 1.7;
var paused = false;
var score = 0;
var highscore = localStorage.getItem("high-score");
if (highscore == null) {
  highscore = 0;
}

// on key down or click/simple touch
var events = ["keydown", "click"];
for (var i = 0; i < events.length; i++) {
  document.addEventListener(events[i], event => {
    if (event.keyCode === 27) {
        togglePause();
    }
    else if(!paused) {
        moveUp();
    }
  });
}

function moveUp() {
  bY -= 30;
  var floating = 0;
  // makes the virus a bit floaty at the top
  var intervalId = setInterval(function() {
    bY -= 1;
    floating++;
    if (floating > 10) {
      clearInterval(intervalId);
    }
  }, 16.66);
}

function togglePause() {
  paused = !paused;
  if (!paused) {
    draw();
  }
}

function generateNextPosition(distance, maxHeight) {
  return {
    x: distance,
    y: Math.floor(Math.random() * maxHeight) - maxHeight
  };
}

function shiftIndexesAndGenerateNextPosition(pipe, distance, maxHeight) {
  const pipeLen = pipe.length;

  for (let i = 0; i < pipeLen; i++) {
    if (i === pipeLen - 1) {
      // Add new pipe
      pipe[pipeLen - 1] = generateNextPosition(distance, maxHeight);
      break;
    }

    // Shift indexes
    pipe[i] = pipe[i + 1];
  }

  return pipe;
}

const distanceBetweenPipes = 185;

// Preallocate pipe vector
var pipe = new Array(3).fill({});
// Prefill with values
pipe = pipe.map((_, index) =>
  generateNextPosition(
    cvs.width + distanceBetweenPipes * index,
    upperPipe.height
  )
);

// draw images
function draw() {
  ctx.drawImage(bg, 0, 0);

  for (const currentPipe of pipe) {
    var constant = upperPipe.height + gap;
    ctx.drawImage(upperPipe, currentPipe.x, currentPipe.y);
    ctx.drawImage(lowerPipe, currentPipe.x, currentPipe.y + constant);

    currentPipe.x--;

    // detect collision
    if (
      (bX + corona.width >= currentPipe.x &&
        bX <= currentPipe.x + upperPipe.width &&
        (bY <= currentPipe.y + upperPipe.height ||
          bY + corona.height >= currentPipe.y + constant)) ||
      bY + corona.height >= cvs.height - fg.height
    ) {
      if (score > highscore) {
        localStorage.setItem("high-score", score); // save the high score in local storage
      }
      // location.reload() is ignored by github pages
      window.location.href = window.location.href; // restart the game by reloading the page
    }

    if (currentPipe.x == 5) {
      score++;
      scoreSound.play();
    }
  }

  // Shift indexes and add new pipe if we've passed the first pipe
  if (bX - corona.width * 2 === pipe[0].x) {
    pipe = shiftIndexesAndGenerateNextPosition(
      pipe,
      cvs.width + distanceBetweenPipes,
      upperPipe.height
    );
  }

  ctx.drawImage(fg, 0, cvs.height - fg.height);
  ctx.drawImage(corona, bX, bY);

  bY += gravity;

  ctx.font = "20px Verdana";
  ctx.fillText("Score : " + score, 10, cvs.height - 45);
  ctx.fillText("High Score : " + highscore, 10, cvs.height - 20);

  if (!paused) {
    requestAnimationFrame(draw);
  }
}

draw();
