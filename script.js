const stage=document.getElementById('bloomStage'),flower=document.getElementById('flower'),product=document.getElementById('product'),bottle=document.getElementById('bottle'),wrap=document.getElementById('bottleWrap');
function bloom(){stage.classList.add('bloomed');setTimeout(()=>product.scrollIntoView({behavior:'smooth',block:'center'}),650)}
flower.addEventListener('click',bloom);flower.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')bloom()});
document.getElementById('heroFlower').addEventListener('click',()=>{document.getElementById('perfume').scrollIntoView({behavior:'smooth'});setTimeout(bloom,650)});
document.getElementById('openPerfume').addEventListener('click',()=>{document.getElementById('perfume').scrollIntoView({behavior:'smooth'});setTimeout(bloom,650)});
let dragging=false,lastX=0,rotation=0,auto=0;
function paint(){bottle.style.transform='rotateY('+(rotation+auto)+'deg) rotateX(-2deg)'}
wrap.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;wrap.setPointerCapture(e.pointerId)});
wrap.addEventListener('pointermove',e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*.8;lastX=e.clientX;paint()});
wrap.addEventListener('pointerup',()=>dragging=false);wrap.addEventListener('pointercancel',()=>dragging=false);
setInterval(()=>{if(!dragging&&stage.classList.contains('bloomed')){auto=(auto+.35)%360;paint()}},30);
document.querySelector('.product-info .gold').addEventListener('click',()=>{const n=document.querySelector('.bag span');n.textContent=Number(n.textContent)+1});