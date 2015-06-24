//animation frame
(function ()
{
	var lastTime = 0;
	var currTime, timeToCall, id;
	var vendors = [
		'ms',
		'moz',
		'webkit',
		'o'
	];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = function (callback, element)
		{
			currTime = Date.now();
			timeToCall = Math.max(0, 16 - (currTime - lastTime));
			id = window.setTimeout(function ()
			{
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function (id)
		{
			clearTimeout(id);
		};
	}
}());
//game
window.Game = {};
//  Rectangle
(function ()
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
	Rectangle.prototype.set = function (left, top, width, height)
	{
		this.left = left;
		this.top = top;
		this.width = width || this.width;
		this.height = height || this.height;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	};
	Rectangle.prototype.within = function (r)
	{
		return r.left <= this.left && r.right >= this.right && r.top <= this.top && r.bottom >= this.bottom;
	};
	Rectangle.prototype.overlaps = function (r)
	{
		return this.left < r.right && r.left < this.right && this.top < r.bottom && r.top < this.bottom;
	};
	// add "class" Rectangle to our Game object
	Game.Rectangle = Rectangle;
}());
//Camera
(function ()
{
	var AXIS = {
		NONE: 'none',
		HORIZONTAL: 'horizontal',
		VERTICAL: 'vertical',
		BOTH: 'both'
	};

	function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
	{
		// position of camera (left-top coordinate)
		this.xView = xView || 0;
		this.yView = yView || 0;
		// distance from followed object to border before camera starts move
		this.xDeadZone = 0;
		// min distance to horizontal borders
		this.yDeadZone = 0;
		// min distance to vertical borders
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
	Camera.prototype.follow = function (gameObject, xDeadZone, yDeadZone)
	{
		this.followed = gameObject;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	};
	Camera.prototype.update = function ()
	{
		// keep following the player (or other desired object)
		if (this.followed !== null)
		{
			if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
			{
				// moves camera on horizontal axis based on followed object position
				if (this.followed.x - this.xView + this.xDeadZone > this.wView)
				{
					this.xView = this.followed.x - (this.wView - this.xDeadZone);
				}
				else if (this.followed.x - this.xDeadZone < this.xView)
				{
					this.xView = this.followed.x - this.xDeadZone;
				}
			}
			if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
			{
				// moves camera on vertical axis based on followed object position
				if (this.followed.y - this.yView + this.yDeadZone > this.hView)
				{
					this.yView = this.followed.y - (this.hView - this.yDeadZone);
				}
				else if (this.followed.y - this.yDeadZone < this.yView)
				{
					this.yView = this.followed.y - this.yDeadZone;
				}
			}
		}
		// update viewportRect
		this.viewportRect.set(this.xView, this.yView);
		// don't let camera leaves the world's boundary
		if (!this.viewportRect.within(this.worldRect))
		{
			if (this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if (this.viewportRect.top < this.worldRect.top)
				this.yView = this.worldRect.top;
			if (this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if (this.viewportRect.bottom > this.worldRect.bottom)
				this.yView = this.worldRect.bottom - this.hView;
		}
	};
	Game.Camera = Camera;
}());
//Player
(function ()
{
	function Player(x, y)
	{
		// (x, y) = center of object
		// ATTENTION:
		// it represents the player position on the world(room), not the canvas position
		this.x = x;
		this.y = y;
		this.prex = x;
		this.prey = y;
		this.health = 3;
		this.kills = 0;
		this.points = 0;
		this.hurtopacity = 0;
		this.roundopacity = 0;
		this.move = true;
		this.gun = 0;
		// move speed in pixels per second
		this.speed = 300;
		// render properties
		this.width = 40;
		this.height = 40;
	}
	Player.prototype.update = function (step, worldWidth, worldHeight, obstacles)
	{
		// parameter step is the time between frames ( in seconds )
		// check controls and move the player accordingly
		if(Game.controls.one)
		{
			this.gun = 0;
		}
		if(Game.controls.two)
		{
			this.gun = 1;
		}
		if(Game.controls.three)
		{
			this.gun = 2;
		}
		if(Game.controls.four)
		{
			this.gun = 3;
		}
		if(Game.controls.five)
		{
			this.gun = 4;
		}
		if (this.health >= 0 && this.move === true)
		{
			if (Game.controls.left)
			{
				if (Game.controls.up || Game.controls.down)
				{
					this.prex -= this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.prex -= this.speed * step;
				}
			}
			if (Game.controls.right)
			{
				if (Game.controls.up || Game.controls.down)
				{
					this.prex += this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.prex += this.speed * step;
				}
			}
			if (Game.controls.up)
			{
				if (Game.controls.right || Game.controls.left)
				{
					this.prey -= this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.prey -= this.speed * step;
				}
			}
			if (Game.controls.down)
			{
				if (Game.controls.right || Game.controls.left)
				{
					this.prey += this.speed / Math.sqrt(2) * step;
				}
				else
				{
					this.prey += this.speed * step;
				}
			}
		}
		if (this.prex - this.width / 2 < 0)
		{
			this.prex = this.width / 2;
		}
		if (this.prey - this.height / 2 < 0)
		{
			this.prey = this.height / 2;
		}
		if (this.prex + this.width / 2 > worldWidth)
		{
			this.prex = worldWidth - this.width / 2;
		}
		if (this.prey + this.height / 2 > worldHeight)
		{
			this.prey = worldHeight - this.height / 2;
		}
		for (var t = obstacles.length - 1; t >= 0; t--)
		{
			if (Math.abs(this.prex - obstacles[t].x) <= obstacles[t].width / 2 + this.width / 2 && Math.abs(this.prey - obstacles[t].y) <= obstacles[t].height / 2 + this.height / 2)
			{
				this.move = false;
			}
		}
		if (this.move === true)
		{
			this.x = this.prex;
			this.y = this.prey;
		}
		else
		{
			this.prex = this.x;
			this.prey = this.y;
			this.move = true;
		}
	};
	Player.prototype.draw = function (context, xView, yView)
	{
		// draw a simple rectangle shape as our player model
		context.save();
		context.fillStyle = '#E5C298';
		// before draw we need to convert player world's position to canvas position
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		context.restore();
	};
	Game.Player = Player;
}());
//Zombie
(function ()
{
	function Zombie(x, y, health)
	{
		// (x, y) = center of object
		// ATTENTION:
		// it represents the player position on the world(room), not the canvas position
		this.x = x;
		this.y = y;
		this.prex = x;
		this.prey = y;
		this.dx = 0;
		this.dy = 0;
		this.mag = 0;
		this.health = health;
		this.attackable = true;
		this.hit = false;
		this.movex = true;
		this.movey = true;
		this.cooldown = Math.floor(Math.random() * 3000 + 1000);
		// move speed in pixels per second
		this.speed = Math.floor(Math.random() * 200 + 50);
		// render properties
		this.width = 30;
		this.height = 30;
	}
	Zombie.prototype.update = function (step, player, obstacles, zombies, index)
	{
		this.dx = player.x - this.x;
		this.dy = player.y - this.y;
		this.mag = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		this.prex += this.dx / this.mag * this.speed * step;
		for (var h = zombies.length - 1; h >= 0; h--)
		{
			if (h != index)
			{
				if (Math.abs(this.prex - zombies[h].x) < this.width / 2 + zombies[h].width / 2 && Math.abs(this.prey - zombies[h].y) < this.height / 2 + zombies[h].height / 2)
				{
					this.movex = false;
					this.prex -= this.dx / this.mag * this.speed * step;
				}
			}
		}
		for (var t = obstacles.length - 1; t >= 0; t--)
		{
			if (Math.abs(this.prex - obstacles[t].x) <= obstacles[t].width / 2 + this.width / 2 && Math.abs(this.prey - obstacles[t].y) <= obstacles[t].height / 2 + this.height / 2)
			{
				this.movex = false;
				this.prex -= this.dx / this.mag * this.speed * step;
			}
		}
		this.prey += this.dy / this.mag * this.speed * step;
		for (var l = zombies.length - 1; l >= 0; l--)
		{
			if (l != index)
			{
				if (Math.abs(this.prex - zombies[l].x) < this.width / 2 + zombies[l].width / 2 && Math.abs(this.prey - zombies[l].y) < this.height / 2 + zombies[l].height / 2)
				{
					this.movex = false;
					this.prey -= this.dy / this.mag * this.speed * step;
				}
			}
		}
		for (var k = obstacles.length - 1; k >= 0; k--)
		{
			if (Math.abs(this.prex - obstacles[k].x) <= obstacles[k].width / 2 + this.width / 2 && Math.abs(this.prey - obstacles[k].y) <= obstacles[k].height / 2 + this.height / 2)
			{
				this.movey = false;
				this.prey -= this.dy / this.mag * this.speed * step;
			}
		}
		if (this.movex === true)
		{
			this.x = this.prex;
		}
		else
		{
			this.prex = this.x;
			this.movex = true;
		}
		if (this.movey === true)
		{
			this.y = this.prey;
		}
		else
		{
			this.prey = this.y;
			this.movey = true;
		}
		if (Math.abs(this.x - player.x) < this.width / 2 + player.width / 2 && Math.abs(this.y - player.y) < this.height / 2 + player.height / 2)
		{
			if (this.attackable === true)
			{
				this.attackable = false;
				setTimeout(function (self)
				{
					console.log('attack over');
					self.attackable = true;
				}, this.cooldown, this);
				player.health = player.health - 1;
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
				player.hurtopacity = 0.9;
				if (player.health >= 0)
				{
					setTimeout(function ()
					{
						player.hurtopacity -= 0.1;
					}, 100);
					setTimeout(function ()
					{
						player.hurtopacity -= 0.2;
					}, 200);
					setTimeout(function ()
					{
						player.hurtopacity -= 0.2;
					}, 300);
					setTimeout(function ()
					{
						player.hurtopacity -= 0.2;
					}, 400);
					setTimeout(function ()
					{
						player.hurtopacity -= 0.2;
					}, 500);
				}
			}
		}
	};
	Zombie.prototype.draw = function (context, xView, yView)
	{
		// draw a simple rectangle shape as our player model
		context.save();
		if (this.hit === true)
		{
			context.fillStyle = '#8A0707';
		}
		else if (this.attackable === true)
		{
			context.fillStyle = '#A2AD59';
		}
		else
		{
			context.fillStyle = '#8E936D';
		}
		// before draw we need to convert player world's position to canvas position
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		context.restore();
	};
	Game.Zombie = Zombie;
}());
//Bullet
(function ()
{
	function Bullet(x, y, ex, ey, xView, yView, gun)
	{
		this.x = x;
		this.y = y;
		this.dx = ex - (x - xView);
		this.dy = ey - (y - yView);
		this.mag = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		this.speed = gun.speed;
		this.width = gun.width;
		this.height = gun.height;
		this.damage = gun.damage;
		this.splash = gun.splash;
		this.piercing = gun.piercing;
		this.shots = gun.shots;
	}
	Bullet.prototype.update = function (step)
	{
		// parameter step is the time between frames ( in seconds )
		this.x += this.dx / this.mag * this.speed * step;
		this.y += this.dy / this.mag * this.speed * step;
	};
	Bullet.prototype.draw = function (context, xView, yView)
	{
		context.save();
		context.fillStyle = '#000000';
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		context.restore();
	};
	Game.Bullet = Bullet;
}());
//Obstacle
(function ()
{
	function Obstacle(x, y, width, height)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	Obstacle.prototype.draw = function (context, xView, yView)
	{
		context.save();
		context.fillStyle = '#584D3D';
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		context.restore();
	};
	Game.Obstacle = Obstacle;
}());
// Gun
(function ()
{
	function Gun(name, damage, ammo, clip, shots, splash, piercing, cooldown, reload, speed, width, height)
	{
		this.name = name;
		this.damage = damage;
		this.ammo = ammo;
		this.clip = clip;
		this.clipsize = clip;
		this.shots = shots;
		this.splash = splash;
		this.piercing = piercing;
		this.cooltime = cooldown;
		this.cooldown = cooldown;
		this.reload = reload;
		this.reloadtime = reload;
		this.speed = speed;
		this.width = width;
		this.height = height;
	}
	Game.Gun = Gun;
}());
//Spawnpoint
(function ()
{
	function Spawnpoint(x, y)
	{
		this.x = x;
		this.y = y;
	}
	Game.Spawnpoint = Spawnpoint;
}());
//GunBuy
(function ()
{
	function GunBuy(x, y)
	{
		this.x = x;
		this.y = y;
		this.width = 100;
		this.height = 100;
	}
	Game.GunBuy = GunBuy;
}());
// Map
(function ()
{
	function Map(width, height)
	{
		// map dimensions
		this.width = width;
		this.height = height;
		// map texture
		this.image = null;
	}
	Map.prototype.generate = function ()
	{
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;
		var rows = Math.floor(this.width / 44) + 1;
		var columns = Math.floor(this.height / 44) + 1;
		var color = '#CEDFD9';
		ctx.save();
		ctx.fillStyle = '#CEDFD9';
		for (var x = 0, i = 0; i < rows; x += 44, i++)
		{
			ctx.beginPath();
			for (var y = 0, j = 0; j < columns; y += 44, j++)
			{
				ctx.rect(x, y, 40, 40);
			}
			color = color == '#CEDFD9' ? '#EBFCFB' : '#CEDFD9';
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}
		ctx.restore();
		// store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL('image/png');
		// clear context
		ctx = null;
	};
	Map.prototype.draw = function (context, xView, yView)
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
}());
// Game Script
(function ()
{
	var firing;
	var mousex;
	var mousey;
	var canvas = document.getElementById('gameCanvas');
	canvas.addEventListener('mousedown', function (e)
	{
		firing = true;
		if (e.clientX !== undefined && e.clientY !== undefined)
		{
			mousex = e.clientX;
			mousey = e.clientY;
		}
	}, false);
	canvas.addEventListener('mousemove', function (e)
	{
		if (firing)
		{
			if (e.clientX !== undefined && e.clientY !== undefined)
			{
				mousex = e.clientX;
				mousey = e.clientY;
			}
		}
	}, false);
	canvas.addEventListener('mouseup', function (e)
	{
		firing = false;
	}, false);
	var context = canvas.getContext('2d');
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
	var last = 0;
	// last frame timestamp
	var now = 0;
	// current timestamp
	var step = now - last;
	// time between frames
	var room = {
		width: 1760,
		height: 880,
		map: new Game.Map(1760, 880)
	};
	room.map.generate();
	var spawnpoints = [
		new Game.Spawnpoint(-100, -100),
		new Game.Spawnpoint(room.width / 2, -100),
		new Game.Spawnpoint(room.width + 100, -100),
		new Game.Spawnpoint(-100, room.height / 2),
		new Game.Spawnpoint(-100, room.height + 100),
		new Game.Spawnpoint(room.width / 2, room.height + 100),
		new Game.Spawnpoint(room.width + 100, room.height + 100),
		new Game.Spawnpoint(room.width + 100, room.height / 2)
	];
	var player = new Game.Player(room.width / 2, room.height / 2);
	var zombies = [];
	var obstacles = [
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50))
	];
	for (var l = obstacles.length - 1; l >= 0; l--)
	{
		if((obstacles[l].x +obstacles[l].width/2  >= player.x - player.width && obstacles[l].x -obstacles[l].width/2  <= player.x + player.width) && (obstacles[l].y +obstacles[l].height/2  >= player.y - player.height && obstacles[l].y -obstacles[l].height/2  <= player.y + player.height))
		{
			obstacles.splice(l, 1);
		}
	}
	var shots = [];
	/*name, damage, ammo, clip, shots, splash, piercing, cooldown, reload, speed, width, height*/
	var guns = [new Game.Gun('Base Pistol', 1, 64, 8, 1, 0, 0, 1, 2, 700, 4, 4),
							new Game.Gun('Semi Pistol', 1, 120, 15, 3, 0, 0, 1, 2, 700, 4, 4),
							new Game.Gun('Machine Gun', 1, 300, 30, 1, 0, 0, 0.2, 5, 700, 4, 4),
							new Game.Gun('Pea Shooter', 0.5, 200, 20, 1, 0, 0, 0.1, 3, 700, 2, 2),
							new Game.Gun('Rifle', 5, 50, 5, 1, 0, 0, 3, 5, 700, 6, 6)];
	//give defualt pistol
	var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
	var spawntimer = 2500;
	var spawnnum = 10;
	var roundnum = 1;
	camera.follow(player, canvas.width / 2, canvas.height / 2);

	var zombiespawn = function ()
	{
		if (runningId != -1)
		{
			var spawn = Math.floor(Math.random() * spawnpoints.length);
			if (spawnnum > 0 && zombies.length <= spawnnum)
			{
				zombies.push(new Game.Zombie(spawnpoints[spawn].x, spawnpoints[spawn].y, roundnum));
				spawnnum -= 1;
			}
			if (spawnnum <= 0)
			{
				clearInterval(spawner);
				roundnum += 1;
				round.style.color = '#808080';
				if (spawntimer >= 900)
				{
					spawntimer = spawntimer - 200;
				}
				round.innerHTML = 'Round:' + roundnum;
				setTimeout(function ()
				{
					player.roundopacity = 0.9;
					if (player.health >= 0)
					{
						setTimeout(function ()
						{
							player.roundopacity -= 0.1;
						}, 100);
						setTimeout(function ()
						{
							player.roundopacity -= 0.2;
						}, 200);
						setTimeout(function ()
						{
							player.roundopacity -= 0.2;
						}, 300);
						setTimeout(function ()
						{
							player.roundopacity -= 0.2;
						}, 400);
						setTimeout(function ()
						{
							player.roundopacity -= 0.2;
						}, 500);
					}
					spawnnum = roundnum * 7;
					round.style.color = '#282e25';
					spawner = setInterval(zombiespawn, spawntimer);
				}, 4000);
			}
		}
	};
	var zombiehit = function (num)
	{
		zombies[num].hit = true;
		setTimeout(function ()
		{
			if (typeof zombies[num] != 'undefined')
			{
				zombies[num].hit = false;
			}
		}, 100);
	};

	var bulletupdate = function (step, gun)
	{
		for (var i = shots.length - 1; i >= 0; i--)
		{
			shots[i].update(step);
			for (var g = zombies.length - 1; g >= 0; g--)
			{
				if (typeof shots[i] != 'undefined')
				{
					if (Math.abs(zombies[g].x - shots[i].x) < zombies[g].width / 2 + shots[i].width / 2 && Math.abs(zombies[g].y - shots[i].y) < zombies[g].height / 2 + shots[i].height / 2)
					{
						zombies[g].health -= gun.damage;
						shots.splice(i, 1);
						if (zombies[g].health <= 0)
						{
							zombies.splice(g, 1);
							player.kills += 1;
							player.points += 50;
							kills.innerHTML = 'Kills:' + player.kills;
							points.innerHTML = 'Points:' + player.points;
						}
						else
						{
							player.points += 10;
							points.innerHTML = 'Points:' + player.points;
							zombiehit(g);
						}
					}
				}
			}
			if (typeof shots[i] != 'undefined')
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
			for (var l = obstacles.length - 1; l >= 0; l--)
			{
				if (typeof shots[i] != 'undefined')
				{
					if (Math.abs(shots[i].x - obstacles[l].x) < obstacles[l].width / 2 + shots[i].width / 2 && Math.abs(shots[i].y - obstacles[l].y) <= obstacles[l].height / 2 + shots[i].height / 2)
					{
						shots.splice(i, 1);
					}
					else if (shots[i].y > Map.height || shots[i].y < 0)
					{
						shots.splice(i, 1);
					}
				}
			}
		}
		if (gun.cooldown >= 0)
		{
			gun.cooldown -= step;
		}
		if(gun.clip <= 0)
		{
			gun.reload -= step;
		}
		if (gun.reload <= 0)
		{
			if(gun.ammo > 0)
			{
				gun.ammo -= gun.clipsize - gun.clip;
				gun.clip = Math.min(gun.clipsize, gun.ammo);
				gun.reload = gun.reloadtime;
			}
		}
	};
	var bulletspawn = function (x, y, ex, ey, xv, yv, gun)
	{
		if(gun.clip > 0)
		{
			if (gun.cooldown <= 0)
			{
				for(var i = gun.shots -1; i >= 0; i--)
				{
					setTimeout(bulletcreate(x, y, ex, ey, xv, yv, gun), i * 30);
					gun.cooldown = gun.cooltime;
					gun.clip -= 1;
				}
			}
		}
	};

	var bulletcreate = function(x, y, ex, ey, xv, yv, gun)
	{
		shots.push(new Game.Bullet(x, y, ex, ey, xv, yv, gun));
	};
	var update = function (step)
	{
		player.update(step, room.width, room.height, obstacles);
		for (var i = zombies.length - 1; i >= 0; i--)
		{
			zombies[i].update(step, player, obstacles, zombies, i);
		}
		if (firing)
		{
			bulletspawn(player.x, player.y, mousex - canvas.offsetLeft, mousey - canvas.offsetTop, camera.xView, camera.yView, guns[player.gun]);
		}
		bulletupdate(step, guns[player.gun]);
		camera.update();
	};
	// Game draw function
	var draw = function ()
	{
		// clear the entire canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		// redraw all objects
		room.map.draw(context, camera.xView, camera.yView);
		for (var i = zombies.length - 1; i >= 0; i--)
		{
			zombies[i].draw(context, camera.xView, camera.yView);
		}
		for (var j = shots.length - 1; j >= 0; j--)
		{
			shots[j].draw(context, camera.xView, camera.yView);
		}
		//draw obstacles
		for (var t = obstacles.length - 1; t >= 0; t--)
		{
			obstacles[t].draw(context, camera.xView, camera.yView);
		}
		//hurt flash
		if (player.hurtopacity > 0)
		{
			context.save();
			context.fillStyle = '#8A0707';
			context.globalAlpha = player.hurtopacity;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.restore();
		}
		//Round flash
		if (player.roundopacity > 0)
		{
			context.save();
			context.fillStyle = '#197319';
			context.globalAlpha = player.roundopacity;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.restore();
		}
		player.draw(context, camera.xView, camera.yView);
		context.font = "20px Special Elite";
		if(guns[player.gun].clip <=0)
		{
			context.fillStyle = "#808080";
		}
		else
		{
			context.fillStyle = "#2e2528";
		}
		context.fillText(guns[player.gun].name + " " + guns[player.gun].clip + "/" + guns[player.gun].ammo, 30, canvas.height-20);
	};
	var runningId = -1;
	// Game Loop
	var gameLoop = function (timestamp)
	{
		// <-- edited; timestamp comes from requestAnimationFrame. See polyfill to get this insight.
		now = timestamp;
		// <-- current timestamp (in milliseconds)
		step = (now - last) / 1000;
		// <-- time between frames (in seconds)
		last = now;
		if (step > 0.2)
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
	var pauseLoop = function (timestamp)
	{
		now = timestamp;
		step = (now - last) / 1000;
		last = now;
		if (step > 0.2)
		{
			change(0.0001);
		}
		else
		{
			change(step);
		}
		menu();
		runningId = requestAnimationFrame(gameLoop);
	};
	Game.play = function ()
	{
		if (runningId == -1)
		{
			spawner = setInterval(zombiespawn, spawntimer);
			runningId = requestAnimationFrame(gameLoop);
			// <-- changed
			console.log('play');
		}
	};
	Game.togglePause = function ()
	{
		if (runningId == -1)
		{
			Game.play();
		}
		else
		{
			cancelAnimationFrame(runningId);
			// <-- changed
			runningId = -1;
			clearInterval(spawner);
			console.log('paused');
		}
	};
}());
//controls
Game.controls =
{
	left: false,
	up: false,
	right: false,
	down: false,
	reload: false,
	action: false,
	one: false,
	two: false,
	three: false,
	four: false,
	five: false
};
window.addEventListener('keydown', function (e)
{
	switch (e.keyCode)
	{
	case 65:
		// left arrow
		Game.controls.left = true;
		break;
	case 87:
		// up arrow
		Game.controls.up = true;
		break;
	case 68:
		// right arrow
		Game.controls.right = true;
		break;
	case 83:
		// down arrow
		Game.controls.down = true;
		break;
	case 69:
		//e key action
		Game.controls.action = true;
		break;
	case 81:
		//q key reload
		Game.controls.reload = true;
		break;
	case 49:
		// one
		Game.controls.one = true;
		break;
	case 50:
		// two
		Game.controls.two = true;
		break;
	case 51:
		// three
		Game.controls.three = true;
		break;
	case 52:
		// four
		Game.controls.four = true;
		break;
	case 53:
		// five
		Game.controls.five = true;
		break;
	}
}, false);
window.addEventListener('keyup', function (e)
{
	switch (e.keyCode)
	{
	case 65:
		// left arrow
		Game.controls.left = false;
		break;
	case 87:
		// up arrow
		Game.controls.up = false;
		break;
	case 68:
		// right arrow
		Game.controls.right = false;
		break;
	case 83:
		// down arrow
		Game.controls.down = false;
		break;
	case 80:
		// key P pauses the game
		Game.togglePause();
		break;
	case 69:
		//e key action
		Game.controls.action = false;
		break;
	case 81:
		//q key reload
		Game.controls.reload = false;
		break;
	case 49:
		// one
		Game.controls.one = false;
		break;
	case 50:
		// two
		Game.controls.two = false;
		break;
	case 51:
		// three
		Game.controls.three = false;
		break;
	case 52:
		// four
		Game.controls.four = false;
		break;
	case 53:
		// five
		Game.controls.five = false;
		break;
	}

}, false);
//kick it all off on window load
window.onload = function ()
{
	var loading = document.getElementById('loading');
	loading.parentNode.removeChild(loading);
	var round = document.getElementById('round');
	var heart1 = document.getElementById('heart1');
	var heart2 = document.getElementById('heart2');
	var heart3 = document.getElementById('heart3');
	var kills = document.getElementById('kills');
	var points = document.getElementById('points');
	var spawner;
	Game.play();
};
