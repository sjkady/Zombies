//animation frame wrapper
(function()
{
	var lastTime = 0;
	var currTime, timeToCall, id;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = function(callback, element)
		{
			currTime = Date.now();
			timeToCall = Math.max(0, 16 - (currTime - lastTime));
			id = window.setTimeout(function()
			{
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function(id)
		{
			clearTimeout(id);
		};
	}
})();
// wrapper for our game "classes", "methods" and "objects"
window.Game = {};
// wrapper for "class" Rectangle
(function()
{
	function Rectangle(left, top, width, height)
	{
		this.left = left || 0;
		this.top = top || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	}
	Rectangle.prototype.set = function(left, top, /*optional*/ width, /*optional*/ height)
	{
		this.left = left;
		this.top = top;
		this.width = width || this.width;
		this.height = height || this.height;
		this.right = (this.left + this.width);
		this.bottom = (this.top + this.height);
	};
	Rectangle.prototype.within = function(r)
	{
		return (r.left <= this.left && r.right >= this.right && r.top <= this.top && r.bottom >= this.bottom);
	};
	Rectangle.prototype.overlaps = function(r)
	{
		return (this.left < r.right && r.left < this.right && this.top < r.bottom && r.top < this.bottom);
	};
	// add "class" Rectangle to our Game object
	Game.Rectangle = Rectangle;
})();
// wrapper for "class" Camera (avoid global objects)
(function()
{
	// possibles axis to move the camera
	var AXIS = {
		NONE: "none",
		HORIZONTAL: "horizontal",
		VERTICAL: "vertical",
		BOTH: "both"
	};
	// Camera constructor
	function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
		{
			// position of camera (left-top coordinate)
			this.xView = xView || 0;
			this.yView = yView || 0;
			// distance from followed object to border before camera starts move
			this.xDeadZone = 0; // min distance to horizontal borders
			this.yDeadZone = 0; // min distance to vertical borders
			// viewport dimensions
			this.wView = canvasWidth;
			this.hView = canvasHeight;
			// allow camera to move in vertical and horizontal axis
			this.axis = AXIS.BOTH;
			// object that should be followed
			this.followed = null;
			// rectangle that represents the viewport
			this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);
			// rectangle that represents the world's boundary (room's boundary)
			this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);
		}
		// gameObject needs to have "x" and "y" properties (as world(or room) position)
	Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
	{
		this.followed = gameObject;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	};
	Camera.prototype.update = function()
	{
		// keep following the player (or other desired object)
		if (this.followed !== null)
		{
			if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
			{
				// moves camera on horizontal axis based on followed object position
				if (this.followed.x - this.xView + this.xDeadZone > this.wView) this.xView = this.followed.x - (this.wView - this.xDeadZone);
				else if (this.followed.x - this.xDeadZone < this.xView) this.xView = this.followed.x - this.xDeadZone;
			}
			if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
			{
				// moves camera on vertical axis based on followed object position
				if (this.followed.y - this.yView + this.yDeadZone > this.hView) this.yView = this.followed.y - (this.hView - this.yDeadZone);
				else if (this.followed.y - this.yDeadZone < this.yView) this.yView = this.followed.y - this.yDeadZone;
			}
		}
		// update viewportRect
		this.viewportRect.set(this.xView, this.yView);
		// don't let camera leaves the world's boundary
		if (!this.viewportRect.within(this.worldRect))
		{
			if (this.viewportRect.left < this.worldRect.left) this.xView = this.worldRect.left;
			if (this.viewportRect.top < this.worldRect.top) this.yView = this.worldRect.top;
			if (this.viewportRect.right > this.worldRect.right) this.xView = this.worldRect.right - this.wView;
			if (this.viewportRect.bottom > this.worldRect.bottom) this.yView = this.worldRect.bottom - this.hView;
		}
	};
	// add "class" Camera to our Game object
	Game.Camera = Camera;
})();
// wrapper for "class" Player
(function()
{
	function Player(x, y)
	{
		// (x, y) = center of object
		// ATTENTION:
		// it represents the player position on the world(room), not the canvas position
		this.x = x;
		this.y = y;
		this.health = 3;
		this.kills = 0;
		this.points = 0;
		// move speed in pixels per second
		this.speed = 300;
		// render properties
		this.width = 40;
		this.height = 40;
	}
	Player.prototype.update = function(step, worldWidth, worldHeight)
	{
		// parameter step is the time between frames ( in seconds )
		// check controls and move the player accordingly
		if (this.health >= 0)
		{
			if (Game.controls.left)
			{
				if(Game.controls.up || Game.controls.down)
				{
					this.x -= this.speed / Math.sqrt(2)* step;
				}
				else
				{
					this.x -= this.speed * step;
				}
			}
			if (Game.controls.right)
			{
				if(Game.controls.up || Game.controls.down)
				{
					this.x += this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.x += this.speed * step;
				}
			}
			if (Game.controls.up)
			{
				if(Game.controls.right || Game.controls.left)
				{
				 	this.y -= this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.y -= this.speed * step;
				}
			}
			if (Game.controls.down)
			{
				if(Game.controls.right || Game.controls.left)
				{
					this.y += this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.y += this.speed * step;
				}
			}
		}
		// don't let player leaves the world's boundary
		if (this.x - this.width / 2 < 0)
		{
			this.x = this.width / 2;
		}
		if (this.y - this.height / 2 < 0)
		{
			this.y = this.height / 2;
		}
		if (this.x + this.width / 2 > worldWidth)
		{
			this.x = worldWidth - this.width / 2;
		}
		if (this.y + this.height / 2 > worldHeight)
		{
			this.y = worldHeight - this.height / 2;
		}
	};
	Player.prototype.draw = function(context, xView, yView)
	{
		// draw a simple rectangle shape as our player model
		context.save();
		context.fillStyle = "#E5C298";
		// before draw we need to convert player world's position to canvas position
		context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
		context.restore();
	};
	// add "class" Player to our Game object
	Game.Player = Player;
})();
// wrapper for "class" Zombie
(function()
{
	function Zombie(x, y, health)
	{
		// (x, y) = center of object
		// ATTENTION:
		// it represents the player position on the world(room), not the canvas position
		this.x = x;
		this.y = y;
		this.dx = 0;
		this.dy = 0;
		this.mag = 0;
		this.health = health;
		this.attackable = true;
		this.hit = false;
		this.cooldown = Math.floor((Math.random() * 3) + 1) * 1000;
		// move speed in pixels per second
		this.speed = Math.floor((Math.random() * 200) + 50);
		// render properties
		this.width = 30;
		this.height = 30;
	}
	Zombie.prototype.update = function(step, playerX, playerY)
	{
	  this.dx = (playerX - this.x);
		this.dy = (playerY - this.y);
		this.mag = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		this.x+=(this.dx/this.mag)*this.speed * step;
		this.y+=(this.dy/this.mag)*this.speed * step;
	};
	Zombie.prototype.draw = function(context, xView, yView)
	{
		// draw a simple rectangle shape as our player model
		context.save();
		if(this.hit===true)
		{
			context.fillStyle = "#8A0707";
		}
		else if (this.attackable === true)
		{
			context.fillStyle = "#565e20";
		}
		else
		{
			context.fillStyle = "#D7EB10";
		}
		// before draw we need to convert player world's position to canvas position
		context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
		context.restore();
	};
	// add "class" Player to our Game object
	Game.Zombie = Zombie;
})();
// wrapper for "class" Bullet
(function()
{
	function Bullet(x, y, ex, ey, xView, yView)
	{
		this.x = x;
		this.y = y;
		this.dx = (ex - (x - xView));
		this.dy = (ey - (y - yView));
		this.mag = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		this.speed = 700;
		this.width = 4;
		this.height = 4;
	}
	Bullet.prototype.update = function(step)
	{
		// parameter step is the time between frames ( in seconds )
		this.x += (this.dx / this.mag) * this.speed * step;
		this.y += (this.dy / this.mag) * this.speed * step;
	};
	Bullet.prototype.draw = function(context, xView, yView)
	{
		context.save();
		context.fillStyle = "#C87533";
		context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
		context.restore();
	};
	// add "class" Player to our Game object
	Game.Bullet = Bullet;
})();
// wrapper for "class" Obstacle
(function()
{
	function Obstacle(startx, y, ex, ey, xView, yView)
	{
		this.x = x;
		this.y = y;
		this.width = 100;
		this.height = 100;
	}
	Obstacle.prototype.draw = function(context, xView, yView)
	{
		context.save();
		context.fillStyle = "#7765e3";
		context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
		context.restore();
	};
	// add "class" Player to our Game object
	Game.Obstacle = Obstacle;
})();
//wrapper for "class" Gun
(function()
{
	function Gun(damage, auto, ammo, clip, shots, splash, piercing, price, cooldown, reload, speed)
	{
		this.damage = damage;
		this.auto  = auto;
		this.ammo = ammo;
		this.clip = clip;
		this.shots = shots;
		this.splash = splash;
		this.piercing = piercing;
		this.price = price;
		this.cooldown = cooldown;
		this.reload = reload;
		this.speed = speed;
	}
	Game.Gun = Gun;
})();
//wrapper for "class" Spawnpoint
(function()
{
	function Spawnpoint(x, y)
	{
		this.x = x;
		this.y = y;
	}
	Game.Spawnpoint = Spawnpoint;
})();
// wrapper for "class" Map
(function()
{
	function Map(width, height)
		{
			// map dimensions
			this.width = width;
			this.height = height;
			// map texture
			this.image = null;
		}
		// generate an example of a large map
	Map.prototype.generate = function()
	{
		var ctx = document.createElement("canvas").getContext("2d");
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;
		var rows = ~~(this.width / 44) + 1;
		var columns = ~~(this.height / 44) + 1;
		var color = "#e0e0e0";
		ctx.save();
		ctx.fillStyle = "#e0e0e0";
		for (var x = 0, i = 0; i < rows; x += 44, i++)
		{
			ctx.beginPath();
			for (var y = 0, j = 0; j < columns; y += 44, j++)
			{
				ctx.rect(x, y, 40, 40);
			}
			color = (color == "#e0e0e0" ? "#dbdbdb" : "#e0e0e0");
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}
		ctx.restore();
		// store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL("image/png");
		// clear context
		ctx = null;
	};
	Map.prototype.draw = function(context, xView, yView)
	{
		// easiest way: draw the entire map changing only the destination coordinate in canvas
		// canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
		//context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
		// didactic way:
		var sx, sy, dx, dy;
		var sWidth, sHeight, dWidth, dHeight;
		// offset point to crop the image
		sx = xView;
		sy = yView;
		// dimensions of cropped image
		sWidth = context.canvas.width;
		sHeight = context.canvas.height;
		// if cropped image is smaller than canvas we need to change the source dimensions
		if (this.image.width - sx < sWidth)
		{
			sWidth = this.image.width - sx;
		}
		if (this.image.height - sy < sHeight)
		{
			sHeight = this.image.height - sy;
		}
		// location on canvas to draw the croped image
		dx = 0;
		dy = 0;
		// match destination with source to not scale the image
		dWidth = sWidth;
		dHeight = sHeight;
		context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	};
	Game.Map = Map;
})();
// Game Script
(function()
{
	var canvas = document.getElementById("gameCanvas");
	canvas.addEventListener("click", function(e)
	{
		bulletspawn(player.x, player.y, e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, camera.xView, camera.yView);
	}, false);
	var context = canvas.getContext("2d");
	if (window.innerWidth * 0.8 > 1080)
	{
		context.canvas.width = 1080;
	}
	else
	{
		context.canvas.width = window.innerWidth * 0.8;
	}
	if (window.innerHeight * 0.8 > 824)
	{
		context.canvas.height = 824;
	}
	else
	{
		context.canvas.height = window.innerHeight * 0.7;
	}
	var last = 0; // last frame timestamp
	var now = 0; // current timestamp
	var step = now - last; // time between frames
	var hurt = 0;
	var gg = false;
	var hurtopacity = 0;
	var roundopacity = 0;
	var room = {
		width: 1760,
		height: 880,
		map: new Game.Map(1760, 880)
	};
	room.map.generate();
	var spawnpoints = [new Game.Spawnpoint(-100,-100), new Game.Spawnpoint(room.width / 2,-100), new Game.Spawnpoint(room.width +100 ,-100), new Game.Spawnpoint(-100,room.height/2),  new Game.Spawnpoint(-100,room.height + 100),  new Game.Spawnpoint(room.width/2,room.height+100),  new Game.Spawnpoint(room.width+100,room.height+100), new Game.Spawnpoint(room.width+100,room.height/2) ];
	var player = new Game.Player(room.width / 2, room.height / 2);
	var zombies = [];
	var obstacles = [];
	var shots = [];
	var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
	var spawntimer = 3000;
	var spawnnum = 10;
	var roundnum = 1;
	camera.follow(player, canvas.width / 2, canvas.height / 2);
	var injured = function()
	{
		hurtopacity = 1;
		if (player.health >= 0)
		{
			setTimeout(function()
			{
				hurtopacity -= 0.2;
			}, 100);
			setTimeout(function()
			{
				hurtopacity -= 0.2;
			}, 200);
			setTimeout(function()
			{
				hurtopacity -= 0.2;
			}, 300);
			setTimeout(function()
			{
				hurtopacity -= 0.2;
			}, 400);
			setTimeout(function()
			{
				hurtopacity -= 0.2;
			}, 500);
		}
	};
	var roundup = function()
	{
		roundopacity = 1;
		if (player.health >= 0)
		{
			setTimeout(function()
			{
				roundopacity -= 0.2;
			}, 100);
			setTimeout(function()
			{
				roundopacity -= 0.2;
			}, 200);
			setTimeout(function()
			{
				roundopacity -= 0.2;
			}, 300);
			setTimeout(function()
			{
				roundopacity -= 0.2;
			}, 400);
			setTimeout(function()
			{
				roundopacity -= 0.2;
			}, 500);
		}
	};
	var zombieattack = function(num)
	{
		player.health = player.health - 1;
		injured();
		if (player.health === 2)
		{
			heart1.style.display = 'None';
		}
		else if (player.health === 1)
		{
			heart2.style.display = 'None';
		}
		else if (player.health === 0)
		{
			heart3.style.display = 'None';
		}
		zombies[num].attackable = false;
		setTimeout(function()
		{
			if (typeof zombies[num] != "undefined")
			{
				zombies[num].attackable = true;
			}
		}, zombies[num].cooldown);
		if (zombies[num].x > player.x)
		{
			zombies[num].x = zombies[num].x + 3;
		}
		if (zombies[num].y > player.y)
		{
			zombies[num].y = zombies[num].y + 3;
		}
		if (zombies[num].x < player.x)
		{
			zombies[num].x = zombies[num].x - 3;
		}
		if (zombies[num].y < player.y)
		{
			zombies[num].y = zombies[num].y - 3;
		}
	};
	var zombieupdate = function(step)
	{
		for (var i = zombies.length - 1; i >= 0; i--)
		{
			for (var g = zombies.length - 1; g >= 0; g--)
			{
				if (i != g)
				{
					if ((Math.abs(zombies[i].x - zombies[g].x) < 30) && ((Math.abs(zombies[i].y - zombies[g].y) < 30)))
					{
						if (zombies[i].x > zombies[g].x)
						{
							zombies[i].x = zombies[i].x + 1;
							zombies[g].x = zombies[g].x - 1;
						}
						if (zombies[g].x > zombies[i].x)
						{
							zombies[g].x = zombies[g].x + 1;
							zombies[i].x = zombies[i].x - 1;
						}
						if (zombies[i].y > zombies[g].y)
						{
							zombies[i].y = zombies[i].y + 1;
							zombies[g].y = zombies[g].y - 1;
						}
						if (zombies[g].y > zombies[i].y)
						{
							zombies[g].y = zombies[g].y + 1;
							zombies[i].y = zombies[i].y - 1;
						}
					}
				}
			}
			if (Math.abs(zombies[i].x - player.x) < 35 && Math.abs(zombies[i].y - player.y) < 35)
			{
				if (zombies[i].attackable === true)
				{
					zombieattack(i);
				}
			}
			zombies[i].update(step, player.x, player.y);
		}
	};
	var zombiespawn = function()
	{
		if(runningId != -1)
		{
			var spawn = Math.floor(Math.random() * spawnpoints.length);
			if(spawnnum > 0 && zombies.length <= spawnnum)
			{
				zombies.push(new Game.Zombie(spawnpoints[spawn].x,spawnpoints[spawn].y, roundnum));
			}
			if( spawnnum <= 0)
			{
					clearInterval(spawner);
					roundnum +=1;
					round.style.color =  '#808080';
					spawntimer = spawntimer - 200;
					round.innerHTML = "Round:"+roundnum;
					setTimeout(function()
						{
							roundup();
							spawnnum = roundnum * 7;
							round.style.color = '#000000';
							spawner = setInterval(zombiespawn, spawntimer);
						},4000);
			}
		}
	};
	var zombiehit = function(num)
	{

		zombies[num].hit = true;
		setTimeout(function()
		{
			if (typeof zombies[num] != "undefined")
			{
				zombies[num].hit = false;
			}
		}, 100);
	};
	var bulletupdate = function(step)
	{
		for (var i = shots.length - 1; i >= 0; i--)
		{
			shots[i].update(step);
			for (var g = zombies.length - 1; g >= 0; g--)
			{
				if (typeof shots[i] != "undefined")
				{
					if ((Math.abs(zombies[g].x - shots[i].x) < 20) && ((Math.abs(zombies[g].y - shots[i].y) < 20)))
					{
						zombies[g].health -= 1;
						shots.splice(i, 1);
						if(zombies[g].health<=0)
						{
							zombies.splice(g, 1);
							player.kills += 1;
							player.points += 50;
							kills.innerHTML = "Kills:"+player.kills;
							points.innerHTML = "Points:"+player.points;
							spawnnum -= 1;
						}
						else
						{
							player.points += 10;
							points.innerHTML = "Points:"+player.points;
							zombiehit(g);
						}
					}
				}
			}
			if (typeof shots[i] != "undefined")
			{
				if (shots[i].x > Map.width || shots[i].x < 0)
				{
					shots.splice(i, 1);
				}
				else if (shots[i].y > Map.height || shots[i].y < 0)
				{
					shots.splice(i, 1);
				}
			}
		}
	};
	var bulletspawn = function(x, y, ex, ey, xv, yv)
	{
		shots.push(new Game.Bullet(x, y, ex, ey, xv, yv));
	};
	var update = function(step)
	{
		player.update(step, room.width, room.height);
		zombieupdate(step, player.x, player.y);
		bulletupdate(step);
		camera.update();
	};
	// Game draw function
	var draw = function()
	{
		// clear the entire canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		//hurt flash
		context.save();
		context.fillStyle = '#8A0707';
		context.globalAlpha = hurtopacity;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
		//Round flash
		context.save();
		context.fillStyle = '#197319';
		context.globalAlpha = roundopacity;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
		// redraw all objects
		room.map.draw(context, camera.xView, camera.yView);
		player.draw(context, camera.xView, camera.yView);
		for (var i = zombies.length - 1; i >= 0; i--)
		{
			zombies[i].draw(context, camera.xView, camera.yView);
		}
		for (var j = shots.length - 1; j >= 0; j--)
		{
			shots[j].draw(context, camera.xView, camera.yView);
		}
	};

	var runningId = -1;
	// Game Loop
	var gameLoop = function(timestamp)
	{ // <-- edited; timestamp comes from requestAnimationFrame. See polyfill to get this insight.
		now = timestamp; // <-- current timestamp (in milliseconds)
		step = (now - last) / 1000; // <-- time between frames (in seconds)
		last = now; // <-- store the current timestamp for further evaluation in next frame/step
		if(step > 0.1)
		{
			update(0.0001);
		}
		else
		{
			update(step);
		}
		draw();
		runningId = requestAnimationFrame(gameLoop); // <-- added
	};
	Game.play = function()
	{
		if (runningId == -1)
		{
			spawner = setInterval(zombiespawn, spawntimer);
			runningId = requestAnimationFrame(gameLoop); // <-- changed
			console.log("play");
		}
	};
	Game.togglePause = function()
	{
		if (runningId == -1)
		{
			Game.play();
		}
		else
		{
			cancelAnimationFrame(runningId); // <-- changed
			runningId = -1;
			clearInterval(spawner);
			console.log("paused");
		}
	};
})();
//controls
Game.controls = {
	left: false,
	up: false,
	right: false,
	down: false
};
window.addEventListener("keydown", function(e)
{
	switch (e.keyCode)
	{
		case 37: // left arrow
			Game.controls.left = true;
			break;
		case 38: // up arrow
			Game.controls.up = true;
			break;
		case 39: // right arrow
			Game.controls.right = true;
			break;
		case 40: // down arrow
			Game.controls.down = true;
			break;
	}
}, false);
window.addEventListener("keyup", function(e)
{
	switch (e.keyCode)
	{
		case 37: // left arrow
			Game.controls.left = false;
			break;
		case 38: // up arrow
			Game.controls.up = false;
			break;
		case 39: // right arrow
			Game.controls.right = false;
			break;
		case 40: // down arrow
			Game.controls.down = false;
			break;
		case 80: // key P pauses the game
			Game.togglePause();
			break;
	}
}, false);
//kick it all off on window load
window.onload = function()
{
	var round = document.getElementById('round');
	var heart1 = document.getElementById('heart1');
	var heart2 = document.getElementById('heart2');
	var heart3 = document.getElementById('heart3');
	var kills = document.getElementById('kills');
	var points = document.getElementById('points');
	var spawner;
	Game.play();
};
