const fs = require('fs');

function updateLanding(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the @media(max-width:860px) block
  const mediaStart = content.indexOf('@media(max-width:860px){');
  if (mediaStart === -1) {
    console.error('Could not find @media(max-width:860px) in', filePath);
    return;
  }

  // Find where this block ends (before @media (max-height: 500px))
  const mediaEnd = content.indexOf('@media (max-height: 500px)', mediaStart);
  if (mediaEnd === -1) {
    console.error('Could not find next media query in', filePath);
    return;
  }

  const newMobileTabBlock = `@media (max-width: 900px), (max-width: 1024px) and (orientation: portrait){
  html,body{overflow:hidden !important;height:100% !important;height:100dvh !important;max-height:100dvh !important}
  .stage{height:100% !important;height:100dvh !important;max-height:100dvh !important;overflow:hidden !important;display:flex;flex-direction:column}
  
  /* Compact fixed header */
  header{position:relative;left:0;right:0;top:0;padding:max(10px,env(safe-area-inset-top,0px)) 16px 4px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
  .brand{gap:10px}
  .logo{width:38px;height:38px}
  .brand b{font-size:15px}
  .actions .pill{padding:7px 14px;font-size:13px}
  .skip{display:none}

  /* Zero side & straight scrolling - properly fit to viewport */
  .hero{position:relative;inset:auto;flex:1;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;padding:2px 14px max(8px,env(safe-area-inset-bottom,0px));overflow:hidden !important;gap:0;width:100%;max-width:100vw;box-sizing:border-box}
  
  /* Wheel on top - perfectly proportioned */
  .wcol{order:-1;padding:0;display:grid;place-items:center;flex-shrink:0}
  .wheelwrap{--S:min(48vw,23vh,205px);--ns:max(44px,calc(var(--S)*.17));width:var(--S);height:var(--S);aspect-ratio:1}
  .node em{font-size:11px}

  /* Content section below wheel */
  .hero>section:not(.wcol){display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;max-width:min(460px,92vw);margin:0 auto;flex-shrink:1}
  .hi{font-size:clamp(14px,3.2vw,17px);margin:0;line-height:1.1}
  h1{font-size:clamp(24px,6.2vw,36px);margin:1px 0 2px;line-height:1;padding-bottom:0;letter-spacing:-.03em}
  .role{font-size:clamp(12px,2.9vw,14px);margin-bottom:6px;line-height:1.2}
  
  /* Glass card fitted */
  .card{width:100%;max-width:100%;padding:8px 14px;min-height:0;border-radius:16px;box-shadow:0 10px 30px rgba(14,26,47,.08)}
  .card .no{font-size:11px;margin-bottom:1px}
  .card h2{font-size:clamp(16px,4vw,20px);margin:1px 0;line-height:1.15}
  .card p{font-size:clamp(11.5px,2.7vw,13px);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0}
  .tags{margin-top:4px;gap:4px;justify-content:center}
  .tags span{font-size:10.5px;padding:2px 7px}

  /* Align Enter portfolio and hint text in the middle (mid) */
  .cta{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;margin-top:8px;gap:6px}
  .enter{margin:0 auto;display:inline-flex;align-items:center;justify-content:center;padding:11px 30px;font-size:15px;box-shadow:0 8px 25px rgba(14,26,47,.28)}
  .hint{text-align:center;margin:0 auto;display:block;width:100%;font-size:12px}

  /* Fixed mobile welcome overlay image fit */
  .wbg{position:absolute;inset:0;background-size:cover;background-position:72% 10%;filter:blur(24px) brightness(.55);opacity:.6}
  .wimg{position:absolute;top:0;left:0;right:0;width:100%;height:58%;height:58dvh;object-fit:cover;object-position:72% 8%;-webkit-mask-image:linear-gradient(180deg,#000 60%,transparent 100%);mask-image:linear-gradient(180deg,#000 60%,transparent 100%);opacity:0}
  .wshade{position:absolute;inset:0;background:linear-gradient(0deg,#0e1a2f 0%,#0e1a2f 40%,rgba(14,26,47,.85) 58%,transparent 78%);pointer-events:none}
  .wtext{position:absolute;left:20px;right:20px;bottom:max(4vh,22px);max-width:calc(100% - 40px);z-index:2;text-align:left}
  .wt{font-size:clamp(38px,11vw,56px);line-height:.95;padding-bottom:.05em}
  .wn{font-size:clamp(22px,5.8vw,30px);margin-top:6px;color:var(--goldl);line-height:1.2}
  .wr{font-size:clamp(12.5px,3.4vw,15px);margin-top:5px;color:rgba(255,255,255,.88);line-height:1.35}
  .wbar{margin-top:14px;width:min(72vw,220px);height:3px}
}

`;

  const updatedContent = content.substring(0, mediaStart) + newMobileTabBlock + content.substring(mediaEnd);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully updated', filePath);
}

updateLanding('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/index.html');
updateLanding('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/landing.html');

