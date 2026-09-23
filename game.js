const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const scoreEl = document.querySelector('#score'), coinsEl = document.querySelector('#coins'), bestEl = document.querySelector('#best');
const startPanel = document.querySelector('#start-panel'), overPanel = document.querySelector('#gameover-panel');
const finalScore = document.querySelector('#final-score');
let state = 'ready', last = 0, distance = 0, score = 0, coinCount = 0, best = Number(localStorage.metroDashBest || 0), speed = 310, spawnTimer = 0, coinTimer = 0;
bestEl.textContent = best;
const lanes = [W * .34, W * .5, W * .66];
const player = { lane:1, x:lanes[1], y:H-112, w:42, h:68, vy:0, jumping:false, sliding:false, slideTime:0 };
let hazards = [], coins = [], sparks = [], stars = [];
for (let i=0;i<90;i++) stars.push({x:Math.random()*W,y:Math.random()*H*.62,r:Math.random()*1.7+.3,a:Math.random()*.6+.2});

function reset() { state='playing'; distance=score=coinCount=0; speed=310; spawnTimer=.5; coinTimer=.1; hazards=[]; coins=[]; sparks=[]; Object.assign(player,{lane:1,x:lanes[1],y:H-112,vy:0,jumping:false,sliding:false,slideTime:0}); startPanel.classList.add('hidden'); overPanel.classList.add('hidden'); }
function endGame() { state='over'; best=Math.max(best,score); localStorage.metroDashBest=best; bestEl.textContent=best; finalScore.textContent=score; overPanel.classList.remove('hidden'); burst(player.x,player.y+20,'#ff547b',22); }
function move(dir) { if(state!=='playing') return; player.lane=Math.max(0,Math.min(2,player.lane+dir)); }
function jump() { if(state==='playing'&&!player.jumping&&!player.sliding){player.jumping=true;player.vy=-690;} }
function slide() { if(state==='playing'&&!player.jumping){player.sliding=true;player.slideTime=.56;} }
function spawnHazard() { const lane=Math.floor(Math.random()*3); const type=Math.random()<.35?'barrier':'train'; hazards.push({lane,x:lanes[lane],y:-90,type,w:type==='train'?76:58,h:type==='train'?95:45}); }
function spawnCoinLine() { const lane=Math.floor(Math.random()*3), count=3+Math.floor(Math.random()*4); for(let i=0;i<count;i++) coins.push({lane,x:lanes[lane],y:-25-i*52,r:10,spin:Math.random()*6}); }
function burst(x,y,color,n=10) { for(let i=0;i<n;i++) sparks.push({x,y,vx:(Math.random()-.5)*180,vy:(Math.random()-.8)*180,life:.5,color}); }
function update(dt) {
 distance += speed*dt*.035; score=Math.floor(distance)+coinCount*25; speed=310+Math.min(270,distance*1.6);
 spawnTimer-=dt; coinTimer-=dt; if(spawnTimer<=0){spawnHazard();spawnTimer=Math.max(.52,1.05-distance/850)+Math.random()*.35;} if(coinTimer<=0){spawnCoinLine();coinTimer=1.25+Math.random()*1.5;}
 if(player.lane!==Math.round((player.x-lanes[0])/(lanes[1]-lanes[0]))) player.x += (lanes[player.lane]-player.x)*Math.min(1,dt*12); else player.x += (lanes[player.lane]-player.x)*Math.min(1,dt*12);
 if(player.jumping){player.y+=player.vy*dt;player.vy+=1700*dt;if(player.y>=H-112){player.y=H-112;player.jumping=false;}}
 if(player.sliding){player.slideTime-=dt;if(player.slideTime<=0)player.sliding=false;}
 hazards.forEach(o=>o.y+=speed*dt); coins.forEach(c=>{c.y+=speed*dt;c.spin+=dt*8});
 hazards=hazards.filter(o=>o.y<H+120); coins=coins.filter(c=>{if(c.y>H+30)return false; if(Math.abs(c.x-player.x)<32&&Math.abs(c.y-(player.y+28))<34){coinCount++;burst(c.x,c.y,'#ffe66d',7);return false;} return true;});
 for(const o of hazards){const ph=player.sliding?player.y+35:player.y, phh=player.sliding?34:player.h; if(Math.abs(o.x-player.x)<(o.w+player.w)/2-7&&Math.abs(o.y+o.h/2-(ph+phh/2))<(o.h+phh)/2-8){endGame();break;}}
 sparks.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt});sparks=sparks.filter(p=>p.life>0);
 scoreEl.textContent=score; coinsEl.textContent=coinCount;
}
function draw() {
 ctx.clearRect(0,0,W,H); const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#0b1835');grad.addColorStop(.58,'#11152b');grad.addColorStop(1,'#17101c');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 stars.forEach(s=>{ctx.globalAlpha=s.a;ctx.fillStyle='#a5d8ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()});ctx.globalAlpha=1;
 // distant city
 for(let i=0;i<18;i++){let x=i*62+(i%2)*12,h=35+(i*37)%95;ctx.fillStyle=i%3?'#101d37':'#172746';ctx.fillRect(x,H-185-h,48,h);for(let y=H-175-h;y<H-190;y+=18){ctx.fillStyle='#2a5270';ctx.fillRect(x+10,y,4,5);ctx.fillRect(x+29,y,4,5)}}
 // perspective track
 ctx.fillStyle='#161c31';ctx.beginPath();ctx.moveTo(W*.18,H);ctx.lineTo(W*.37,H-190);ctx.lineTo(W*.63,H-190);ctx.lineTo(W*.82,H);ctx.fill();
 ctx.strokeStyle='#344260';ctx.lineWidth=5; for(let x of [W*.28,W*.72]){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(W/2+(x-W/2)*.42,H-190);ctx.stroke();}
 ctx.strokeStyle='#27334d';ctx.lineWidth=3;for(let y=H-12;y>H-190;y-=34){let t=(H-y)/(H-(H-190));let half=190*t+35;ctx.beginPath();ctx.moveTo(W/2-half,y);ctx.lineTo(W/2+half,y);ctx.stroke();}
 // lane lights
 for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#43e6d155':'#ff547b44';ctx.beginPath();ctx.arc(lanes[i],H-188,4,0,7);ctx.fill();}
 coins.forEach(c=>{ctx.save();ctx.translate(c.x,c.y);ctx.scale(Math.abs(Math.cos(c.spin))*.65+.35,1);ctx.fillStyle='#ffe66d';ctx.shadowColor='#ffe66d';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(0,0,c.r,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#a86d2d';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('✦',0,4);ctx.restore()});
 hazards.forEach(o=>{ctx.save();ctx.translate(o.x,o.y); if(o.type==='train'){ctx.fillStyle='#d73567';ctx.fillRect(-38,0,76,95);ctx.fillStyle='#301a3d';ctx.fillRect(-28,12,56,30);ctx.fillStyle='#61e6d5';ctx.fillRect(-21,19,17,14);ctx.fillRect(5,19,17,14);ctx.fillStyle='#ffda68';ctx.fillRect(-28,73,11,6);ctx.fillRect(17,73,11,6);}else{ctx.fillStyle='#ff547b';ctx.fillRect(-29,0,58,45);ctx.fillStyle='#ffda68';ctx.fillRect(-20,8,40,5);ctx.fillStyle='#591c4c';ctx.fillRect(-20,22,40,13);}ctx.restore()});
 // player
 ctx.save();ctx.translate(player.x,player.y+(player.sliding?28:0));if(player.sliding)ctx.rotate(-.08);ctx.fillStyle='#43e6d1';ctx.shadowColor='#43e6d1';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,-9,17,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f4f7ff';ctx.fillRect(-18,8,36,player.sliding?21:38);ctx.fillStyle='#ff547b';ctx.fillRect(-14,12,28,7);ctx.fillStyle='#17233e';ctx.fillRect(-16,player.sliding?27:45,12,10);ctx.fillRect(4,player.sliding?27:45,12,10);ctx.restore();
 sparks.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)});ctx.globalAlpha=1;
}
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;if(state==='playing')update(dt);draw();requestAnimationFrame(loop)}
function start(){reset()}
document.querySelector('#start-btn').onclick=start;document.querySelector('#again-btn').onclick=start;
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')move(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')move(1);if(e.key==='ArrowUp'||e.key.toLowerCase()==='w'||e.key===' ')jump();if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')slide();if(e.key==='Enter'&&state!=='playing')start()});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',()=>({left:move.bind(null,-1),right:move.bind(null,1),jump,slide}[b.dataset.action])()));
let touchX=0,touchY=0;canvas.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});canvas.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-touchX,dy=t.clientY-touchY;if(Math.max(Math.abs(dx),Math.abs(dy))<25)jump();else if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else if(dy<0)jump();else slide()},{passive:true});
requestAnimationFrame(loop);
