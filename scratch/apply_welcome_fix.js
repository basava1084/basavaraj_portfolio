const fs = require('fs');

function updateLandingFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace portrait img object-position
  content = content.replace(
    '.portrait img{width:100%;height:100%;object-fit:cover;object-position:50% 10%}',
    '.portrait img{width:100%;height:100%;object-fit:cover;object-position:72% 20%}'
  );

  // Replace welcome block
  const oldWelcomeCss = `/* full-screen welcome */
.welcome{position:fixed;inset:0;z-index:30;overflow:hidden;background:var(--navy);pointer-events:none;clip-path:circle(0% at 50% 92%);transition:clip-path .9s cubic-bezier(.7,0,.2,1)}
.welcome.go{clip-path:circle(150% at 50% 92%);pointer-events:auto}
.wbg{position:absolute;inset:-8%;background-size:cover;background-position:center;filter:blur(38px) brightness(.62) saturate(1.15)}
.wimg{position:absolute;top:0;bottom:0;right:0;height:100%;width:auto;max-width:none;opacity:0;transform-origin:68% 28%;
-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 30%);mask-image:linear-gradient(90deg,transparent 0,#000 30%)}
.go .wimg{animation:settle 2.8s .25s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes settle{0%{opacity:0;transform:scale(1.16)}22%{opacity:1}100%{opacity:1;transform:scale(1)}}
.wshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,26,47,.94) 0,rgba(14,26,47,.55) 36%,transparent 64%),linear-gradient(0deg,rgba(14,26,47,.7),transparent 42%)}
.wsweep{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(242,196,109,.45) 50%,transparent 65%);transform:translateX(-110%)}
.go .wsweep{animation:sweep 1.3s .55s ease-in-out forwards}
@keyframes sweep{to{transform:translateX(110%)}}
.wtext{position:absolute;left:clamp(24px,7vw,120px);bottom:clamp(56px,13vh,140px);color:#fff;max-width:92vw}
.wt{font-weight:800;font-size:clamp(54px,11vw,176px);letter-spacing:-.045em;line-height:.95;display:flex;overflow:hidden;padding-bottom:.1em}
.wt span{display:inline-block;transform:translateY(115%);opacity:0}
.go .wt span{animation:up .75s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(.8s + var(--i)*.06s)}
@keyframes up{to{transform:none;opacity:1}}
.wn{margin-top:12px;font-family:var(--serif);font-style:italic;font-size:clamp(26px,4vw,52px);color:var(--goldl);opacity:0;transform:translateY(14px)}
.wr{margin-top:6px;font-size:clamp(15px,1.5vw,19px);color:rgba(255,255,255,.82);opacity:0}
.go .wn{animation:in .7s 1.35s forwards}.go .wr{animation:in .7s 1.55s forwards}
@keyframes in{to{opacity:1;transform:none}}
.wbar{margin-top:28px;width:min(70vw,300px);height:3px;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden;opacity:0}
.wbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--goldl))}
.go .wbar{animation:in .3s 1.3s forwards}
.go .wbar i{animation:fill 1.5s 1.3s linear forwards}
@keyframes fill{to{width:100%}}`;

  const newWelcomeCss = `/* full-screen welcome */
.welcome{position:fixed;inset:0;z-index:30;overflow:hidden;background:var(--navy);pointer-events:none;clip-path:circle(0% at 50% 92%);transition:clip-path .9s cubic-bezier(.7,0,.2,1)}
.welcome.go{clip-path:circle(150% at 50% 92%);pointer-events:auto}
.wbg{position:absolute;inset:0;background-size:cover;background-position:right center;filter:blur(24px) brightness(.55);opacity:.6}
.wimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;opacity:0;transform-origin:75% 35%}
.go .wimg{animation:settle 2.8s .25s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes settle{0%{opacity:0;transform:scale(1.12)}22%{opacity:1}100%{opacity:1;transform:scale(1)}}
.wshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,26,47,.96) 0%,rgba(14,26,47,.85) 30%,rgba(14,26,47,.4) 52%,transparent 72%),linear-gradient(0deg,rgba(14,26,47,.6) 0%,transparent 35%);pointer-events:none}
.wsweep{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(242,196,109,.4) 50%,transparent 65%);transform:translateX(-110%)}
.go .wsweep{animation:sweep 1.3s .55s ease-in-out forwards}
@keyframes sweep{to{transform:translateX(110%)}}
.wtext{position:absolute;left:clamp(32px,8vw,120px);bottom:clamp(52px,16vh,160px);color:#fff;max-width:min(580px,50vw);z-index:2}
.wt{font-weight:800;font-size:clamp(54px,10.5vw,165px);letter-spacing:-.045em;line-height:.95;display:flex;overflow:hidden;padding-bottom:.1em}
.wt span{display:inline-block;transform:translateY(115%);opacity:0}
.go .wt span{animation:up .75s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(.8s + var(--i)*.06s)}
@keyframes up{to{transform:none;opacity:1}}
.wn{margin-top:14px;font-family:var(--serif);font-style:italic;font-size:clamp(28px,4.2vw,54px);color:var(--goldl);opacity:0;transform:translateY(14px);line-height:1.2}
.wr{margin-top:8px;font-size:clamp(15px,1.5vw,19px);color:rgba(255,255,255,.88);opacity:0;line-height:1.4}
.go .wn{animation:in .7s 1.35s forwards}.go .wr{animation:in .7s 1.55s forwards}
@keyframes in{to{opacity:1;transform:none}}
.wbar{margin-top:22px;width:min(70vw,280px);height:3px;border-radius:3px;background:rgba(212,144,42,.3);overflow:hidden;opacity:0}
.wbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--goldl))}
.go .wbar{animation:in .3s 1.3s forwards}
.go .wbar i{animation:fill 1.5s 1.3s linear forwards}
@keyframes fill{to{width:100%}}`;

  content = content.replace(oldWelcomeCss, newWelcomeCss);

  // Media query max-width:860px replacements
  content = content.replace(
    '.wimg{left:0;width:100%;object-fit:cover;object-position:50% 14%;-webkit-mask-image:none;mask-image:none}\n  .wshade{background:linear-gradient(0deg,rgba(14,26,47,.95) 0,rgba(14,26,47,.55) 38%,transparent 66%)}\n  .wtext{bottom:max(7vh,36px)}',
    '.wimg{inset:0;width:100%;height:100%;object-fit:cover;object-position:72% 14%}\n  .wshade{background:linear-gradient(0deg,rgba(14,26,47,.96) 0%,rgba(14,26,47,.6) 42%,transparent 72%)}\n  .wtext{bottom:max(7vh,36px);left:24px;max-width:92vw}'
  );

  // Landscape media query replacements
  content = content.replace(
    '.wimg{left:auto;right:0;width:auto;height:100%;object-fit:cover;object-position:center}\n  .wshade{background:linear-gradient(90deg,rgba(14,26,47,.95) 0,rgba(14,26,47,.55) 45%,transparent 70%)}\n  .wtext{bottom:20px;left:clamp(20px,5vw,60px)}',
    '.wimg{inset:0;width:100%;height:100%;object-fit:cover;object-position:right center}\n  .wshade{background:linear-gradient(90deg,rgba(14,26,47,.95) 0%,rgba(14,26,47,.65) 45%,transparent 75%)}\n  .wtext{bottom:20px;left:clamp(20px,5vw,60px);max-width:50vw}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated', filePath);
}

updateLandingFile('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/index.html');
updateLandingFile('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/landing.html');

