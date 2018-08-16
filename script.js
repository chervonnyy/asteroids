const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const FPS = 30;
const MAIN_COLOR = 'white';
const SECONDARY_COLOR = 'purple';
const ARK_SIZE = 30;
const ROTATION_SPEED = 360;
const BOOST = 5;
const SLOWING = 0.7;
const ASTEROID_SIZE = 120;
const ASTEROID_SPEED = 50;
const ASTEROIDS_QUANTITY = 3;
const PHASER_SPEED = 300;


let ark = newArk();

let asteroids = [];
createAsteroids();

function createAsteroids() {
  asteroids = [];
  let x, y;
  
  for (let i = 0; i < ASTEROIDS_QUANTITY; i++) {
    do {
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
    } while(checkCriticalDistance(ark.x, ark.y, x, y) < (ASTEROID_SIZE + ARK_SIZE) * 2);
    asteroids.push(newAsteroid(x, y, ASTEROID_SIZE / 2));
  }
}

function checkCriticalDistance(x1, y1, x2, y2) {
  return Math.sqrt(((x2 - x1) ** 2) +((y2 - y1) ** 2));
}

function splitTheAsteroid(asteroid) {
  if (asteroids[asteroid].rad == ASTEROID_SIZE / 2) {
    asteroids.push(newAsteroid(asteroids[asteroid].x, asteroids[asteroid].y, ASTEROID_SIZE / 4));
    asteroids.push(newAsteroid(asteroids[asteroid].x, asteroids[asteroid].y, ASTEROID_SIZE / 4))
  } else if (asteroids[asteroid].rad == ASTEROID_SIZE / 4) {
    asteroids.push(newAsteroid(asteroids[asteroid].x, asteroids[asteroid].y, ASTEROID_SIZE / 8));
    asteroids.push(newAsteroid(asteroids[asteroid].x, asteroids[asteroid].y, ASTEROID_SIZE / 8))
  }
  asteroids.splice(asteroid, 1);
}

function newAsteroid(x, y, rad) {
  let asteroid = {
    x: x,
    y: y,
    xSpeed: ASTEROID_SPEED * Math.random() / FPS * (Math.random() < 0.5 ? -1 : 1),
    ySpeed: ASTEROID_SPEED * Math.random() / FPS * (Math.random() < 0.5 ? -1 : 1),
    rad: rad,
    ang: Math.PI * 2
  }
  return asteroid;
}

function newArk() {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    rad: ARK_SIZE / 2,
    ang: Math.PI / 2 ,
    rot: 0,
    destroyed: false,
    canShoot: true,
    shots: [],
    moving: false,
    move: {
      x: 0,
      y: 0
    }
  }
}

function shoot() {
  if (ark.canShoot) {
    ark.shots.push({
      x: ark.x + 5 / 3 * ark.rad * Math.cos(ark.ang),
      y: ark.y - 5 / 3 * ark.rad * Math.sin(ark.ang),
      xSpeed: PHASER_SPEED * Math.cos(ark.ang) / FPS,
      ySpeed: PHASER_SPEED * Math.sin(ark.ang) / FPS,
    })
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(event) {
  switch(event.keyCode) {
    case 32: // shooting
      shoot();
      break;  

    case 37: // right
      ark.rot = ROTATION_SPEED / 180 * Math.PI / FPS;
      break;
      
    case 38: // forward
      ark.moving = true;
      break;
    
    case 39: // left
      ark.rot = -ROTATION_SPEED / 180 * Math.PI / FPS;
      break;
  }
}

function keyUp(event) {
  switch(event.keyCode) {
    case 32: // shooting
      ark.canShoot = true;
      break;  

    case 37: // right
      ark.rot = 0;
      break;
      
    case 38: // forward
      ark.moving = false;
      break;
    
    case 39: // left
      ark.rot = 0;
      break;
  }
}

setInterval(update, 1000 / FPS);

function update() {
  // space
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // space ark
  if (ark.destroyed) {
    ctx.strokeStyle = 'orange';
    ctx.strokeWidth = ARK_SIZE / 2;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ark.x, ark.y, ARK_SIZE / 1.2, Math.PI * 2, 0);
    ctx.fill();
    ctx.stroke();
  } else {

    if (ark.moving) {
      ark.move.x += BOOST * Math.cos(ark.ang) / FPS;
      ark.move.y -= BOOST * Math.sin(ark.ang) / FPS;
      ctx.fillStyle = SECONDARY_COLOR;
      ctx.beginPath();
      ctx.moveTo( 
        ark.x + 4 / 3 * ark.rad * Math.cos(ark.ang),
        ark.y - 4 / 3 * ark.rad * Math.sin(ark.ang)
      );
      ctx.lineTo( 
        ark.x - ark.rad * (2 / 3 * Math.cos(ark.ang) + Math.sin(ark.ang)),
        ark.y + ark.rad * (2 / 3 * Math.sin(ark.ang) - Math.cos(ark.ang))
      );
      ctx.lineTo( 
        ark.x - ark.rad * (2 / 3 * Math.cos(ark.ang) - Math.sin(ark.ang)),
        ark.y + ark.rad * (2 / 3 * Math.sin(ark.ang) + Math.cos(ark.ang))
      );
      ctx.fill();
      
    } else {
      ark.move.x -= SLOWING * ark.move.x / FPS;
      ark.move.y -= SLOWING * ark.move.y / FPS;
    }
    
    ctx.strokeStyle = MAIN_COLOR;
    ctx.lineWidth = ARK_SIZE / 10;
    ctx.beginPath();
    ctx.moveTo( 
      ark.x + 4 / 3 * ark.rad * Math.cos(ark.ang),
      ark.y - 4 / 3 * ark.rad * Math.sin(ark.ang)
    );
    ctx.lineTo( 
      ark.x - ark.rad * (2 / 3 * Math.cos(ark.ang) + Math.sin(ark.ang)),
      ark.y + ark.rad * (2 / 3 * Math.sin(ark.ang) - Math.cos(ark.ang))
    );
    ctx.lineTo( 
      ark.x - ark.rad * (2 / 3 * Math.cos(ark.ang) - Math.sin(ark.ang)),
      ark.y + ark.rad * (2 / 3 * Math.sin(ark.ang) + Math.cos(ark.ang))
    );
    ctx.closePath();
    ctx.stroke();
  }

  // phaser shots
  for (let i = 0; i < ark.shots.length; i++) {
    ctx.fillStyle = SECONDARY_COLOR;
    ctx.beginPath();
    ctx.arc(ark.shots[i].x, ark.shots[i].y, ARK_SIZE / 10, Math.PI * 2, 0);
    ctx.fill();
  }

  for (let i = 0; i < ark.shots.length; i++) {
    ark.shots[i].x += ark.shots[i].xSpeed;
    ark.shots[i].y -= ark.shots[i].ySpeed;
  }

  // check for hit
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = 0; j < ark.shots.length; j++) {
      if (checkCriticalDistance(asteroids[i].x, asteroids[i].y, ark.shots[j].x, ark.shots[j].y) < asteroids[i].rad) {
        splitTheAsteroid(i);
        ark.shots.splice(j, 1);
        break;
      }
    }
  }

  // check for crash
  if (!ark.destroyed) {
    for (let i = 0; i < asteroids.length; i++) {
      if (checkCriticalDistance(ark.x, ark.y, asteroids[i].x, asteroids[i].y) < ark.rad + asteroids[i].rad) {
        ark.destroyed = true;
        splitTheAsteroid(i);
        break;
      }
    }
    ark.ang += ark.rot;
    ark.x += ark.move.x;
    ark.y += ark.move.y;
  } else {
    ark = newArk();
  }
  
  // ark offscreen
  if (ark.x < 0 - ark.rad) {
    ark.x = canvas.width + ark.rad; 
  } else if (ark.x > canvas.width + ark.rad) {
    ark.x = 0 - ark.rad;
  }
  
  if (ark.y < 0 - ark.rad) {
    ark.y = canvas.height + ark.rad;
  } else if (ark.y > canvas.height + ark.rad) {
    ark.y = 0 - ark.rad;
  }
  
  // asteroids
  ctx.strokeStyle = MAIN_COLOR;
  ctx.strokeWidth = ASTEROID_SIZE / 10

  for (let i = 0; i < asteroids.length; i++) {

    ctx.beginPath();
    ctx.arc(asteroids[i].x, asteroids[i].y, asteroids[i].rad, asteroids[i].ang, 0);
    ctx.stroke();
    
    asteroids[i].x += asteroids[i].xSpeed;
    asteroids[i].y += asteroids[i].ySpeed;
    
    // asteroids offscreen
    if (asteroids[i].x < 0 - asteroids[i].rad) {
      asteroids[i].x = canvas.width + asteroids[i].rad; 
    } else if (asteroids[i].x > canvas.width + asteroids[i].rad) {
      asteroids[i].x = 0 - asteroids[i].rad;
    }

    if (asteroids[i].y < 0 - asteroids[i].rad) {
      asteroids[i].y = canvas.height + asteroids[i].rad;
    } else if (asteroids[i].y > canvas.height + asteroids[i].rad) {
      asteroids[i].y = 0 - asteroids[i].rad;
    }
  }
}


