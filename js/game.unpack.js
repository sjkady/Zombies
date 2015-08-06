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
		this.tilt = false;
		// move speed in pixels per second
		this.speed = 400;
		// render properties
		this.width = 40;
		this.height = 40;
	}
	Player.prototype.update = function (step, worldWidth, worldHeight, obstacles)
	{
		// parameter step is the time between frames ( in seconds )
		// check controls and move the player accordingly
		if (Game.controls.one)
		{
			this.gun = 0;
		}
		if (Game.controls.two)
		{
			this.gun = 1;
		}
		if (Game.controls.three)
		{
			this.gun = 2;
		}
		if (Game.controls.four)
		{
			this.gun = 3;
		}
		if (Game.controls.five)
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
		if (this.health >= 0)
		{
			if(this.hurtopacity >= 0)
			{
				this.hurtopacity -= step;
			}
			if(this.roundopacity >= 0)
			{
				this.roundopacity -= step;
			}
		}
	};
	Player.prototype.draw = function (context, xView, yView)
	{
		// draw a simple rectangle shape as our player model
		context.save();
		context.fillStyle = '#C67856';
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
		this.attackable = 0;
		this.hit = 0;
		this.movex = true;
		this.movey = true;
		this.cooldown = Math.floor(Math.random() * 3000 + 1000);
		// move speed in pixels per second
		this.speed = Math.floor(Math.random() * 350 + 50);
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
			if (this.attackable === 0)
			{
				this.attackable = 1;
				player.health = player.health - 1;
				player.hurtopacity = 0.9;
			}
		}
		if(this.hit > 0)
		{
			this.hit -= step/2;
		}
		if(this.attackable > 0)
		{
			this.attackable -= step/10;
		}
	};
	Zombie.prototype.draw = function (context, xView, yView)
	{
		// draw a box as our zombie model
		context.save();
		context.fillStyle = '#5E932D';
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		if (this.hit > 0)
		{
			context.fillStyle = '#8A0707';
			context.globalAlpha = this.hit;
			context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		}
		else if (this.attackable > 0)
		{
			context.fillStyle = '#A2AD59';
			context.globalAlpha = this.attackable;
			context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		}
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
		context.fillStyle = '#c5b358';
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
		context.fillStyle = '#342e24';
		context.fillRect(this.x - this.width / 2 - xView, this.y - this.height / 2 - yView, this.width, this.height);
		context.fillStyle = '#3d352a';
		context.fillRect(this.x - this.width / 2 - xView + this.width*0.1, this.y - this.height / 2 - yView + this.height*0.1, this.width*0.8, this.height*0.8);
		context.fillStyle = '#463d30';
		context.fillRect(this.x - this.width / 2 - xView + this.width*0.2, this.y - this.height / 2 - yView + this.height*0.2, this.width*0.6, this.height*0.6);
		context.fillStyle = '#4f4536';
		context.fillRect(this.x - this.width / 2 - xView + this.width*0.3, this.y - this.height / 2 - yView + this.height*0.3, this.width*0.4, this.height*0.4);
		context.fillStyle = '#584d3d';
		context.fillRect(this.x - this.width / 2 - xView + this.width*0.4, this.y - this.height / 2 - yView + this.height*0.4, this.width*0.2, this.height*0.2);
		context.restore();
	};
	Game.Obstacle = Obstacle;
}());
//blood
(function ()
{
	function Splatter()
	{
		this.arr = [];
	}
	Splatter.prototype.create = function(x,y,dx,dy,scatter,consistancy)
	{
		for (var i = 0; i < 30; i++)
		{
			var s = Math.random() * Math.PI;
			var dirx = (((Math.random() < 0.5) ? 3 : -3) * (Math.random() * 3)) * scatter;
			var diry = (((Math.random() < 0.5) ? 3 : -3) * (Math.random() * 3)) * scatter;

			this.arr.push
			(
				{
						x: x,
						y: y,
						dx: dirx + dx,
						dy: diry + dy,
						size: s
				}
			);
		}
	};
	Splatter.prototype.draw = function (context, xView, yView)
	{
		context.save();
		var redtone = 'rgb(' + (130 + (Math.random() * 105 | 0)) + ',0,0)';
		context.fillStyle = redtone;
		for(var i = this.arr.length -1; i>=0; i--)
		{
				var t = this.arr[i];
				var x = t.x,
						y = t.y,
						s = t.size;
				context.fillRect(x - this.arr[i].size / 2 - xView, y - this.arr[i].size / 2 - yView, this.arr[i].size, this.arr[i].size);
				t.x -= t.dx;
				t.y -= t.dy;
				t.size -= 0.05;
				if (this.arr[i].size < 0.3)
				{
						context.fillRect(x - this.arr[i].size / 2 - xView, y - this.arr[i].size / 2 - yView, this.arr[i].size, this.arr[i].size);
						this.arr.splice(i, 1);
				}
		}
		context.restore();
	};
	Game.Splatter = Splatter;
}());
// Gun
(function ()
{
	function Gun(name, damage, ammo, clip, splash, piercing, cooldown, reload, speed, width, height, owned)
	{
		this.name = name;
		this.damage = damage;
		this.ammo = ammo;
		this.clip = clip;
		this.clipsize = clip;
		this.splash = splash;
		this.piercing = piercing;
		this.cooltime = cooldown;
		this.cooldown = cooldown;
		this.reload = reload;
		this.reloadtime = reload;
		this.speed = speed;
		this.width = width;
		this.height = height;
		this.owned = owned;
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
		var greentone = 'rgb('+ (100 + (Math.random() * 45 | 0)) + ',' + (170 + (Math.random() * 75 | 0)) + ','+ (80 + (Math.random() * 45 | 0)) + ')';
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;
		var rows = Math.floor(this.width / 5) + 1;
		var columns = Math.floor(this.height / 5) + 1;
		ctx.save();
		for (var x = 0, i = 0; i < rows; x += 10, i++)
		{
			for (var y = 0, j = 0; j < columns; y += 10, j++)
			{
				ctx.beginPath();
				ctx.globalAlpha = 0.7;
				ctx.rect(x, y, 15, 15);
				greentone = 'rgb('+ (10 + (Math.random() * 55 | 0)) + ',' + (30 + (Math.random() * 75 | 0)) + ','+ (10 + (Math.random() * 25 | 0)) + ')';
				ctx.fillStyle = greentone;
				ctx.fill();
				ctx.closePath();
			}
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
//Mouse controls
(function ()
{
	function Mouse(x, y, firing)
	{
		this.x = x;
		this.y = y;
		this.firing = firing;
	}
	Game.Mouse = Mouse;
}());
//Menu
(function ()
{
	function Menu(x, y, inaction, spacingx, spacingy)
	{
		this.x = x;
		this.y = y;
		this.ox = x;
		this.oy = y;
		this.inaction = inaction;
		this.menuitems =  ['Shop', 'Status', 'Restart'];
		this.spacingx = spacingx;
		this.spacingy = spacingy;
	}
	Game.Menu = Menu;
}());
// Game Script
(function ()
{
	//set up canvas
	var canvas = document.getElementById('gameCanvas');
	var context = canvas.getContext('2d');
	context.canvas.width = window.innerWidth * 0.98;
	context.canvas.height = window.innerHeight * 0.98;
	//set up mouse
	var mouse = new Game.Mouse(0,0, false);
	canvas.addEventListener('mousedown', function (e)
	{
		mouse.firing = true;
		if (e.clientX !== undefined && e.clientY !== undefined)
		{
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		}
	}, false);
	canvas.addEventListener('mousemove', function (e)
	{
		if (mouse.firing)
		{
			if (e.clientX !== undefined && e.clientY !== undefined)
			{
				mouse.x = e.clientX;
				mouse.y = e.clientY;
			}
		}
	}, false);
	canvas.addEventListener('mouseup', function (e)
	{
		mouse.firing = false;
	}, false);

	//set up frame differential
	var last = 0;
	var now = 0;
	var step = now - last;

	//set up room
	var room = {
		width: 3520,
		height: 1760,
		map: new Game.Map(3520, 1760)
	};
	room.map.generate();

	//set up spawn points array
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

	//set up player
	var player = new Game.Player(room.width / 2, room.height / 2);

	//set up zombie array
	var zombies = [];

	//set up  obstacles array
	var obstacles = [
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50)),
		new Game.Obstacle(Math.floor(Math.random() * room.width), Math.floor(Math.random() * room.height), Math.floor(Math.random() * 400 + 50), Math.floor(Math.random() * 400 + 50))
	];

	//remove obstacles in center
	for (var l = obstacles.length - 1; l >= 0; l--)
	{
		if ((obstacles[l].x + obstacles[l].width / 2 >= player.x - player.width && obstacles[l].x - obstacles[l].width / 2 <= player.x + player.width) && (obstacles[l].y + obstacles[l].height / 2 >= player.y - player.height && obstacles[l].y - obstacles[l].height / 2 <= player.y + player.height))
		{
			obstacles.splice(l, 1);
		}
	}

	//set up gun shots array
	var shots = [];
	//setting splats array
	var splats = [];
	var splatter = new Game.Splatter(splats);

	//set up guns array
	/*name, damage, ammo, clip, shots, splash, piercing, cooldown, reload, speed, width, height, owned*/
	var guns = [			/*name,		damage,	ammo,	clip,	splash,	pierce	cd, 	rd, sp,	 w, h, O*/
		new Game.Gun('Base Pistol',		1,		64,		8,		0,		0, 		1, 		2,	700, 4, 4 , 1),
		new Game.Gun('Semi Pistol',		0.7,	120,	3,		0,		0,	 	0.03,	2,	750, 3, 3, 0),
		new Game.Gun('Machine Gun',	 	1,		300,	30,		0, 		0, 		0.2, 	5,	750, 4, 4, 0),
		new Game.Gun('Pea Shooter', 	0.5,	200,	20,		0,		0,		0.1,	3,	800, 2, 2, 0),
		new Game.Gun('Rifle',			5,		50,		5,		0,		0,		3,		5,	700, 6, 6, 0)
	];
	//give defualt pistol

	//set up camera
	var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
	camera.follow(player, canvas.width / 2, canvas.height / 2);
	//set up menu
	var menu = new Game.Menu(0,0,false,Math.round(context.canvas.width / 10),Math.round(context.canvas.height / 5));

	var spawner = 0;
	var spawntimer = 2500;
	var spawnnum = 10;
	var roundnum = 1;

	var menuupdate = function (step)
	{
		if (menu.inaction)
		{
			/*key control*/
			if (Game.controls.up && menu.y > 0)
			{
				menu.y = menu.y - 1;
				menu.inaction = false;
			}
			if (Game.controls.down && menu.y < menu.menuitems.length - 1)
			{
				menu.y = menu.y + 1;
				menu.inaction = false;
			}
		}
		if (menu.inaction === false) /*If you change this to calculate based on the remainder you should get much more consistent results idiot*/
		{
			if (menu.oy < (menu.y * menu.spacingy) - step * 500)
			{
				menu.oy = menu.oy + step * 500;
			}
			else if (menu.oy > (menu.y * menu.spacingy) + step * 500)
			{
				menu.oy = menu.oy - step * 500;
			}
			else
			{
				menu.inaction = true;
			}
		}
	};
	var menudraw = function ()
	{
		context.save();
		context.fillStyle = '#000000';
		context.globalAlpha = 0.6;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
		context.save();
		context.font = "Bold 70px Codystar";
		context.fillStyle = '#9A0707';
		context.globalAlpha = 1.0;
		context.fillText('Brambles Of Zambles', canvas.width / 4, canvas.height * 0.95);
		context.restore();
		for (var k = menu.menuitems.length - 1; k >= 0; k--)
		{
			context.save();
			context.font = "20px Special Elite";
			context.fillStyle = '#501010';
			context.globalAlpha = 1.0;
			if (k == menu.y)
			{
				context.fillStyle = '#8A0707';
			}
			context.fillText(menu.menuitems[k], menu.spacingx, menu.spacingy * (k + 1) - menu.oy);
			context.restore();
		}
	};
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
				roundup();
			}
		}
	};
	var roundup = function ()
	{
		clearInterval(spawner);
		roundnum += 1;
		player.roundopacity = 0.9;
		if (spawntimer >= 900)
		{
			spawntimer = spawntimer - 200;
		}
		spawnnum = roundnum * 7;
		spawner = setInterval(zombiespawn, spawntimer);
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
						if (zombies[g].health <= 0)
						{
							zombies.splice(g, 1);
							player.kills += 1;
							player.points += 50;
							splatter.create(shots[i].x, shots[i].y, shots[i].dx/100, shots[i].dy/100, 0.3, 0.01);
						}
						else
						{
							player.points += 10;
							zombies[g].hit = 1;
							splatter.create(shots[i].x, shots[i].y, shots[i].dx/100, shots[i].dy/100, 0.05, 0.01);
						}
						shots.splice(i, 1);
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
		if (gun.clip <= 0)
		{
			gun.reload -= step;
		}
		if (gun.reload <= 0)
		{
			if (gun.ammo > 0)
			{
				gun.ammo -= gun.clipsize - gun.clip;
				gun.clip = Math.min(gun.clipsize, gun.ammo);
				gun.reload = gun.reloadtime;
			}
		}
	};

	var bulletspawn = function (x, y, ex, ey, xv, yv, gun)
	{
		if (gun.clip > 0)
		{
			if (gun.cooldown <= 0)
			{
				shots.push(new Game.Bullet(x, y, ex, ey, xv, yv, gun));
				gun.clip -= 1;
				gun.cooldown = gun.cooltime;
			}
		}
	};

	var update = function (step)
	{
		player.update(step, room.width, room.height, obstacles);
		for (var i = zombies.length - 1; i >= 0; i--)
		{
			zombies[i].update(step, player, obstacles, zombies, i);
		}
		if (mouse.firing)
		{
			bulletspawn(player.x, player.y, mouse.x - canvas.offsetLeft, mouse.y - canvas.offsetTop, camera.xView, camera.yView, guns[player.gun]);
		}
		bulletupdate(step, guns[player.gun]);
		camera.update();
	};
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
		splatter.draw(context, camera.xView, camera.yView);
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
		context.save();
		context.fillStyle = '#8A0707';
		context.font = "25px Special Elite";
		if (player.health > 2)
		{
			context.fillText("❤", canvas.width - 330, 60);
		}
		if (player.health > 1)
		{
			context.fillText("❤", canvas.width - 300, 60);
		}
		if (player.health > 0)
		{
			context.fillText("❤", canvas.width - 270, 60);
		}
		context.restore();
		context.save();
		context.fillStyle = '#8A0707';
		context.font = "20px Special Elite";
		if (guns[player.gun].clip <= 0)
		{
			context.fillStyle = "#505050";
		}
		else
		{
			context.fillStyle = "#999999";
		}
		context.fillText(guns[player.gun].name + " " + guns[player.gun].clip + "/" + guns[player.gun].ammo, 30, canvas.height * 0.98);
		context.restore();
		context.save();
		context.font = "20px Special Elite";
		context.fillStyle = "#999999";
		context.fillText("Round: " + roundnum + " Points: " + player.points + " Kills: " + player.kills, canvas.width - 330, 30);
		context.restore();
	};
	var runningId = -1;
	var pauseId = -1;
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
			menuupdate(0.0001);
		}
		else
		{
			menuupdate(step);
		}
		draw();
		menudraw();
		pauseId = requestAnimationFrame(pauseLoop);
	};
	Game.play = function ()
	{
		if (runningId == -1)
		{
			cancelAnimationFrame(pauseId);
			spawner = setInterval(zombiespawn, spawntimer);
			pauseId = -1;
			runningId = requestAnimationFrame(gameLoop);
			console.log('play');
		}
	};

	Game.pause = function ()
	{
		if (pauseId == -1)
		{
			cancelAnimationFrame(runningId);
			clearInterval(spawner);
			runningId = -1;
			pauseId = requestAnimationFrame(pauseLoop);
			console.log('pause');
		}
	};

	Game.togglePause = function ()
	{
		if (runningId == -1 && pauseId != -1)
		{
			Game.play();
		}
		else if (pauseId == -1 && runningId != -1)
		{
			Game.pause();
		}
	};


}());
//controls
Game.controls = {
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
	five: false,
	enter: false
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
	case 13:
		Game.controls.enter = true;
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
	case 13:
		Game.controls.enter = false;
		break;
	}
}, false);
//kick it all off on window load
window.onload = function ()
{
	var loading = document.getElementById('loading');
	loading.parentNode.removeChild(loading);
	Game.play();
};
