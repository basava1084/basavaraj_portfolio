
(function(){
/* ===== Set these two ===== */
var PORTFOLIO_URL='portfolio.html';   // put your real portfolio link here
var REDIRECT_MS=2800;             // 2 to 3 seconds after clicking Enter
/* ========================= */
var PHOTO='images/photo.jpg',FACE='images/face.jpg';
document.getElementById('face').src=FACE;document.getElementById('pimg').src=PHOTO;
document.getElementById('wimg').src=PHOTO;document.getElementById('wbg').style.backgroundImage='url('+PHOTO+')';
document.getElementById('skip').href=PORTFOLIO_URL;

var items=[
 {k:'</>',t:'Full Stack',d:'End-to-end products, from the interface to the server and database.',g:['React','Node.js','APIs']},
 {k:'AI',t:'AI & LLMs',d:'Features powered by language models, from smart search to assistants.',g:['LLMs','RAG','Python']},
 {k:'UI',t:'Frontend',d:'Fast, responsive interfaces with careful detail and motion.',g:['React','TypeScript','CSS']},
 {k:'{ }',t:'Backend',d:'Reliable services and clean architecture that scale with the product.',g:['Node.js','Python','REST']},
 {k:'DB',t:'Databases',d:'Data models and queries designed to stay quick as the data grows.',g:['SQL','Schemas','Indexing']},
 {k:'⚙',t:'Deploy',d:'Shipping and running apps smoothly with containers and automation.',g:['Docker','CI/CD','Cloud']}
];
var wheel=document.getElementById('wheel'),ww=document.getElementById('ww'),card=document.getElementById('card'),nodes=[],sel=0,rot=0,auto,n=items.length,ANG=-50;
items.forEach(function(it,i){var b=document.createElement('button');b.className='node';b.type='button';b.setAttribute('aria-label',it.t);
  b.innerHTML='<div class="ni">'+it.k.replace('<','&lt;').replace('>','&gt;')+'</div><em>'+it.t+'</em>';
  b.addEventListener('click',function(){pick(i,true)});wheel.appendChild(b);nodes.push(b)});
function place(){var R=ww.clientWidth*.4;nodes.forEach(function(b,i){var a=i*360/n;b.style.transform='rotate('+a+'deg) translateY('+(-R)+'px) rotate('+(-(a+rot))+'deg)'})}
function pick(i,user){
  sel=(i+n)%n;var want=ANG-sel*360/n,delta=((want-rot)%360+540)%360-180;rot+=delta;
  wheel.style.transform='rotate('+rot+'deg)';place();
  nodes.forEach(function(b,j){b.classList.toggle('on',j===sel)});
  var it=items[sel];card.classList.remove('sw');void card.offsetWidth;
  card.querySelector('.no').textContent=('0'+(sel+1)).slice(-2)+' / 0'+n;
  card.querySelector('h2').textContent=it.t;card.querySelector('p').textContent=it.d;
  card.querySelector('.tags').innerHTML=it.g.map(function(x){return '<span>'+x+'</span>'}).join('');
  card.classList.add('sw');
  if(user){clearInterval(auto);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)auto=setInterval(function(){pick(sel+1)},4200)}
}
addEventListener('resize',place);
window.addEventListener('orientationchange',function(){setTimeout(place,100)});
addEventListener('keydown',function(e){if(e.key==='ArrowRight')pick(sel+1,true);if(e.key==='ArrowLeft')pick(sel-1,true)});
wheel.style.transition='none';place();void wheel.offsetWidth;wheel.style.transition='';
pick(0,true);
requestAnimationFrame(place);
addEventListener('pointermove',function(e){var x=e.clientX/innerWidth*2-1,y=e.clientY/innerHeight*2-1;document.getElementById('portrait').style.transform='translate('+x*10+'px,'+y*8+'px)'});

var bk=document.getElementById('bks');
for(var i=0;i<14;i++){var d=document.createElement('div'),s=14+Math.random()*50;d.className='bk';d.style.cssText='left:'+Math.random()*100+'%;width:'+s+'px;height:'+s+'px;opacity:'+(.25+Math.random()*.4)+';animation-duration:'+(18+Math.random()*22)+'s;animation-delay:'+(-Math.random()*30)+'s';bk.appendChild(d)}

var wt=document.getElementById('wt');'Welcome'.split('').forEach(function(ch,i){var s=document.createElement('span');s.textContent=ch;s.style.setProperty('--i',i);wt.appendChild(s)});
var entered=false;
document.getElementById('enter').addEventListener('click',function(){
  if(entered)return;entered=true;clearInterval(auto);
  document.getElementById('welcome').classList.add('go');
  setTimeout(function(){window.location.href=PORTFOLIO_URL},REDIRECT_MS);
});

var ac,osc=[],mg,on=false,btn=document.getElementById('audio');
btn.addEventListener('click',function(){
  on=!on;btn.classList.toggle('on',on);document.getElementById('al').textContent='Audio: '+(on?'On':'Off');
  try{
    if(on){ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();mg=ac.createGain();mg.gain.value=0;mg.connect(ac.destination);mg.gain.linearRampToValueAtTime(.05,ac.currentTime+2);
      [130.8,196,261.6,392].forEach(function(f){var o=ac.createOscillator();o.frequency.value=f;o.detune.value=Math.random()*10-5;o.connect(mg);o.start();osc.push(o)})}
    else if(mg){mg.gain.linearRampToValueAtTime(0,ac.currentTime+.6);var q=osc;osc=[];setTimeout(function(){q.forEach(function(o){o.stop()})},700)}
  }catch(e){}
});
})();
