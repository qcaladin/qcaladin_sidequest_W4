/*
Week 4 — Example 5: Example 5: Blob Platformer (JSON + Classes)
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

This file orchestrates everything:
- load JSON in preload()
- create WorldLevel from JSON
- create BlobPlayer
- update + draw each frame
- handle input events (jump, optional next level)

This matches the structure of the original blob sketch from Week 2 but moves
details into classes.
*/

let data; // raw JSON data
let levelIndex = 0;

let world; // WorldLevel instance (current level)
let player; // BlobPlayer instance
let gameState = "play";

function preload() {
  // Load the level data from disk before setup runs.
  data = loadJSON("levels.json");
}

function setup() {
  // Create the player once (it will be respawned per level).
  player = new BlobPlayer();

  // Load the first level.
  loadLevel(0);

  // Simple shared style setup.
  noStroke();
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  if (gameState !== "play") {
    drawEndScreen();
    return;
  }
  
  // 1) Draw the world (background + platforms)
  world.drawWorld();

  // 2) Update and draw the player on top of the world
  player.update(world.platforms);
  player.draw(world.theme.blob);


  if (world.goalBall) {
    const g = world.goalBall;
    
    if (circlesTouch(player.x, player.y, player.r, g.x, g.y, g.r)) {
      if (levelIndex === 2) {
        gameState = "win";   // Level 3 → WIN
        return;
      } else {
        loadLevel(levelIndex + 1); // Levels 1–2 → next level
        return;
      }
    }
  }

  if (gameState === "play" && levelIndex === 2) {
  for (const p of world.platforms) {
    if (p.isDeath) {
      // Check blob vs platform AABB
      const blobBox = {
        x: player.x - player.r,
        y: player.y - player.r,
        w: player.r * 2,
        h: player.r * 2
      };

      if (touchAABB(blobBox, p)) {
        gameState = "lose";
        return;
      }
    }
  }
}

  // 3) HUD
  fill(0);
  textSize(14);
  textAlign(LEFT, BASELINE);
  text(world.name, 20, 18);
  text("Move: A/D or ←/→ • Jump: Space/W/↑", 20, 36);
}

function keyPressed() {
  // Jump keys
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.jump();
  }

if (key === "r" || key === "R") {
  if (gameState === "win") {
    loadLevel(0);   // win -> restart to Level 1
  } else if (gameState === "lose") {
    loadLevel(2);   // lose -> retry Level 3
  }
 }
}

/*
Load a level by index:
- create a WorldLevel instance from JSON
- resize canvas based on inferred geometry
- spawn player using level start + physics
*/
function loadLevel(i) {
  levelIndex = i;

  // Create the world object from the JSON level object.
  world = new WorldLevel(data.levels[levelIndex]);

  // Fit canvas to world geometry (or defaults if needed).
  const W = world.inferWidth(640);
  const H = world.inferHeight(360);
  resizeCanvas(W, H);

  // Apply level settings + respawn.
  player.spawnFromLevel(world);

  gameState = "play";
}

function circlesTouch(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const rSum = ar + br;
  return dx * dx + dy * dy <= rSum * rSum;
}

function drawEndScreen() {

  if (gameState === "win") {
    background("#f79cf6");
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("YOU WIN!", width / 2, height / 2 - 30);
    textSize(18);
    text("Press R to restart", width / 2, height / 2 + 30);
  } else {
    background(0);
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("YOU LOSE!", width / 2, height / 2 - 30);
    textSize(18);
    text("Press R to retry level", width / 2, height / 2 + 30);
  }
 }

 function touchAABB(a, b) {
  return (
    a.x <= b.x + b.w &&
    a.x + a.w >= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  );
}