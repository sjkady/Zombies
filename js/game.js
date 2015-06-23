(function(){for(var e=0,a,c,f,b=["ms","moz","webkit","o"],q=0;q<b.length&&!window.requestAnimationFrame;++q)window.requestAnimationFrame=window[b[q]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[q]+"CancelAnimationFrame"]||window[b[q]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b,q){a=Date.now();c=Math.max(0,16-(a-e));f=window.setTimeout(function(){b(a+c)},c);e=a+c;return f});window.cancelAnimationFrame||(window.cancelAnimationFrame=
function(a){clearTimeout(a)})})();window.Game={};
(function(){function e(a,c,f,b){this.left=a||0;this.top=c||0;this.width=f||0;this.height=b||0;this.right=this.left+this.width;this.bottom=this.top+this.height}e.prototype.set=function(a,c,f,b){this.left=a;this.top=c;this.width=f||this.width;this.height=b||this.height;this.right=this.left+this.width;this.bottom=this.top+this.height};e.prototype.within=function(a){return a.left<=this.left&&a.right>=this.right&&a.top<=this.top&&a.bottom>=this.bottom};e.prototype.overlaps=function(a){return this.left<
a.right&&a.left<this.right&&this.top<a.bottom&&a.top<this.bottom};Game.Rectangle=e})();
(function(){function e(c,f,b,e,d,h){this.xView=c||0;this.yView=f||0;this.yDeadZone=this.xDeadZone=0;this.wView=b;this.hView=e;this.axis=a.BOTH;this.followed=null;this.viewportRect=new Game.Rectangle(this.xView,this.yView,this.wView,this.hView);this.worldRect=new Game.Rectangle(0,0,d,h)}var a={NONE:"none",HORIZONTAL:"horizontal",VERTICAL:"vertical",BOTH:"both"};e.prototype.follow=function(a,f,b){this.followed=a;this.xDeadZone=f;this.yDeadZone=b};e.prototype.update=function(){if(null!==this.followed){if(this.axis==
a.HORIZONTAL||this.axis==a.BOTH)this.followed.x-this.xView+this.xDeadZone>this.wView?this.xView=this.followed.x-(this.wView-this.xDeadZone):this.followed.x-this.xDeadZone<this.xView&&(this.xView=this.followed.x-this.xDeadZone);if(this.axis==a.VERTICAL||this.axis==a.BOTH)this.followed.y-this.yView+this.yDeadZone>this.hView?this.yView=this.followed.y-(this.hView-this.yDeadZone):this.followed.y-this.yDeadZone<this.yView&&(this.yView=this.followed.y-this.yDeadZone)}this.viewportRect.set(this.xView,this.yView);
this.viewportRect.within(this.worldRect)||(this.viewportRect.left<this.worldRect.left&&(this.xView=this.worldRect.left),this.viewportRect.top<this.worldRect.top&&(this.yView=this.worldRect.top),this.viewportRect.right>this.worldRect.right&&(this.xView=this.worldRect.right-this.wView),this.viewportRect.bottom>this.worldRect.bottom&&(this.yView=this.worldRect.bottom-this.hView))};Game.Camera=e})();
(function(){function e(a,c){this.x=a;this.y=c;this.prex=a;this.prey=c;this.health=3;this.roundopacity=this.hurtopacity=this.points=this.kills=0;this.move=!0;this.gun=0;this.speed=300;this.height=this.width=40}e.prototype.update=function(a,c,f,b){Game.controls.one&&(this.gun=0);Game.controls.two&&(this.gun=1);Game.controls.three&&(this.gun=2);Game.controls.four&&(this.gun=3);Game.controls.five&&(this.gun=4);0<=this.health&&!0===this.move&&(Game.controls.left&&(this.prex=Game.controls.up||Game.controls.down?
this.prex-this.speed/Math.sqrt(2)*a:this.prex-this.speed*a),Game.controls.right&&(this.prex=Game.controls.up||Game.controls.down?this.prex+this.speed/Math.sqrt(2)*a:this.prex+this.speed*a),Game.controls.up&&(this.prey=Game.controls.right||Game.controls.left?this.prey-this.speed/Math.sqrt(2)*a:this.prey-this.speed*a),Game.controls.down&&(this.prey=Game.controls.right||Game.controls.left?this.prey+this.speed/Math.sqrt(2)*a:this.prey+this.speed*a));0>this.prex-this.width/2&&(this.prex=this.width/2);
0>this.prey-this.height/2&&(this.prey=this.height/2);this.prex+this.width/2>c&&(this.prex=c-this.width/2);this.prey+this.height/2>f&&(this.prey=f-this.height/2);for(a=b.length-1;0<=a;a--)Math.abs(this.prex-b[a].x)<=b[a].width/2+this.width/2&&Math.abs(this.prey-b[a].y)<=b[a].height/2+this.height/2&&(this.move=!1);!0===this.move?(this.x=this.prex,this.y=this.prey):(this.prex=this.x,this.prey=this.y,this.move=!0)};e.prototype.draw=function(a,c,f){a.save();a.fillStyle="#E5C298";a.fillRect(this.x-this.width/
2-c,this.y-this.height/2-f,this.width,this.height);a.restore()};Game.Player=e})();
(function(){function e(a,c,f){this.x=a;this.y=c;this.prex=a;this.prey=c;this.mag=this.dy=this.dx=0;this.health=f;this.attackable=!0;this.hit=!1;this.movey=this.movex=!0;this.cooldown=Math.floor(3E3*Math.random()+1E3);this.speed=Math.floor(200*Math.random()+50);this.height=this.width=30}e.prototype.update=function(a,c,f,b,e){this.dx=c.x-this.x;this.dy=c.y-this.y;this.mag=Math.sqrt(this.dx*this.dx+this.dy*this.dy);this.prex+=this.dx/this.mag*this.speed*a;for(var d=b.length-1;0<=d;d--)d!=e&&Math.abs(this.prex-
b[d].x)<this.width/2+b[d].width/2&&Math.abs(this.prey-b[d].y)<this.height/2+b[d].height/2&&(this.movex=!1,this.prex-=this.dx/this.mag*this.speed*a);for(d=f.length-1;0<=d;d--)Math.abs(this.prex-f[d].x)<=f[d].width/2+this.width/2&&Math.abs(this.prey-f[d].y)<=f[d].height/2+this.height/2&&(this.movex=!1,this.prex-=this.dx/this.mag*this.speed*a);this.prey+=this.dy/this.mag*this.speed*a;for(d=b.length-1;0<=d;d--)d!=e&&Math.abs(this.prex-b[d].x)<this.width/2+b[d].width/2&&Math.abs(this.prey-b[d].y)<this.height/
2+b[d].height/2&&(this.movex=!1,this.prey-=this.dy/this.mag*this.speed*a);for(b=f.length-1;0<=b;b--)Math.abs(this.prex-f[b].x)<=f[b].width/2+this.width/2&&Math.abs(this.prey-f[b].y)<=f[b].height/2+this.height/2&&(this.movey=!1,this.prey-=this.dy/this.mag*this.speed*a);!0===this.movex?this.x=this.prex:(this.prex=this.x,this.movex=!0);!0===this.movey?this.y=this.prey:(this.prey=this.y,this.movey=!0);Math.abs(this.x-c.x)<this.width/2+c.width/2&&Math.abs(this.y-c.y)<this.height/2+c.height/2&&!0===this.attackable&&
(this.attackable=!1,setTimeout(function(a){console.log("attack over");a.attackable=!0},this.cooldown,this),--c.health,2===c.health?heart1.style.display="None":1===c.health?heart2.style.display="None":0===c.health&&(heart3.style.display="None"),c.hurtopacity=.9,0<=c.health&&(setTimeout(function(){c.hurtopacity-=.1},100),setTimeout(function(){c.hurtopacity-=.2},200),setTimeout(function(){c.hurtopacity-=.2},300),setTimeout(function(){c.hurtopacity-=.2},400),setTimeout(function(){c.hurtopacity-=.2},500)))};
e.prototype.draw=function(a,c,f){a.save();a.fillStyle=!0===this.hit?"#8A0707":!0===this.attackable?"#A2AD59":"#8E936D";a.fillRect(this.x-this.width/2-c,this.y-this.height/2-f,this.width,this.height);a.restore()};Game.Zombie=e})();
(function(){function e(a,c,f,b,e,d,h){this.x=a;this.y=c;this.dx=f-(a-e);this.dy=b-(c-d);this.mag=Math.sqrt(this.dx*this.dx+this.dy*this.dy);this.speed=h.speed;this.width=h.width;this.height=h.height;this.damage=h.damage;this.splash=h.splash;this.piercing=h.piercing;this.shots=h.shots}e.prototype.update=function(a){this.x+=this.dx/this.mag*this.speed*a;this.y+=this.dy/this.mag*this.speed*a};e.prototype.draw=function(a,c,f){a.save();a.fillStyle="#000000";a.fillRect(this.x-this.width/2-c,this.y-this.height/
2-f,this.width,this.height);a.restore()};Game.Bullet=e})();(function(){function e(a,c,f,b){this.x=a;this.y=c;this.width=f;this.height=b}e.prototype.draw=function(a,c,f){a.save();a.fillStyle="#584D3D";a.fillRect(this.x-this.width/2-c,this.y-this.height/2-f,this.width,this.height);a.restore()};Game.Obstacle=e})();
(function(){Game.Gun=function(e,a,c,f,b,q,d,h,t,w,g,l){this.name=e;this.damage=a;this.ammo=c;this.clipsize=this.clip=f;this.shots=b;this.splash=q;this.piercing=d;this.cooldown=this.cooltime=h;this.reloadtime=this.reload=t;this.speed=w;this.width=g;this.height=l}})();(function(){Game.Spawnpoint=function(e,a){this.x=e;this.y=a}})();(function(){Game.GunBuy=function(e,a){this.x=e;this.y=a;this.height=this.width=100}})();
(function(){function e(a,c){this.width=a;this.height=c;this.image=null}e.prototype.generate=function(){var a=document.createElement("canvas").getContext("2d");a.canvas.width=this.width;a.canvas.height=this.height;var c=Math.floor(this.width/44)+1,f=Math.floor(this.height/44)+1,b="#CEDFD9";a.save();a.fillStyle="#CEDFD9";for(var e=0,d=0;d<c;e+=44,d++){a.beginPath();for(var h=0,t=0;t<f;h+=44,t++)a.rect(e,h,40,40);b="#CEDFD9"==b?"#EBFCFB":"#CEDFD9";a.fillStyle=b;a.fill();a.closePath()}a.restore();this.image=
new Image;this.image.src=a.canvas.toDataURL("image/png")};e.prototype.draw=function(a,c,f){var b,e;b=a.canvas.width;e=a.canvas.height;this.image.width-c<b&&(b=this.image.width-c);this.image.height-f<e&&(e=this.image.height-f);a.drawImage(this.image,c,f,b,e,0,0,b,e)};Game.Map=e})();
(function(){var e,a,c,f=document.getElementById("gameCanvas");f.addEventListener("mousedown",function(b){e=!0;void 0!==b.clientX&&void 0!==b.clientY&&(a=b.clientX,c=b.clientY)},!1);f.addEventListener("mousemove",function(b){e&&void 0!==b.clientX&&void 0!==b.clientY&&(a=b.clientX,c=b.clientY)},!1);f.addEventListener("mouseup",function(a){e=!1},!1);var b=f.getContext("2d");b.canvas.width=1080<.8*window.innerWidth?1080:.8*window.innerWidth;b.canvas.height=824<.8*window.innerHeight?824:.7*window.innerHeight;
var q=0,d=0,h=d-q,t=new Game.Map(1760,880);t.generate();for(var w=[new Game.Spawnpoint(-100,-100),new Game.Spawnpoint(880,-100),new Game.Spawnpoint(1860,-100),new Game.Spawnpoint(-100,440),new Game.Spawnpoint(-100,980),new Game.Spawnpoint(880,980),new Game.Spawnpoint(1860,980),new Game.Spawnpoint(1860,440)],g=new Game.Player(880,440),l=[],n=[new Game.Obstacle(Math.floor(1760*Math.random()),Math.floor(880*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(1760*
Math.random()),Math.floor(880*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(1760*Math.random()),Math.floor(880*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(1760*Math.random()),Math.floor(880*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50))],r=n.length-1;0<=r;r--)n[r].x+n[r].width/2>=g.x-g.width&&n[r].x-n[r].width/2<=g.x+g.width&&n[r].y+
n[r].height/2>=g.y-g.height&&n[r].y-n[r].height/2<=g.y+g.height&&n.splice(r,1);var k=[],v=[new Game.Gun("Base Pistol",1,64,8,1,0,0,1,2,700,4,4),new Game.Gun("Semi Pistol",1,120,15,3,0,0,1,2,700,4,4),new Game.Gun("Machine Gun",1,300,30,1,0,0,.2,5,700,4,4),new Game.Gun("Pea Shooter",.5,200,20,1,0,0,.1,3,700,2,2),new Game.Gun("Rifle",5,50,5,1,0,0,3,5,700,6,6)],p=new Game.Camera(0,0,f.width,f.height,1760,880),x=2500,y=10,z=1;p.follow(g,f.width/2,f.height/2);var A=function(){if(-1!=u){var a=Math.floor(Math.random()*
w.length);0<y&&l.length<=y&&(l.push(new Game.Zombie(w[a].x,w[a].y,z)),--y);0>=y&&(clearInterval(spawner),z+=1,round.style.color="#808080",900<=x&&(x-=200),round.innerHTML="Round:"+z,setTimeout(function(){g.roundopacity=.9;0<=g.health&&(setTimeout(function(){g.roundopacity-=.1},100),setTimeout(function(){g.roundopacity-=.2},200),setTimeout(function(){g.roundopacity-=.2},300),setTimeout(function(){g.roundopacity-=.2},400),setTimeout(function(){g.roundopacity-=.2},500));y=7*z;round.style.color="#282e25";
spawner=setInterval(A,x)},4E3))}},D=function(a){l[a].hit=!0;setTimeout(function(){"undefined"!=typeof l[a]&&(l[a].hit=!1)},100)},E=function(a,b,c,e,f,g,d){if(0<d.clip&&0>=d.cooldown)for(var l=d.shots-1;0<=l;l--)setTimeout(function(l){k.push(new Game.Bullet(a,b,c,e,f,g,d))},30*l,d),d.cooldown=d.cooltime,--d.clip},B=function(b){g.update(b,1760,880,n);for(var d=l.length-1;0<=d;d--)l[d].update(b,g,n,l,d);e&&E(g.x,g.y,a-f.offsetLeft,c-f.offsetTop,p.xView,p.yView,v[g.gun]);for(var d=v[g.gun],m=k.length-
1;0<=m;m--){k[m].update(b);for(var h=l.length-1;0<=h;h--)"undefined"!=typeof k[m]&&Math.abs(l[h].x-k[m].x)<l[h].width/2+k[m].width/2&&Math.abs(l[h].y-k[m].y)<l[h].height/2+k[m].height/2&&(l[h].health-=d.damage,k.splice(m,1),0>=l[h].health?(l.splice(h,1),g.kills+=1,g.points+=50,kills.innerHTML="Kills:"+g.kills,points.innerHTML="Points:"+g.points):(g.points+=10,points.innerHTML="Points:"+g.points,D(h)));"undefined"!=typeof k[m]&&(k[m].x>Map.width||0>k[m].x?k.splice(m,1):(k[m].y>Map.height||0>k[m].y)&&
k.splice(m,1));for(h=n.length-1;0<=h;h--)"undefined"!=typeof k[m]&&(Math.abs(k[m].x-n[h].x)<n[h].width/2+k[m].width/2&&Math.abs(k[m].y-n[h].y)<=n[h].height/2+k[m].height/2?k.splice(m,1):(k[m].y>Map.height||0>k[m].y)&&k.splice(m,1))}0<=d.cooldown&&(d.cooldown-=b);0>=d.clip&&(d.reload-=b);0>=d.reload&&0<d.ammo&&(d.ammo-=d.clipsize-d.clip,d.clip=Math.min(d.clipsize,d.ammo),d.reload=d.reloadtime);p.update()},u=-1,C=function(a){d=a;h=(d-q)/1E3;q=d;.2<h?B(1E-4):B(h);b.clearRect(0,0,f.width,f.height);t.draw(b,
p.xView,p.yView);for(a=l.length-1;0<=a;a--)l[a].draw(b,p.xView,p.yView);for(a=k.length-1;0<=a;a--)k[a].draw(b,p.xView,p.yView);for(a=n.length-1;0<=a;a--)n[a].draw(b,p.xView,p.yView);0<g.hurtopacity&&(b.save(),b.fillStyle="#8A0707",b.globalAlpha=g.hurtopacity,b.fillRect(0,0,f.width,f.height),b.restore());0<g.roundopacity&&(b.save(),b.fillStyle="#197319",b.globalAlpha=g.roundopacity,b.fillRect(0,0,f.width,f.height),b.restore());g.draw(b,p.xView,p.yView);b.font="20px Special Elite";b.fillStyle=0>=v[g.gun].clip?
"#808080":"#2e2528";b.fillText(v[g.gun].name+" "+v[g.gun].clip+"/"+v[g.gun].ammo,30,f.height-20);u=requestAnimationFrame(C)};Game.play=function(){-1==u&&(spawner=setInterval(A,x),u=requestAnimationFrame(C),console.log("play"))};Game.togglePause=function(){-1==u?Game.play():(cancelAnimationFrame(u),u=-1,clearInterval(spawner),console.log("paused"))}})();Game.controls={left:!1,up:!1,right:!1,down:!1,reload:!1,action:!1,one:!1,two:!1,three:!1,four:!1,five:!1};
window.addEventListener("keydown",function(e){switch(e.keyCode){case 65:Game.controls.left=!0;break;case 87:Game.controls.up=!0;break;case 68:Game.controls.right=!0;break;case 83:Game.controls.down=!0;break;case 69:Game.controls.action=!0;break;case 81:Game.controls.reload=!0;break;case 49:Game.controls.one=!0;break;case 50:Game.controls.two=!0;break;case 51:Game.controls.three=!0;break;case 52:Game.controls.four=!0;break;case 53:Game.controls.five=!0}},!1);
window.addEventListener("keyup",function(e){switch(e.keyCode){case 65:Game.controls.left=!1;break;case 87:Game.controls.up=!1;break;case 68:Game.controls.right=!1;break;case 83:Game.controls.down=!1;break;case 80:Game.togglePause();break;case 69:Game.controls.action=!1;break;case 81:Game.controls.reload=!1;break;case 49:Game.controls.one=!1;break;case 50:Game.controls.two=!1;break;case 51:Game.controls.three=!1;break;case 52:Game.controls.four=!1;break;case 53:Game.controls.five=!1}},!1);
window.onload=function(){var e=document.getElementById("loading");e.parentNode.removeChild(e);document.getElementById("round");document.getElementById("heart1");document.getElementById("heart2");document.getElementById("heart3");document.getElementById("kills");document.getElementById("points");Game.play()};
