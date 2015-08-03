(function(){for(var e=0,b,d,c,a=["ms","moz","webkit","o"],p=0;p<a.length&&!window.requestAnimationFrame;++p)window.requestAnimationFrame=window[a[p]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[a[p]+"CancelAnimationFrame"]||window[a[p]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(a,p){b=Date.now();d=Math.max(0,16-(b-e));c=window.setTimeout(function(){a(b+d)},d);e=b+d;return c});window.cancelAnimationFrame||(window.cancelAnimationFrame=
function(a){clearTimeout(a)})})();window.Game={};
(function(){function e(b,d,c,a){this.left=b||0;this.top=d||0;this.width=c||0;this.height=a||0;this.right=this.left+this.width;this.bottom=this.top+this.height}e.prototype.set=function(b,d,c,a){this.left=b;this.top=d;this.width=c||this.width;this.height=a||this.height;this.right=this.left+this.width;this.bottom=this.top+this.height};e.prototype.within=function(b){return b.left<=this.left&&b.right>=this.right&&b.top<=this.top&&b.bottom>=this.bottom};e.prototype.overlaps=function(b){return this.left<
b.right&&b.left<this.right&&this.top<b.bottom&&b.top<this.bottom};Game.Rectangle=e})();
(function(){function e(d,c,a,e,f,h){this.xView=d||0;this.yView=c||0;this.yDeadZone=this.xDeadZone=0;this.wView=a;this.hView=e;this.axis=b.BOTH;this.followed=null;this.viewportRect=new Game.Rectangle(this.xView,this.yView,this.wView,this.hView);this.worldRect=new Game.Rectangle(0,0,f,h)}var b={NONE:"none",HORIZONTAL:"horizontal",VERTICAL:"vertical",BOTH:"both"};e.prototype.follow=function(b,c,a){this.followed=b;this.xDeadZone=c;this.yDeadZone=a};e.prototype.update=function(){if(null!==this.followed){if(this.axis==
b.HORIZONTAL||this.axis==b.BOTH)this.followed.x-this.xView+this.xDeadZone>this.wView?this.xView=this.followed.x-(this.wView-this.xDeadZone):this.followed.x-this.xDeadZone<this.xView&&(this.xView=this.followed.x-this.xDeadZone);if(this.axis==b.VERTICAL||this.axis==b.BOTH)this.followed.y-this.yView+this.yDeadZone>this.hView?this.yView=this.followed.y-(this.hView-this.yDeadZone):this.followed.y-this.yDeadZone<this.yView&&(this.yView=this.followed.y-this.yDeadZone)}this.viewportRect.set(this.xView,this.yView);
this.viewportRect.within(this.worldRect)||(this.viewportRect.left<this.worldRect.left&&(this.xView=this.worldRect.left),this.viewportRect.top<this.worldRect.top&&(this.yView=this.worldRect.top),this.viewportRect.right>this.worldRect.right&&(this.xView=this.worldRect.right-this.wView),this.viewportRect.bottom>this.worldRect.bottom&&(this.yView=this.worldRect.bottom-this.hView))};Game.Camera=e})();
(function(){function e(b,d){this.x=b;this.y=d;this.prex=b;this.prey=d;this.health=3;this.roundopacity=this.hurtopacity=this.points=this.kills=0;this.move=!0;this.gun=0;this.speed=300;this.height=this.width=40}e.prototype.update=function(b,d,c,a){Game.controls.one&&(this.gun=0);Game.controls.two&&(this.gun=1);Game.controls.three&&(this.gun=2);Game.controls.four&&(this.gun=3);Game.controls.five&&(this.gun=4);0<=this.health&&!0===this.move&&(Game.controls.left&&(this.prex=Game.controls.up||Game.controls.down?
this.prex-this.speed/Math.sqrt(2)*b:this.prex-this.speed*b),Game.controls.right&&(this.prex=Game.controls.up||Game.controls.down?this.prex+this.speed/Math.sqrt(2)*b:this.prex+this.speed*b),Game.controls.up&&(this.prey=Game.controls.right||Game.controls.left?this.prey-this.speed/Math.sqrt(2)*b:this.prey-this.speed*b),Game.controls.down&&(this.prey=Game.controls.right||Game.controls.left?this.prey+this.speed/Math.sqrt(2)*b:this.prey+this.speed*b));0>this.prex-this.width/2&&(this.prex=this.width/2);
0>this.prey-this.height/2&&(this.prey=this.height/2);this.prex+this.width/2>d&&(this.prex=d-this.width/2);this.prey+this.height/2>c&&(this.prey=c-this.height/2);for(b=a.length-1;0<=b;b--)Math.abs(this.prex-a[b].x)<=a[b].width/2+this.width/2&&Math.abs(this.prey-a[b].y)<=a[b].height/2+this.height/2&&(this.move=!1);!0===this.move?(this.x=this.prex,this.y=this.prey):(this.prex=this.x,this.prey=this.y,this.move=!0)};e.prototype.draw=function(b,d,c){b.save();b.fillStyle="#E5C298";b.fillRect(this.x-this.width/
2-d,this.y-this.height/2-c,this.width,this.height);b.restore()};Game.Player=e})();
(function(){function e(b,d,c){this.x=b;this.y=d;this.prex=b;this.prey=d;this.mag=this.dy=this.dx=0;this.health=c;this.attackable=!0;this.hit=!1;this.movey=this.movex=!0;this.cooldown=Math.floor(3E3*Math.random()+1E3);this.speed=Math.floor(200*Math.random()+50);this.height=this.width=30}e.prototype.update=function(b,d,c,a,e){this.dx=d.x-this.x;this.dy=d.y-this.y;this.mag=Math.sqrt(this.dx*this.dx+this.dy*this.dy);this.prex+=this.dx/this.mag*this.speed*b;for(var f=a.length-1;0<=f;f--)f!=e&&Math.abs(this.prex-
a[f].x)<this.width/2+a[f].width/2&&Math.abs(this.prey-a[f].y)<this.height/2+a[f].height/2&&(this.movex=!1,this.prex-=this.dx/this.mag*this.speed*b);for(f=c.length-1;0<=f;f--)Math.abs(this.prex-c[f].x)<=c[f].width/2+this.width/2&&Math.abs(this.prey-c[f].y)<=c[f].height/2+this.height/2&&(this.movex=!1,this.prex-=this.dx/this.mag*this.speed*b);this.prey+=this.dy/this.mag*this.speed*b;for(f=a.length-1;0<=f;f--)f!=e&&Math.abs(this.prex-a[f].x)<this.width/2+a[f].width/2&&Math.abs(this.prey-a[f].y)<this.height/
2+a[f].height/2&&(this.movex=!1,this.prey-=this.dy/this.mag*this.speed*b);for(a=c.length-1;0<=a;a--)Math.abs(this.prex-c[a].x)<=c[a].width/2+this.width/2&&Math.abs(this.prey-c[a].y)<=c[a].height/2+this.height/2&&(this.movey=!1,this.prey-=this.dy/this.mag*this.speed*b);!0===this.movex?this.x=this.prex:(this.prex=this.x,this.movex=!0);!0===this.movey?this.y=this.prey:(this.prey=this.y,this.movey=!0);Math.abs(this.x-d.x)<this.width/2+d.width/2&&Math.abs(this.y-d.y)<this.height/2+d.height/2&&!0===this.attackable&&
(this.attackable=!1,setTimeout(function(a){console.log("attack over");a.attackable=!0},this.cooldown,this),--d.health,d.hurtopacity=.9,0<=d.health&&(setTimeout(function(){d.hurtopacity-=.1},100),setTimeout(function(){d.hurtopacity-=.2},200),setTimeout(function(){d.hurtopacity-=.2},300),setTimeout(function(){d.hurtopacity-=.2},400),setTimeout(function(){d.hurtopacity-=.2},500)))};e.prototype.draw=function(b,d,c){b.save();b.fillStyle=!0===this.hit?"#8A0707":!0===this.attackable?"#A2AD59":"#8E936D";
b.fillRect(this.x-this.width/2-d,this.y-this.height/2-c,this.width,this.height);b.restore()};Game.Zombie=e})();
(function(){function e(b,d,c,a,e,f,h){this.x=b;this.y=d;this.dx=c-(b-e);this.dy=a-(d-f);this.mag=Math.sqrt(this.dx*this.dx+this.dy*this.dy);this.speed=h.speed;this.width=h.width;this.height=h.height;this.damage=h.damage;this.splash=h.splash;this.piercing=h.piercing;this.shots=h.shots}e.prototype.update=function(b){this.x+=this.dx/this.mag*this.speed*b;this.y+=this.dy/this.mag*this.speed*b};e.prototype.draw=function(b,d,c){b.save();b.fillStyle="#000000";b.fillRect(this.x-this.width/2-d,this.y-this.height/
2-c,this.width,this.height);b.restore()};Game.Bullet=e})();(function(){function e(b,d,c,a){this.x=b;this.y=d;this.width=c;this.height=a}e.prototype.draw=function(b,d,c){b.save();b.fillStyle="#584D3D";b.fillRect(this.x-this.width/2-d,this.y-this.height/2-c,this.width,this.height);b.restore()};Game.Obstacle=e})();
(function(){Game.Gun=function(e,b,d,c,a,p,f,h,u,y,g,m){this.name=e;this.damage=b;this.ammo=d;this.clipsize=this.clip=c;this.shots=a;this.splash=p;this.piercing=f;this.cooldown=this.cooltime=h;this.reloadtime=this.reload=u;this.speed=y;this.width=g;this.height=m}})();(function(){Game.Spawnpoint=function(e,b){this.x=e;this.y=b}})();(function(){Game.GunBuy=function(e,b){this.x=e;this.y=b;this.height=this.width=100}})();
(function(){function e(b,d){this.width=b;this.height=d;this.image=null}e.prototype.generate=function(){var b=document.createElement("canvas").getContext("2d");b.canvas.width=this.width;b.canvas.height=this.height;var d=Math.floor(this.width/44)+1,c=Math.floor(this.height/44)+1,a="#CEDFD9";b.save();b.fillStyle="#CEDFD9";for(var e=0,f=0;f<d;e+=44,f++){b.beginPath();for(var h=0,u=0;u<c;h+=44,u++)b.rect(e,h,40,40);a="#CEDFD9"==a?"#EBFCFB":"#CEDFD9";b.fillStyle=a;b.fill();b.closePath()}b.restore();this.image=
new Image;this.image.src=b.canvas.toDataURL("image/png")};e.prototype.draw=function(b,d,c){var a,e;a=b.canvas.width;e=b.canvas.height;this.image.width-d<a&&(a=this.image.width-d);this.image.height-c<e&&(e=this.image.height-c);b.drawImage(this.image,d,c,a,e,0,0,a,e)};Game.Map=e})();
(function(){var e,b,d,c=document.getElementById("gameCanvas");c.addEventListener("mousedown",function(a){e=!0;void 0!==a.clientX&&void 0!==a.clientY&&(b=a.clientX,d=a.clientY)},!1);c.addEventListener("mousemove",function(a){e&&void 0!==a.clientX&&void 0!==a.clientY&&(b=a.clientX,d=a.clientY)},!1);c.addEventListener("mouseup",function(a){e=!1},!1);var a=c.getContext("2d");a.canvas.width=.98*window.innerWidth;a.canvas.height=.98*window.innerHeight;var p=0,f=0,h=f-p,u=new Game.Map(3520,1760);u.generate();
for(var y=[new Game.Spawnpoint(-100,-100),new Game.Spawnpoint(1760,-100),new Game.Spawnpoint(3620,-100),new Game.Spawnpoint(-100,880),new Game.Spawnpoint(-100,1860),new Game.Spawnpoint(1760,1860),new Game.Spawnpoint(3620,1860),new Game.Spawnpoint(3620,880)],g=new Game.Player(1760,880),m=[],n=[new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*
Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*
Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50)),new Game.Obstacle(Math.floor(3520*Math.random()),
Math.floor(1760*Math.random()),Math.floor(400*Math.random()+50),Math.floor(400*Math.random()+50))],t=n.length-1;0<=t;t--)n[t].x+n[t].width/2>=g.x-g.width&&n[t].x-n[t].width/2<=g.x+g.width&&n[t].y+n[t].height/2>=g.y-g.height&&n[t].y-n[t].height/2<=g.y+g.height&&n.splice(t,1);var k=[],x=[new Game.Gun("Base Pistol",1,64,8,1,0,0,1,2,700,4,4),new Game.Gun("Semi Pistol",1,120,15,3,0,0,1,2,700,4,4),new Game.Gun("Machine Gun",1,300,30,1,0,0,.2,5,700,4,4),new Game.Gun("Pea Shooter",.5,200,20,1,0,0,.1,3,700,
2,2),new Game.Gun("Rifle",5,50,5,1,0,0,3,5,700,6,6)],r=new Game.Camera(0,0,c.width,c.height,3520,1760),z=2500,A=10,B=1;r.follow(g,c.width/2,c.height/2);var M=Math.round(a.canvas.width/10),E=Math.round(a.canvas.height/5);Math.round(a.canvas.height/25);Math.round(a.canvas.height/30);Math.round(a.canvas.height/35);Math.round(a.canvas.height/40);Math.round(a.canvas.height/45);Math.round(a.canvas.height/50);var F=["Play","Shop","Status","Restart"],v=0,w=0,C=!0,G=function(a){C&&(Game.controls.up&&0<v&&
(--v,C=!1),Game.controls.down&&v<F.length-1&&(v+=1,C=!1));!1===C&&(w<v*E-500*a?w+=500*a:w>v*E+500*a?w-=500*a:C=!0)},H=function(){if(-1!=q){var a=Math.floor(Math.random()*y.length);0<A&&m.length<=A&&(m.push(new Game.Zombie(y[a].x,y[a].y,B)),--A);0>=A&&(clearInterval(spawner),B+=1,900<=z&&(z-=200),setTimeout(function(){g.roundopacity=.9;0<=g.health&&(setTimeout(function(){g.roundopacity-=.1},100),setTimeout(function(){g.roundopacity-=.2},200),setTimeout(function(){g.roundopacity-=.2},300),setTimeout(function(){g.roundopacity-=
.2},400),setTimeout(function(){g.roundopacity-=.2},500));A=7*B;spawner=setInterval(H,z)},4E3))}},N=function(a){m[a].hit=!0;setTimeout(function(){"undefined"!=typeof m[a]&&(m[a].hit=!1)},100)},I=function(a){g.update(a,3520,1760,n);for(var f=m.length-1;0<=f;f--)m[f].update(a,g,n,m,f);if(e){var f=g.x,l=g.y,h=b-c.offsetLeft,p=d-c.offsetTop,t=r.xView,v=r.yView,q=x[g.gun];if(0<q.clip&&0>=q.cooldown)for(var u=q.shots-1;0<=u;u--){var w=setTimeout;k.push(new Game.Bullet(f,l,h,p,t,v,q));w(void 0,30*u);q.cooldown=
q.cooltime;--q.clip}}f=x[g.gun];for(l=k.length-1;0<=l;l--){k[l].update(a);for(h=m.length-1;0<=h;h--)"undefined"!=typeof k[l]&&Math.abs(m[h].x-k[l].x)<m[h].width/2+k[l].width/2&&Math.abs(m[h].y-k[l].y)<m[h].height/2+k[l].height/2&&(m[h].health-=f.damage,k.splice(l,1),0>=m[h].health?(m.splice(h,1),g.kills+=1,g.points+=50):(g.points+=10,N(h)));"undefined"!=typeof k[l]&&(k[l].x>Map.width||0>k[l].x?k.splice(l,1):(k[l].y>Map.height||0>k[l].y)&&k.splice(l,1));for(h=n.length-1;0<=h;h--)"undefined"!=typeof k[l]&&
(Math.abs(k[l].x-n[h].x)<n[h].width/2+k[l].width/2&&Math.abs(k[l].y-n[h].y)<=n[h].height/2+k[l].height/2?k.splice(l,1):(k[l].y>Map.height||0>k[l].y)&&k.splice(l,1))}0<=f.cooldown&&(f.cooldown-=a);0>=f.clip&&(f.reload-=a);0>=f.reload&&0<f.ammo&&(f.ammo-=f.clipsize-f.clip,f.clip=Math.min(f.clipsize,f.ammo),f.reload=f.reloadtime);r.update()},J=function(){a.clearRect(0,0,c.width,c.height);u.draw(a,r.xView,r.yView);for(var b=m.length-1;0<=b;b--)m[b].draw(a,r.xView,r.yView);for(b=k.length-1;0<=b;b--)k[b].draw(a,
r.xView,r.yView);for(b=n.length-1;0<=b;b--)n[b].draw(a,r.xView,r.yView);0<g.hurtopacity&&(a.save(),a.fillStyle="#8A0707",a.globalAlpha=g.hurtopacity,a.fillRect(0,0,c.width,c.height),a.restore());0<g.roundopacity&&(a.save(),a.fillStyle="#197319",a.globalAlpha=g.roundopacity,a.fillRect(0,0,c.width,c.height),a.restore());g.draw(a,r.xView,r.yView);a.save();a.fillStyle="#8A0707";a.font="25px Special Elite";2<g.health&&a.fillText("\u2764",c.width-330,60);1<g.health&&a.fillText("\u2764",c.width-300,60);
0<g.health&&a.fillText("\u2764",c.width-270,60);a.restore();a.save();a.font="20px Special Elite";a.fillStyle=0>=x[g.gun].clip?"#808080":"#2e2528";a.fillText(x[g.gun].name+" "+x[g.gun].clip+"/"+x[g.gun].ammo,30,.98*c.height);a.restore();a.save();a.font="20px Special Elite";a.fillText("Round: "+B+" Points: "+g.points+" Kills: "+g.kills,c.width-330,30);a.restore()},q=-1,D=-1,K=function(a){f=a;h=(f-p)/1E3;p=f;.2<h?I(1E-4):I(h);J();q=requestAnimationFrame(K)},L=function(b){f=b;h=(f-p)/1E3;p=f;.2<h?G(1E-4):
G(h);J();a.save();a.fillStyle="#FFFFFF";a.globalAlpha=.6;a.fillRect(0,0,c.width,c.height);a.restore();a.save();a.font="Bold 70px Codystar";a.fillStyle="#8A0707";a.globalAlpha=1;a.fillText("Brambles Of Zambles",c.width/4,.95*c.height);a.restore();for(b=F.length-1;0<=b;b--)a.save(),a.font="20px Special Elite",a.fillStyle="#000000",a.globalAlpha=1,b==v&&(a.fillStyle="#8A0707"),a.fillText(F[b],M,E*(b+1)-w),a.restore();D=requestAnimationFrame(L)};Game.play=function(){-1==q&&(cancelAnimationFrame(D),spawner=
setInterval(H,z),D=-1,q=requestAnimationFrame(K),console.log("play"))};Game.pause=function(){-1!=q&&(cancelAnimationFrame(q),clearInterval(spawner),q=-1,D=requestAnimationFrame(L),console.log("paused"))};Game.togglePause=function(){-1==q?Game.play():Game.pause()}})();Game.controls={left:!1,up:!1,right:!1,down:!1,reload:!1,action:!1,one:!1,two:!1,three:!1,four:!1,five:!1,enter:!1};
window.addEventListener("keydown",function(e){switch(e.keyCode){case 65:Game.controls.left=!0;break;case 87:Game.controls.up=!0;break;case 68:Game.controls.right=!0;break;case 83:Game.controls.down=!0;break;case 69:Game.controls.action=!0;break;case 81:Game.controls.reload=!0;break;case 49:Game.controls.one=!0;break;case 50:Game.controls.two=!0;break;case 51:Game.controls.three=!0;break;case 52:Game.controls.four=!0;break;case 53:Game.controls.five=!0;break;case 13:Game.controls.enter=!0}},!1);
window.addEventListener("keyup",function(e){switch(e.keyCode){case 65:Game.controls.left=!1;break;case 87:Game.controls.up=!1;break;case 68:Game.controls.right=!1;break;case 83:Game.controls.down=!1;break;case 80:Game.togglePause();break;case 69:Game.controls.action=!1;break;case 81:Game.controls.reload=!1;break;case 49:Game.controls.one=!1;break;case 50:Game.controls.two=!1;break;case 51:Game.controls.three=!1;break;case 52:Game.controls.four=!1;break;case 53:Game.controls.five=!1;break;case 13:Game.controls.enter=
!1}},!1);window.onload=function(){var e=document.getElementById("loading");e.parentNode.removeChild(e);Game.play()};
