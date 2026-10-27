(function(){
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,$=function(i){return document.getElementById(i)};
var portal=$('introPortal');
if(!portal){requestAnimationFrame(function(){setTimeout(function(){document.body.classList.add('ld')},120)});}
/* reveal */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.rv,.sec,.hero').forEach(function(el){io.observe(el)});
/* nav indicator & sticky elevation */
var pill=$('pill'),links=[].slice.call(pill.querySelectorAll('a')),ind=pill.querySelector('i'),cur=null,navBar=document.querySelector('.nav');
function mark(a){if(cur===a)return;cur=a;links.forEach(function(l){l.classList.toggle('on',l===a)});ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+a.offsetLeft+'px)';var l=a.offsetLeft-pill.clientWidth/2+a.offsetWidth/2;pill.scrollTo({left:l,behavior:'smooth'})}
var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)mark(links[secs.indexOf(e.target)])})},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(function(s){so.observe(s)});mark(links[0]);
addEventListener('resize',function(){var c=cur;cur=null;mark(c)});
/* hero smooth parallax & dynamic controls positioning */
var gh=$('ghost'),gj=$('ghost-j'),ctrls=$('vidCtrls'),vid=$('person-vid'),topSec=$('top');
var targetMx=0,currentMx=0,sy=0;
addEventListener('pointermove',function(e){targetMx=e.clientX/innerWidth-.5});
function updateHero(){
  sy=scrollY;
  currentMx+=(targetMx-currentMx)*0.08;
  if(navBar)navBar.classList.toggle('scrolled',sy>30);
  if(!rm&&gh){
    gh.style.transform='translate('+(-50+currentMx*-3)+'%,'+(sy*.22)+'px)';
    var t=body_ld()?'translate('+(currentMx*14)+'px,'+(sy*.06)+'px)':'';
    if(vid)vid.style.transform=t;
  }
  if(vid&&ctrls){
    var vR=vid.getBoundingClientRect();
    var hR=topSec?topSec.getBoundingClientRect():{top:0,left:0};
    var pillW=ctrls.offsetWidth||(ctrls.classList.contains('closed')?44:220);
    var targetLeft=vR.right-hR.left+10;
    var maxLeft=window.innerWidth-pillW-12;
    if(targetLeft>maxLeft)targetLeft=maxLeft;
    var targetTop=vR.top-hR.top+Math.min(Math.max(60,vR.height*0.35),260);
    ctrls.style.left=targetLeft+'px';
    ctrls.style.top=targetTop+'px';
    ctrls.style.bottom='auto';
    ctrls.style.transform='none';
  }
}
(function loop(){updateHero();requestAnimationFrame(loop)})();
function body_ld(){return document.body.classList.contains('ld')&&performance.now()>1900}
/* video controls & closed circle toggle */
(function(){
var vid=$('person-vid'),ctrls=$('vidCtrls'),dotBtn=$('dotBtn'),closeBtn=$('vidCloseBtn');
var playBtn=$('vidPlayBtn'),sndBtn=$('sndBtn');
if(!vid||!ctrls)return;

function openCtrls(){
  ctrls.classList.remove('closed');
  ctrls.classList.add('open');
  if(vid.muted){
    vid.muted=false;
    updateSound(false);
  }
  if(vid.paused){
    vid.play().then(function(){updatePlay(false)}).catch(function(){});
  }
}

function closeCtrls(e){
  if(e)e.stopPropagation();
  ctrls.classList.remove('open');
  ctrls.classList.add('closed');
}

if(dotBtn)dotBtn.addEventListener('click',openCtrls);
ctrls.addEventListener('click',function(e){
  if(ctrls.classList.contains('closed')){
    openCtrls();
  }
});
if(closeBtn)closeBtn.addEventListener('click',closeCtrls);

function updatePlay(paused){
  if(!playBtn)return;
  var playI=playBtn.querySelector('.icon-play'),pauseI=playBtn.querySelector('.icon-pause');
  if(playI&&pauseI){playI.style.display=paused?'block':'none';pauseI.style.display=paused?'none':'block'}
}
function updateSound(muted){
  if(!sndBtn)return;
  var muteI=sndBtn.querySelector('.icon-mute'),soundI=sndBtn.querySelector('.icon-sound');
  if(muteI&&soundI){muteI.style.display=muted?'block':'none';soundI.style.display=muted?'none':'block'}
  sndBtn.classList.toggle('on',!muted);
  sndBtn.setAttribute('aria-label',muted?'Unmute video':'Mute video');
}
if(playBtn){
  playBtn.addEventListener('click',function(e){
    e.stopPropagation();
    if(vid.paused){vid.play();updatePlay(false)}
    else{vid.pause();updatePlay(true)}
  });
  vid.addEventListener('play',function(){updatePlay(false)});
  vid.addEventListener('pause',function(){updatePlay(true)});
}
if(sndBtn){
  sndBtn.addEventListener('click',function(e){
    e.stopPropagation();
    vid.muted=!vid.muted;
    updateSound(vid.muted);
  });
}
})();
/* lanyard elastic rubber-band pull & snap physics */
(function(){
var lan=$('lan'),pend=$('pend');
if(!lan||!pend)return;

var strap=pend.querySelector('.strap');
var clip=pend.querySelector('.clip');
var idc=$('idc');
if(!strap||!clip||!idc)return;

var th=0,om=0;               // pendulum angle & angular velocity
var y=0,vy=0;                 // vertical stretch displacement (px) & velocity (px/s)
var isDragging=false;
var dragStartPointer={x:0,y:0};
var dragStartCard={y:0,th:0};
var lastPointerPos={x:0,y:0};
var lastPointerTime=performance.now();
var lastFrameTime=performance.now();
var cardTiltX=0,cardTiltY=0;
var t0=performance.now();

lan.addEventListener('pointerdown',function(e){
  if(!e.target.closest('#idc')&&!e.target.closest('.clip'))return;
  e.preventDefault();
  isDragging=true;
  lan.classList.add('is-dragging');
  try{lan.setPointerCapture(e.pointerId);}catch(ex){}

  dragStartPointer={x:e.clientX,y:e.clientY};
  dragStartCard={y:y,th:th};
  lastPointerPos={x:e.clientX,y:y,th:th};
  lastPointerTime=performance.now();
  vy=0;
  om=0;
});

lan.addEventListener('pointermove',function(e){
  if(!isDragging){
    if(e.target.closest('#idc')){
      var r=idc.getBoundingClientRect();
      var hx=(e.clientX-(r.left+r.width/2))/(r.width/2);
      var hy=(e.clientY-(r.top+r.height/2))/(r.height/2);
      cardTiltY=hx*5.5;
      cardTiltX=-hy*5.5;
    }else{
      cardTiltX*=0.85;
      cardTiltY*=0.85;
    }
    return;
  }

  var rLan=lan.getBoundingClientRect();
  var pX=rLan.left+rLan.width/2;
  var pY=rLan.top-30;

  var curDx=e.clientX-pX;
  var curDy=e.clientY-pY;
  var rawAngle=-Math.atan2(curDx,Math.max(90,curDy))*180/Math.PI;
  var targetTh=Math.max(-42,Math.min(42,rawAngle));
  th=th*0.35+targetTh*0.65;

  var deltaY=e.clientY-dragStartPointer.y;
  var rawY=dragStartCard.y+deltaY;
  if(rawY>=0){
    // Elastic rubber stretch curve with progressive resistance up to ~220px
    var maxStretch=220;
    y=maxStretch*Math.tanh(rawY/(maxStretch*1.08));
  }else{
    // Upward give with stiff resistance
    y=-26*Math.tanh(-rawY/32);
  }

  var now=performance.now();
  var dt=Math.max(0.006,(now-lastPointerTime)/1000);
  var prevY=(lastPointerPos&&typeof lastPointerPos.y==='number')?lastPointerPos.y:y;
  var prevTh=(lastPointerPos&&typeof lastPointerPos.th==='number')?lastPointerPos.th:th;
  var instVy=(y-prevY)/dt;
  var instOm=((th-prevTh)*0.05)/dt;
  if(!isFinite(instVy))instVy=0;
  if(!isFinite(instOm))instOm=0;
  vy=vy*0.4+instVy*0.6;
  om=om*0.4+instOm*0.6;

  lastPointerPos={x:e.clientX,y:y,th:th};
  lastPointerTime=now;
});

function endDrag(e){
  if(!isDragging)return;
  isDragging=false;
  lan.classList.remove('is-dragging');
  if(e&&e.pointerId){
    try{lan.releasePointerCapture(e.pointerId);}catch(ex){}
  }
  vy=Math.max(-950,Math.min(950,vy));
  om=Math.max(-80,Math.min(80,om));
  if(window.navigator&&window.navigator.vibrate){
    try{window.navigator.vibrate(8);}catch(ex){}
  }
}

['pointerup','pointercancel'].forEach(function(n){lan.addEventListener(n,endDrag);});
lan.addEventListener('pointerleave',function(){if(!isDragging){cardTiltX=0;cardTiltY=0;}});

(function phys(){
  var now=performance.now();
  var dt=Math.min(0.033,Math.max(0.008,(now-lastFrameTime)/1000));
  lastFrameTime=now;

  if(!isDragging){
    cardTiltX*=0.92;
    cardTiltY*=0.92;

    // Elastic rubber-band spring physics (ky: spring stiffness, cy: damping)
    var fy=-230*y-12.2*vy;
    vy+=fy*dt;
    y+=vy*dt;

    // Pendulum gravity & air drag
    var a=-Math.sin(th*Math.PI/180)*190-om*2.4;
    om+=a*dt;
    th+=om*dt*57.3*0.017*8;

    // Snap to rest when oscillations decay below threshold
    if(Math.abs(y)<0.25&&Math.abs(vy)<1.2){
      y=0;
      vy=0;
    }
    if(y===0&&Math.abs(th)<0.25&&Math.abs(om)<0.25){
      var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      th=rm?0:Math.sin((now-t0)/1400)*1.2;
    }
  }

  // Dynamic aerodynamic pitch when bouncing/stretching
  var dynamicPitch=isDragging?(y*0.04):(-vy*0.018);
  dynamicPitch=Math.max(-8,Math.min(8,dynamicPitch));

  // Render pendulum rotation
  pend.style.transform='rotate('+th.toFixed(2)+'deg)';

  // Render elastic strap stretching & slight thinning (Poisson ratio)
  var strapScaleY=Math.max(0.05,(190+y)/190);
  var strapScaleX=Math.max(0.68,Math.min(1.2,1-(y/(190+Math.max(0,y)))*0.22));
  strap.style.transform='scaleY('+strapScaleY.toFixed(4)+') scaleX('+strapScaleX.toFixed(4)+')';

  // Render clip displacement
  clip.style.transform='translateY('+y.toFixed(2)+'px)';

  // Render ID card displacement & 3D tilt
  idc.style.transform='translateY('+y.toFixed(2)+'px) perspective(600px) rotateX('+(cardTiltX+dynamicPitch).toFixed(2)+'deg) rotateY('+cardTiltY.toFixed(2)+'deg)';

  requestAnimationFrame(phys);
})();
})();
/* skills 3d showcase */
var SKILLS_DATA = {
  'Languages': {
    num: '01',
    title: 'Languages',
    sub: 'The foundation.',
    color: '#3b82f6',
    xPct: 17,
    tools: ['Python', 'Java', 'C', 'JavaScript'],
    projects: ['Smart Emotion Care Desk (Flask API)', 'Code Mining Tool (Pattern Parser)', 'Full-Stack Web Architectures']
  },
  'Frontend': {
    num: '02',
    title: 'Frontend',
    sub: 'Design to reality.',
    color: '#f97316',
    xPct: 29,
    tools: ['React.js', 'HTML5', 'CSS3', 'Responsive UI'],
    projects: ['AI_NUTRA-FOOD E-commerce UI', 'SkillSwap Peer Learning Interface', 'Dev Creations Internship Components']
  },
  'Backend': {
    num: '03',
    title: 'Backend',
    sub: 'Powering logic.',
    color: '#10b981',
    xPct: 41,
    tools: ['Node.js', 'Flask', 'Express.js', 'REST APIs'],
    projects: ['AI_NUTRA-FOOD Server & Endpoints', 'Smart Emotion Care Desk REST API', 'Secure JWT Auth & API Integrations']
  },
  'Data & Cloud': {
    num: '04',
    title: 'Data & Cloud',
    sub: 'From data to impact.',
    color: '#6366f1',
    xPct: 54,
    tools: ['MongoDB', 'Firebase', 'Firestore', 'AWS'],
    projects: ['AI_NUTRA-FOOD Catalog & Orders DB', 'SkillSwap Real-Time Messaging & Auth', 'Cloud Microservices & Deployments']
  },
  'AI / ML': {
    num: '05',
    title: 'AI / ML',
    sub: 'Learning for tomorrow.',
    color: '#a855f7',
    xPct: 67,
    tools: ['Scikit-learn', 'LangChain', 'LLaMA-3', 'OpenCV / NLP'],
    projects: ['AI_NUTRA-FOOD Conversational RAG Chatbot', 'Smart Emotion Care Desk Mood Analysis', 'Custom NLP Sentiment Processing']
  },
  'Tools': {
    num: '06',
    title: 'Tools',
    sub: 'Build. Deploy. Grow.',
    color: '#f59e0b',
    xPct: 79,
    tools: ['Git', 'GitHub', 'Docker', 'VS Code', 'Postman'],
    projects: ['Git & GitHub PR Workflows', 'Containerized Development Environments', 'Comprehensive API Verification']
  }
};

(function(){
  var flyout = $('skillsFlyout');
  var flyoutClose = $('flyoutClose');
  var cols = document.querySelectorAll('.podium-col');
  var chips = document.querySelectorAll('.s-chip');
  var pinnedCat = null;
  var hoverCat = null;
  var hideTimer = null;

  function renderCategory(cat){
    var data = SKILLS_DATA[cat];
    if(!data || !flyout) return;

    // Update active / dimmed classes on columns
    cols.forEach(function(c){
      var isTarget = c.dataset.cat === cat;
      c.classList.toggle('active', isTarget);
      c.classList.toggle('dimmed', !isTarget);
    });

    // Update chips
    chips.forEach(function(ch){
      var isTarget = ch.dataset.filter === cat;
      ch.classList.toggle('on', isTarget);
      ch.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    flyout.style.setProperty('--cat-accent', data.color);
    if(window.innerWidth > 1040){
      flyout.style.left = data.xPct + '%';
    }else{
      flyout.style.left = '50%';
    }

    var numEl = $('flyoutNum'), titleEl = $('flyoutTitle'), subEl = $('flyoutSub');
    if(numEl) numEl.textContent = data.num;
    if(titleEl) titleEl.textContent = data.title;
    if(subEl) subEl.textContent = data.sub;

    var tagsBox = $('flyoutTags');
    if(tagsBox){
      tagsBox.innerHTML = data.tools.map(function(t){
        return '<span class="flyout-tag-item"><i></i>' + t + '</span>';
      }).join('');
    }

    var projBox = $('flyoutProjects');
    if(projBox){
      projBox.innerHTML = data.projects.map(function(p){
        return '<div class="flyout-proj-row"><span>' + p + '</span></div>';
      }).join('');
    }

    flyout.classList.add('visible');
  }

  function resetToAll(){
    pinnedCat = null;
    hoverCat = null;
    cols.forEach(function(c){
      c.classList.remove('active', 'dimmed');
    });
    chips.forEach(function(ch){
      var isAll = ch.dataset.filter === 'All';
      ch.classList.toggle('on', isAll);
      ch.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });
    if(flyout) flyout.classList.remove('visible');
  }

  function showCategory(cat, isPinned){
    clearTimeout(hideTimer);
    if(isPinned){
      pinnedCat = cat;
    }else{
      hoverCat = cat;
    }
    renderCategory(cat);
  }

  function handleMouseLeave(){
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function(){
      hoverCat = null;
      if(pinnedCat){
        renderCategory(pinnedCat);
      }else{
        resetToAll();
      }
    }, 240);
  }

  // Column interactions
  cols.forEach(function(col){
    col.addEventListener('mouseenter', function(){
      showCategory(col.dataset.cat, false);
    });
    col.addEventListener('mouseleave', handleMouseLeave);
    col.addEventListener('click', function(e){
      e.stopPropagation();
      var cat = col.dataset.cat;
      if(pinnedCat === cat && flyout && flyout.classList.contains('visible')){
        resetToAll();
      }else{
        showCategory(cat, true);
      }
    });
  });

  if(flyout){
    flyout.addEventListener('mouseenter', function(){
      clearTimeout(hideTimer);
    });
    flyout.addEventListener('mouseleave', handleMouseLeave);
  }

  // Filter chips interaction (top row buttons)
  chips.forEach(function(ch){
    ch.addEventListener('click', function(e){
      e.stopPropagation();
      var filt = ch.dataset.filter;
      if(filt === 'All'){
        resetToAll();
      }else{
        showCategory(filt, true);
      }
    });
  });

  if(flyoutClose){
    flyoutClose.addEventListener('click', function(e){
      e.stopPropagation();
      resetToAll();
    });
  }

  document.addEventListener('click', function(e){
    if(flyout && !flyout.contains(e.target) && !e.target.closest('.podium-col') && !e.target.closest('.s-chip')){
      resetToAll();
    }
  });
})();
/* ============================================================
   PROJECTS SECTION INTERACTIVE ENGINE (EDITORIAL REDESIGN)
   ============================================================ */
var PROJECTS_DATA = [
  {
    id: 'ai-nutra-food',
    num: '01',
    railName: 'Nutra<br>Food',
    year: '2026',
    title: 'AI_NUTRA-FOOD',
    desc1: 'An AI-powered nutrition store with login, product management, cart and a responsive interface.',
    desc2: 'A chatbot and voice assistant built on LangChain and LLaMA-3 answer nutrition questions and recommend products. RAG keeps answers specific to the store.',
    stack: ['React.js', 'Node.js', 'MongoDB', 'LangChain', 'LLaMA-3'],
    liveUrl: 'https://ai-nutra-food-tznc.vercel.app/',
    liveLabel: 'Visit live site',
    codeUrl: 'https://github.com/basava1084',
    mockupAddress: 'nutrafood.app',
    image: 'assets/projects/ai-nutra-food.jpg',
    features: [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8"/></svg>',
        name: 'AI Chatbot',
        desc: '& Voice Assistant'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
        name: 'Smart Product',
        desc: 'Recommendations'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
        name: 'RAG-powered',
        desc: 'Accurate Answers'
      }
    ],
    floatingCard: `
      <div class="f-card-header">
        <div class="f-card-title"><span class="sparkle-icon">✦</span> AI Assistant</div>
        <div class="f-card-close" aria-hidden="true">&times;</div>
      </div>
      <div class="f-chat-bubble">Hi! Ask me anything about nutrition.</div>
      <div class="f-chat-bubble user">What's good for muscle gain?</div>
      <div class="f-chat-bubble">Here are top matches:</div>
      <div class="f-mini-products">
        <div class="f-mini-prod-item">
          <span>Whey Protein</span>
          <b>$32.00</b>
        </div>
        <div class="f-mini-prod-item">
          <span>Peanut Butter</span>
          <b>$12.00</b>
        </div>
      </div>
      <div class="f-chat-input-bar">
        <span>Ask a question...</span>
        <div class="f-mic-btn">🎙</div>
      </div>
    `
  },
  {
    id: 'smart-emotion-care-desk',
    num: '02',
    railName: 'Emotion<br>Desk',
    year: '2025',
    title: 'Smart Emotion Care Desk',
    desc1: 'Detects emotion from facial expressions, voice input and text sentiment in real time.',
    desc2: 'A Flask REST API turns the detected mood into personalized wellness recommendations, therapeutic soundscapes and mental health tracking.',
    stack: ['Python', 'Flask', 'OpenCV', 'NLP', 'Scikit-learn'],
    liveUrl: 'https://our-minor-project.vercel.app/',
    liveLabel: 'Visit live site',
    codeUrl: 'https://github.com/basava1084',
    mockupAddress: 'emotioncare.desk',
    image: 'assets/projects/smart-emotion-care-desk.jpg',
    features: [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
        name: 'Multimodal Mood',
        desc: 'Facial & Voice Detection'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5v14M7 9v6M22 11v2M2 11v2"/></svg>',
        name: 'Acoustic Waveform',
        desc: 'Sentiment Analysis'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
        name: 'Personalized Care',
        desc: 'Adaptive Interventions'
      }
    ],
    floatingCard: `
      <div class="f-card-header">
        <div class="f-card-title"><span class="sparkle-icon" style="color:#2C6E6D">●</span> Live Biometrics</div>
        <div class="f-card-close" aria-hidden="true">&times;</div>
      </div>
      <div class="f-chat-bubble" style="background:#EBF3F0; color:#1E3D34;"><b>Status:</b> Calm & Focused (94% Conf.)</div>
      <div class="f-mini-products">
        <div class="f-mini-prod-item">
          <span>Stress Index</span>
          <b style="color:#2C6E6D">Low (12%)</b>
        </div>
        <div class="f-mini-prod-item">
          <span>Vocal Pitch</span>
          <b style="color:#2C6E6D">Relaxed</b>
        </div>
      </div>
      <div class="f-chat-bubble user" style="background:#EBF3F0; color:#1E3D34;">Recommendation: 5m Breathing</div>
      <div class="f-chat-input-bar">
        <span>Acoustic sensor live</span>
        <div class="f-mic-btn" style="background:#2C6E6D">✓</div>
      </div>
    `
  },
  {
    id: 'skillswap',
    num: '03',
    railName: 'SkillSwap',
    year: '2025',
    title: 'SkillSwap',
    desc1: 'A peer-learning platform that connects people by the skills they share and want.',
    desc2: 'Built with Firebase Authentication, Firestore real-time data, and peer-to-peer messaging so users can barter knowledge without monetary barriers.',
    stack: ['React.js', 'Firebase', 'Firestore', 'Tailwind CSS', 'JavaScript'],
    liveUrl: 'https://skillswap-two-bay.vercel.app/',
    liveLabel: 'Visit live site',
    codeUrl: 'https://github.com/basava1084',
    mockupAddress: 'skillswap.network',
    image: 'assets/projects/skillswap.jpg',
    features: [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
        name: 'Peer Matching',
        desc: 'Skill Barter Exchange'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
        name: 'Real-time Chat',
        desc: 'Instant Swap Proposals'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        name: 'Verified Profiles',
        desc: 'Ratings & Swap History'
      }
    ],
    floatingCard: `
      <div class="f-card-header">
        <div class="f-card-title"><span class="sparkle-icon" style="color:#4F46E5">✦</span> Swap Proposal</div>
        <div class="f-card-close" aria-hidden="true">&times;</div>
      </div>
      <div class="f-chat-bubble" style="background:#EEF2FF; color:#1E1B4B;"><b>Alex Chen:</b> 4.9 ★ (34 Swaps)</div>
      <div class="f-mini-products">
        <div class="f-mini-prod-item">
          <span>Teaching</span>
          <b style="color:#4F46E5">React Architecture</b>
        </div>
        <div class="f-mini-prod-item">
          <span>Learning</span>
          <b style="color:#E86C43">UI/UX Systems</b>
        </div>
      </div>
      <div class="f-chat-bubble user" style="background:#EEF2FF; color:#1E1B4B;">Session Confirmed: Today 6 PM</div>
      <div class="f-chat-input-bar">
        <span>Active Swap Agreement</span>
        <div class="f-mic-btn" style="background:#4F46E5">⇄</div>
      </div>
    `
  },
  {
    id: 'code-mining-tool',
    num: '04',
    railName: 'Code<br>Mining',
    year: '2025',
    title: 'Code Mining Tool',
    desc1: 'A Java static analysis tool that parses source code ASTs to identify design patterns and potential anti-patterns.',
    desc2: 'Generates structured reports and automated code-quality metrics that support comprehensive code reviews and architectural hygiene.',
    stack: ['Java', 'Static Analysis', 'AST Parser', 'Design Patterns'],
    liveUrl: 'https://github.com/basava1084/codemining.git',
    liveLabel: 'View on GitHub',
    codeUrl: 'https://github.com/basava1084/codemining.git',
    mockupAddress: 'codemining.studio',
    image: 'assets/projects/code-mining-tool.jpg',
    features: [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        name: 'AST Pattern Engine',
        desc: 'Deep Java Code Parser'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
        name: 'Anti-Pattern Checks',
        desc: 'Automated Code Smells'
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        name: 'Quality Metrics',
        desc: 'Audit & Analysis Reports'
      }
    ],
    floatingCard: `
      <div class="f-card-header">
        <div class="f-card-title"><span class="sparkle-icon" style="color:#10B981">✓</span> AST Diagnostic</div>
        <div class="f-card-close" aria-hidden="true">&times;</div>
      </div>
      <div class="f-chat-bubble" style="background:#F0FDF4; color:#064E3B;"><b>Inspection:</b> Verified Thread-Safe</div>
      <div class="f-mini-products">
        <div class="f-mini-prod-item">
          <span>Quality Score</span>
          <b style="color:#10B981">98 / 100</b>
        </div>
        <div class="f-mini-prod-item">
          <span>Patterns Found</span>
          <b style="color:#10B981">Singleton, Factory</b>
        </div>
      </div>
      <div class="f-chat-bubble user" style="background:#F0FDF4; color:#064E3B;">Report exported: PDF & JSON</div>
      <div class="f-chat-input-bar">
        <span>AST Parser Engine v2.4</span>
        <div class="f-mic-btn" style="background:#10B981">⚙</div>
      </div>
    `
  }
];

(function initProjectsSection(){
  var card = $('projectCard');
  var rail = $('projectNavRail');
  var prevBtn = $('pPrevBtn');
  var nextBtn = $('pNextBtn');
  var counterEl = $('pCounter');
  var progressBar = $('pProgressBar');
  if(!card || !rail) return;

  var currentIdx = 0;
  var isAnimating = false;

  // Build rail cards
  rail.innerHTML = PROJECTS_DATA.map(function(p, i){
    return '<button class="rail-card' + (i === 0 ? ' active' : '') + '" type="button" role="tab" data-idx="' + i + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' +
      '<div class="rail-head"><span class="rail-num">' + p.num + '</span><span class="rail-dot" aria-hidden="true"></span></div>' +
      '<span class="rail-name">' + p.railName + '</span>' +
    '</button>';
  }).join('');

  var railCards = rail.querySelectorAll('.rail-card');

  function renderProject(idx){
    if(isAnimating) return;
    currentIdx = idx;
    var data = PROJECTS_DATA[idx];
    if(!data) return;

    isAnimating = true;
    card.classList.add('p-animating');

    setTimeout(function(){
      // Update Left Info
      var yEl = $('pYear');
      var tEl = $('pTitle');
      var d1El = $('pDesc1');
      var d2El = $('pDesc2');
      var sEl = $('pStack');
      var lEl = $('pLiveBtn');
      var cEl = $('pCodeBtn');
      var fEl = $('pFeatures');

      if(yEl) yEl.textContent = data.year;
      if(tEl) tEl.textContent = data.title;
      if(d1El) d1El.textContent = data.desc1;
      if(d2El) d2El.textContent = data.desc2;

      if(sEl){
        sEl.innerHTML = data.stack.map(function(s){
          return '<span class="p-badge">' + s + '</span>';
        }).join('');
      }

      if(lEl){
        lEl.href = data.liveUrl;
        var span = lEl.querySelector('span');
        if(span) span.textContent = data.liveLabel;
      }

      if(cEl){
        cEl.href = data.codeUrl;
      }

      if(fEl){
        fEl.innerHTML = data.features.map(function(f){
          return '<div class="p-feat-item">' +
            '<div class="p-feat-icon">' + f.icon + '</div>' +
            '<div class="p-feat-meta">' +
              '<strong>' + f.name + '</strong>' +
              '<span>' + f.desc + '</span>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      // Update Right Visual Stage
      var mAddr = $('pMockupAddress');
      var mImg = $('pMainImg');
      var fCard = $('pFloatingCard');

      if(mAddr) mAddr.textContent = data.mockupAddress;
      if(mImg){
        mImg.src = data.image;
        mImg.alt = data.title + ' Preview';
      }
      if(fCard) fCard.innerHTML = data.floatingCard;

      // Update Controls
      if(counterEl) counterEl.textContent = data.num + ' / 0' + PROJECTS_DATA.length;

      if(progressBar){
        progressBar.setAttribute('aria-valuenow', idx + 1);
        var segs = progressBar.querySelectorAll('.p-progress-segment');
        segs.forEach(function(seg, si){
          seg.classList.toggle('active', si === idx);
        });
      }

      // Update Rail
      railCards.forEach(function(rc, ri){
        var isActive = ri === idx;
        rc.classList.toggle('active', isActive);
        rc.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      card.classList.remove('p-animating');
      isAnimating = false;
    }, 180);
  }

  // Bind rail click
  railCards.forEach(function(rc, i){
    rc.addEventListener('click', function(){
      if(i !== currentIdx) renderProject(i);
    });
  });

  // Bind Prev / Next
  if(prevBtn){
    prevBtn.addEventListener('click', function(){
      var prev = (currentIdx - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length;
      renderProject(prev);
    });
  }

  if(nextBtn){
    nextBtn.addEventListener('click', function(){
      var next = (currentIdx + 1) % PROJECTS_DATA.length;
      renderProject(next);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e){
    var rect = card.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.2){
      if(e.key === 'ArrowRight'){
        var next = (currentIdx + 1) % PROJECTS_DATA.length;
        renderProject(next);
      } else if(e.key === 'ArrowLeft'){
        var prev = (currentIdx - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length;
        renderProject(prev);
      }
    }
  });

  // Initial render
  renderProject(0);
})();
/* ============================================================
   ALWAYS LEARNING SECTION ENGINE (3-COLUMN REDESIGN)
   ============================================================ */
var CERTIFICATIONS_DATA = [
  {
    id: 'ai-foundations',
    title: 'Foundations of AI',
    issuer: 'Microsoft & AICTE · 2025',
    year: '2025',
    verified: 'Verified Credential',
    details: 'Comprehensive foundational training covering Artificial Intelligence principles, Machine Learning lifecycles, neural network architectures, and ethical AI deployment under Microsoft & AICTE curriculum.',
    icon: '<svg viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>'
  },
  {
    id: 'python-programming',
    title: 'Python Programming',
    issuer: 'VaultofCodes · 2025',
    year: '2025',
    verified: 'Verified Certificate',
    details: 'Mastery in core Python, OOP concepts, functional programming, data analysis libraries (Pandas, NumPy), and backend scripting with clean code practices.',
    icon: '<svg viewBox="0 0 24 24"><path fill="#387EB8" d="M11.9 2c-4.4 0-4.1 1.9-4.1 1.9l.01 2h4.2v.6H3.2s-2.8.3-2.8 4.1c0 3.8 2.5 3.9 2.5 3.9h1.5v-2.1s-.1-2.5 2.5-2.5h4.2s2.4 0 2.4-2.3V4.3s.4-2.3-4.3-2.3zm-2.3 1.3a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5z"/><path fill="#FFE052" d="M12.1 22c4.4 0 4.1-1.9 4.1-1.9l-.01-2h-4.2v-.6h8.7s2.8-.3 2.8-4.1c0-3.8-2.5-3.9-2.5-3.9h-1.5v2.1s.1 2.5-2.5 2.5h-4.2s-2.4 0-2.4 2.3v3.3s-.4 2.3 4.3 2.3zm2.3-1.3a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5z"/></svg>'
  },
  {
    id: 'networking',
    title: 'Computer Networking',
    issuer: 'Google · Coursera',
    year: '2024',
    verified: 'Verified Certificate',
    details: 'In-depth coverage of the TCP/IP stack, DNS, subnetting, network security, packet routing protocols, and cloud network architecture authorized by Google.',
    icon: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.7 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.2C3.3 21.3 7.4 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.1c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1V6.7H1.3C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l4-3.2z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.4 0 3.3 2.7 1.3 6.7l4 3.2c.9-2.9 3.6-5.1 6.7-5.1z"/></svg>'
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    issuer: 'Core CS Certification',
    year: '2024',
    verified: 'Hands-on Mastery',
    details: 'Advanced problem-solving across linear and non-linear data structures, asymptotic analysis (Big-O), dynamic programming, graph traversals, and greedy algorithms.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#191E40" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  }
];

(function initLearningSection(){
  var list = $('certsList');
  var modal = $('certModal');
  var modalClose = $('certModalClose');
  var viewAllBtn = $('viewAllCertsBtn');
  if(!list) return;

  var activeCertIndex = 0;

  function renderCertCards(){
    list.innerHTML = CERTIFICATIONS_DATA.map(function(c, i){
      var isActive = i === activeCertIndex;
      return '<button class="cert-card' + (isActive ? ' active' : '') + '" type="button" role="tab" data-idx="' + i + '" aria-selected="' + (isActive ? 'true' : 'false') + '">' +
        '<div class="cert-card-left">' +
          '<div class="cert-logo-box" aria-hidden="true">' + c.icon + '</div>' +
          '<div class="cert-meta">' +
            '<h3 class="cert-title">' + c.title + '</h3>' +
            '<span class="cert-issuer">' + c.issuer + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="cert-arrow-circle" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '</div>' +
      '</button>';
    }).join('');

    var cards = list.querySelectorAll('.cert-card');
    cards.forEach(function(card, idx){
      card.addEventListener('click', function(){
        activeCertIndex = idx;
        cards.forEach(function(c, ci){
          var on = ci === idx;
          c.classList.toggle('active', on);
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        openModal(idx);
      });
    });
  }

  function openModal(idx){
    var c = CERTIFICATIONS_DATA[idx];
    if(!c || !modal) return;
    var t = $('modalTitle');
    var s = $('modalSub');
    var b = $('modalBadge');
    var d = $('modalDetails');
    var isEl = $('modalIssuer');
    var yEl = $('modalYear');
    var stEl = $('modalStatus');

    if(t) t.textContent = c.title;
    if(s) s.textContent = c.issuer;
    if(b) b.textContent = c.verified;
    if(d) d.textContent = c.details;
    if(isEl) isEl.textContent = c.issuer.split(' · ')[0];
    if(yEl) yEl.textContent = c.year;
    if(stEl) stEl.textContent = c.verified;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  if(viewAllBtn){
    viewAllBtn.addEventListener('click', function(){
      openModal(activeCertIndex);
    });
  }

  if(modalClose){
    modalClose.addEventListener('click', function(e){
      e.stopPropagation();
      closeModal();
    });
  }

  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal && modal.classList.contains('open')){
      closeModal();
    }
  });

  renderCertCards();
})();
/* journey - Cinematic Dark-Academia Showcase */
(function(){
  var journeyData = [
    {
      tabLabel: 'B.Sc.',
      period: '2020 – 2023',
      title: 'B.Sc. Computer Science',
      institution: 'Government First Grade College, Davanagere',
      grade: 'CGPA 7.26',
      badgeType: 'grad',
      bullets: [
        {
          icon: 'code',
          text: 'Built a solid foundation in programming, data structures and computer science fundamentals.'
        },
        {
          icon: 'layers',
          text: 'Studied mathematics, statistics, computer hardware, operating systems and networking.'
        }
      ],
      startYear: '2020',
      endYear: '2023'
    },
    {
      tabLabel: 'MCA',
      period: '2024 – 2026',
      title: 'Master of Computer Applications',
      institution: 'REVA University, Bengaluru',
      grade: 'CGPA 9.05',
      badgeType: 'grad',
      bullets: [
        {
          icon: 'laptop',
          text: 'Full-stack web development, AI/ML and LLM-powered applications.'
        },
        {
          icon: 'lightbulb',
          text: 'Built AI_NUTRA-FOOD, Smart Emotion Care Desk, SkillSwap and Code Mining Tool.'
        }
      ],
      startYear: '2024',
      endYear: '2026'
    },
    {
      tabLabel: 'Internship',
      period: 'Dec 2025 – Jun 2026',
      title: 'Full-Stack Developer Intern',
      institution: 'Dev Creations and Solutions, Bengaluru',
      grade: 'Internship',
      badgeType: 'work',
      bullets: [
        {
          icon: 'laptop',
          text: 'Developed responsive web interfaces with reusable React.js components.'
        },
        {
          icon: 'api',
          text: 'Integrated REST APIs with frontend components and tested interfaces across devices.'
        }
      ],
      startYear: '2025',
      endYear: '2026'
    }
  ];

  var badgeIcons = {
    grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>',
    work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  };

  var bulletIcons = {
    laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.7 3.5 5.8.5.3.8.8.8 1.4v.8h5.4v-.8c0-.6.3-1.1.8-1.4 2-1.1 3.5-3.3 3.5-5.8a7 7 0 0 0-7-7z"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="15" r="1.5"/><path d="M9 15l6-6"/></svg>'
  };

  var tabBtns = document.querySelectorAll('#jTabs .j-tab');
  var badgeIconEl = document.getElementById('jBadgeIcon');
  var cardPeriodEl = document.getElementById('jCardPeriod');
  var cardTitleEl = document.getElementById('jCardTitle');
  var cardSubEl = document.getElementById('jCardSub');
  var cardBulletsEl = document.getElementById('jCardBullets');
  var yearStartEl = document.getElementById('jYearStart');
  var yearEndEl = document.getElementById('jYearEnd');
  var glassCard = document.getElementById('jGlassCard');

  if(!tabBtns.length || !glassCard) return;

  function renderJourneyItem(idx, animate){
    var item = journeyData[idx];
    if(!item) return;

    tabBtns.forEach(function(btn, k){
      var isActive = k === idx;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if(animate){
      glassCard.classList.add('fading');
      if(yearStartEl) yearStartEl.classList.add('fading');
      if(yearEndEl) yearEndEl.classList.add('fading');
    }

    setTimeout(function(){
      if(badgeIconEl) badgeIconEl.innerHTML = badgeIcons[item.badgeType] || badgeIcons.grad;
      if(cardPeriodEl) cardPeriodEl.textContent = item.period;
      if(cardTitleEl) cardTitleEl.textContent = item.title;
      if(cardSubEl) cardSubEl.textContent = item.institution + ' · ' + item.grade;
      
      if(cardBulletsEl){
        cardBulletsEl.innerHTML = item.bullets.map(function(b){
          var iconHtml = bulletIcons[b.icon] || bulletIcons.code;
          return '<div class="j-bullet-row">' +
                   '<div class="j-bullet-icon">' + iconHtml + '</div>' +
                   '<div class="j-bullet-text">' + b.text + '</div>' +
                 '</div>';
        }).join('');
      }

      if(yearStartEl) yearStartEl.textContent = item.startYear;
      if(yearEndEl) yearEndEl.textContent = item.endYear;

      if(animate){
        glassCard.classList.remove('fading');
        if(yearStartEl) yearStartEl.classList.remove('fading');
        if(yearEndEl) yearEndEl.classList.remove('fading');
      }
    }, animate ? 140 : 0);
  }

  tabBtns.forEach(function(btn, idx){
    btn.addEventListener('click', function(){
      renderJourneyItem(idx, true);
    });
  });

  // Default to MCA (index 1)
  renderJourneyItem(1, false);
})();

/* ============================================================
   NEW INTERACTIVE PARTICLE LANDING PORTAL
   ============================================================ */
(function(){
  var portal = document.getElementById('introPortal');
  if(!portal) return;

  var cv = document.getElementById('lpCanvas');
  if(!cv) return;
  var g = cv.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, N, P = [], T = [], cur = 0, mode = 'text', timer;
  var words = [['BASAVARAJ'], ['FULL STACK', 'DEVELOPER'], ['AI DEVELOPER']];
  var mouse = { x: -999, y: -999 };
  var glow = document.getElementById('lpGlow');
  var ticks = document.querySelectorAll('#lpTicks button');
  var FONT = '800 200px "Bricolage Grotesque",system-ui,sans-serif';
  var PS = [[0, 14, 26, 47], [.45, 40, 88, 200], [.6, 40, 88, 200], [.78, 184, 112, 16], [1, 184, 112, 16]], pal = [];
  for(var k = 0; k < 64; k++){
    var t = k / 63, j = 0;
    while(j < PS.length - 2 && t > PS[j + 1][0]) j++;
    var a = PS[j], b = PS[j + 1], uu = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
    pal.push('rgb(' + [1, 2, 3].map(function(n){ return Math.round(a[n] + (b[n] - a[n]) * uu); }).join(',') + ')');
  }

  function shuffle(a){
    for(var i = a.length - 1; i > 0; i--){
      var j = Math.random() * (i + 1) | 0, temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  var tCh = 0, U = [], animFrameId;
  function build(){
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    N = W < 700 ? 2800 : 6800;
    var off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    var o = off.getContext('2d');
    U = [];
    T = words.map(function(lines){
      o.clearRect(0, 0, W, H);
      o.font = FONT;
      var mw = Math.max.apply(null, lines.map(function(l){ return o.measureText(l).width; }));
      var fs = Math.min(200 * (W * .88) / mw, H * (lines.length > 1 ? .22 : .34));
      o.font = FONT.replace('200px', fs + 'px');
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillStyle = '#fff';
      var lh = fs * 1.02, y0 = H * .46 - (lines.length - 1) * lh / 2;
      lines.forEach(function(l, i){ o.fillText(l, W / 2, y0 + i * lh); });
      var d = o.getImageData(0, 0, W, H).data, s = [];
      for(var y = 0; y < H; y += 2)
        for(var x = 0; x < W; x += 2)
          if(d[(y * W + x) * 4 + 3] > 128) s.push([x, y]);
      var u = document.createElement('canvas');
      u.width = W;
      u.height = H;
      var ug = u.getContext('2d'), gr = ug.createLinearGradient(0, 0, W, 0);
      PS.forEach(function(p){ gr.addColorStop(p[0], 'rgb(' + p[1] + ',' + p[2] + ',' + p[3] + ')'); });
      ug.drawImage(off, 0, 0);
      ug.globalCompositeOperation = 'source-in';
      ug.fillStyle = gr;
      ug.fillRect(0, 0, W, H);
      U.push(u);
      return shuffle(s).slice(0, N);
    });
    if(!P.length)
      for(var i = 0; i < N; i++)
        P.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s: Math.random() });
  }

  function frame(t){
    g.clearRect(0, 0, W, H);
    var ua = Math.min(1, (t - tCh) / 900) * .14;
    if(mode === 'text' && U[cur] && ua > 0){
      g.globalAlpha = ua;
      g.drawImage(U[cur], 0, 0, W, H);
    }
    g.globalAlpha = .96;
    var tg = T[cur], L = tg ? tg.length : 1, R = 140, near = [], cx = W / 2, cy = H / 2;
    for(var i = 0; i < P.length; i++){
      var p = P[i], q = tg ? tg[i % L] : [cx, cy], ax = 0, ay = 0;
      if(mode === 'text'){
        ax = (q[0] - p.x) * .04 + Math.sin(t / 900 + i) * .05;
        ay = (q[1] - p.y) * .04 + Math.cos(t / 800 + i) * .05;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if(d2 < R * R){
          var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5;
          ax += dx / d * f;
          ay += dy / d * f;
          if(near.length < 80) near.push(p);
        }
      } else {
        ax = (cx - p.x) * .09;
        ay = (cy - p.y) * .09;
      }
      p.vx = (p.vx + ax) * .86;
      p.vy = (p.vy + ay) * .86;
      p.x += p.vx;
      p.y += p.vy;
      g.fillStyle = pal[Math.max(0, Math.min(63, (p.x / W * 63) | 0))];
      var r = 2 + p.s * 1.6;
      g.fillRect(p.x, p.y, r, r);
    }
    g.globalAlpha = 1;
    g.lineWidth = .8;
    for(var a = 0; a < near.length; a++){
      for(var b = a + 1; b < near.length; b++){
        var ex = near[a].x - near[b].x, ey = near[a].y - near[b].y, dd = ex * ex + ey * ey;
        if(dd < 3600){
          g.strokeStyle = 'rgba(184,112,16,' + (1 - dd / 3600) * .85 + ')';
          g.beginPath();
          g.moveTo(near[a].x, near[a].y);
          g.lineTo(near[b].x, near[b].y);
          g.stroke();
        }
      }
    }
    if(!portal.classList.contains('entered')){
      animFrameId = requestAnimationFrame(frame);
    }
  }

  function go(n){
    cur = n;
    tCh = performance.now();
    ticks.forEach(function(b, i){ b.classList.toggle('a', i === n); });
    P.forEach(function(p){
      p.vx += (Math.random() - .5) * 9;
      p.vy += (Math.random() - .5) * 9;
    });
    clearInterval(timer);
    if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      timer = setInterval(function(){ go((cur + 1) % 3); }, 4800);
    }
  }

  ticks.forEach(function(b, i){
    b.addEventListener('click', function(){ go(i); });
  });

  portal.addEventListener('pointermove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if(glow){
      glow.style.opacity = 1;
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }
  });

  portal.addEventListener('pointerleave', function(){
    mouse.x = mouse.y = -999;
    if(glow) glow.style.opacity = 0;
  });

  cv.addEventListener('pointerdown', function(e){
    P.forEach(function(p){
      var dx = p.x - e.clientX, dy = p.y - e.clientY;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var f = Math.max(0, 1 - d / 400) * 38;
      p.vx += dx / d * f;
      p.vy += dy / d * f;
    });
  });

  window.addEventListener('resize', function(){
    if(!portal.classList.contains('entered')) build();
  });

  var wt = document.getElementById('lpWt');
  if(wt){
    'Welcome'.split('').forEach(function(ch, i){
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      wt.appendChild(s);
    });
  }

  var entered = false;
  function enterPortfolio(){
    if(entered) return;
    entered = true;
    mode = 'warp';
    var welcome = document.getElementById('lpWelcome');
    if(welcome) welcome.classList.add('go');

    stopAudio();

    setTimeout(function(){
      portal.classList.add('entered');
      document.body.classList.add('ld');
      clearInterval(timer);
      cancelAnimationFrame(animFrameId);
      setTimeout(function(){
        portal.style.display = 'none';
      }, 800);
    }, 4500);
  }

  function skipToPortfolio(){
    if(entered) return;
    entered = true;
    stopAudio();
    clearInterval(timer);
    cancelAnimationFrame(animFrameId);
    portal.classList.add('entered');
    portal.style.display = 'none';
    document.body.classList.add('ld');
  }

  var enterBtn = document.getElementById('lpEnter');
  if(enterBtn) enterBtn.addEventListener('click', enterPortfolio);

  var skipBtn = document.getElementById('lpSkip');
  if(skipBtn) skipBtn.addEventListener('click', skipToPortfolio);

  var replayBtn = document.getElementById('logoIntroBtn');
  if(replayBtn){
    replayBtn.addEventListener('click', function(e){
      e.preventDefault();
      portal.style.display = 'flex';
      portal.offsetHeight;
      portal.classList.remove('entered');
      var welcome = document.getElementById('lpWelcome');
      if(welcome) welcome.classList.remove('go');
      entered = false;
      mode = 'text';
      build();
      go(0);
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(frame);
    });
  }

  // Veezha Veera BGM Audio Integration
  var audio = document.getElementById('lpAudioTrack');
  var audioBtn = document.getElementById('lpAudio');
  var al = document.getElementById('lpAl');
  var SOFT_VOL = 0.22, fadeTimer = null;

  function fadeAudioIn(){
    if(!audio) return;
    clearInterval(fadeTimer);
    audio.volume = 0.02;
    var p = audio.play();
    if(p !== undefined){
      p.then(function(){
        if(audioBtn) audioBtn.classList.add('on');
        if(al) al.textContent = 'Veezha Veera BGM ♫';
        fadeTimer = setInterval(function(){
          if(audio.volume < SOFT_VOL - 0.025){
            audio.volume = Math.min(SOFT_VOL, audio.volume + 0.025);
          } else {
            audio.volume = SOFT_VOL;
            clearInterval(fadeTimer);
          }
        }, 45);
      }).catch(function(err){
        console.warn('Playback prevented:', err);
      });
    }
  }

  function fadeAudioOut(callback){
    if(!audio) return;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(function(){
      if(audio.volume > 0.035){
        audio.volume = Math.max(0, audio.volume - 0.035);
      } else {
        audio.volume = 0;
        clearInterval(fadeTimer);
        audio.pause();
        if(audioBtn) audioBtn.classList.remove('on');
        if(al) al.textContent = 'Audio: Off';
        if(callback) callback();
      }
    }, 40);
  }

  function stopAudio(){
    fadeAudioOut();
  }

  if(audioBtn){
    audioBtn.addEventListener('click', function(e){
      e.stopPropagation();
      if(!audio) return;
      if(audio.paused){
        fadeAudioIn();
      } else {
        fadeAudioOut();
      }
    });
  }

  window.addEventListener('keydown', function(e){
    if(!portal.classList.contains('entered')){
      if(e.key === 'Enter'){
        e.preventDefault();
        enterPortfolio();
      } else if(e.key === 'Escape'){
        e.preventDefault();
        skipToPortfolio();
      }
    }
  });

  var started = false;
  function start(){
    if(started) return;
    started = true;
    build();
    go(0);
    animFrameId = requestAnimationFrame(frame);
  }

  if(document.fonts && document.fonts.load){
    Promise.race([document.fonts.load(FONT), new Promise(function(r){ setTimeout(r, 1500); })]).then(start);
  } else {
    start();
  }
})();

/* ============================================================
   PREMIUM MICRO-INTERACTIONS & MOTION UPGRADES
   ============================================================ */
(function initMicroInteractions(){
  if(rm || !window.matchMedia('(pointer: fine)').matches) return;

  // 1. Magnetic Pointer Pull on Primary Action Buttons
  var magBtns = document.querySelectorAll('.btn, .stack-explore-btn, .c-nav-circle-btn');
  magBtns.forEach(function(btn){
    btn.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
      var y = (e.clientY - (r.top + r.height / 2)) * 0.18;
      x = Math.max(-6, Math.min(6, x));
      y = Math.max(-6, Math.min(6, y));
      btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    btn.addEventListener('pointerleave', function(){
      btn.style.transform = '';
    });
  });

  // 2. 3D Perspective Tilt on Project Preview Frame
  var previewStage = document.querySelector('.project-preview-stage');
  var browserFrame = document.querySelector('.browser-mockup-frame');
  if(previewStage && browserFrame){
    previewStage.addEventListener('pointermove', function(e){
      var r = previewStage.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      var rotX = -y * 3.2;
      var rotY = x * 3.2;
      browserFrame.style.transform = 'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-4px)';
    });
    previewStage.addEventListener('pointerleave', function(){
      browserFrame.style.transform = '';
    });
  }

  // 3. (3D Tilt on Developer ID Badge Card is handled seamlessly by unified elastic lanyard physics)
})();
})();
