
const tilt=document.getElementById('tilt'),cap=document.getElementById('cap'),stage=document.getElementById('stage'),notes=document.getElementById('notes'),hint=document.getElementById('hint');
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const rgb=c=>`rgb(${c})`;
function R(t){
  if(t<.1)return 46+26*Math.sin(t/.1*Math.PI/2);
  if(t<.55)return 72+2*Math.sin((t-.1)/.45*Math.PI);
  if(t<.86)return 72-32*Math.pow((t-.55)/.31,1.6);
  return 40-14*Math.sin((t-.86)/.14*Math.PI/2);
}
function col(t){
  const bl=[34,110,255],md=[10,28,110],bk=[4,5,12];
  return t<.45?mix(bl,md,t/.45):mix(md,bk,Math.min(1,(t-.45)/.25));
}
function disc(parent,r,h,bg){
  const d=document.createElement('div');d.className='d';
  d.style.cssText=`width:${2*r}px;height:${2*r}px;left:${-r}px;top:${-r}px;background:${bg};transform:rotateX(90deg) translateZ(${h}px)`;
  parent.appendChild(d);
}
const H=200,N=68;
for(let i=0;i<N;i++){
  const t=i/(N-1);let r=R(t),c=col(t);
  if(t>.865&&t<.9){r+=3;c=[200,210,232];}
  disc(tilt,r,t*H,`radial-gradient(circle at 36% 30%,${rgb(mix(c,[255,255,255],.4))} 0,${rgb(c)} 45%,${rgb(mix(c,[0,0,0],.55))} 100%)`);
}
// keep body discs behind the spinning label and the cap
tilt.insertBefore(tilt.lastElementChild,null);
for(let i=0;i<9;i++){
  const t=i/8,r=34+26*Math.pow(1-Math.pow(2*t-1,6),.5);
  disc(cap,r,i*2.6,'radial-gradient(circle at 35% 30%,#6f8de0 0,#10142a 28%,#02030a 100%)');
}
const cols=['#4d8dff','#8db4ff','#dfe8ff','#2b4fd8','#ffffff','#a9c0ff'];
const flower=c=>`<svg viewBox="-25 -25 50 50" width="100%" height="100%">${[0,60,120,180,240,300].map(a=>`<ellipse cx="0" cy="-11" rx="6" ry="12" fill="${c}" opacity=".92" transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#cfd8ee"/></svg>`;

const motionTarget=document.getElementById('bottleMotion');
let animeWaapi=null,motionBusy=false;
import('https://cdn.jsdelivr.net/npm/animejs@4.0.0/+esm')
  .then(module=>{animeWaapi=module.waapi;initProductMotion(module.animate)}).catch(()=>{});
function animateBottle(){
  if(motionBusy||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  motionBusy=true;
  const travel=Math.max(0,Math.min(96,stage.getBoundingClientRect().width/2-155));
  const start='translateX(0px) scale(1) skew(0deg) rotate(0turn)';
  const finish=`translateX(${travel}px) scale(1.25) skew(-45deg) rotate(1turn)`;
  const unlock=()=>{motionBusy=false};
  try{
    if(animeWaapi){
      animeWaapi.animate(motionTarget,{
        transform:[start,finish],duration:1400,ease:'inOut(3)',
        alternate:true,loop:1,onComplete:unlock
      });
    }else{
      const animation=motionTarget.animate([{transform:start},{transform:finish}],{
        duration:1400,easing:'cubic-bezier(.65,0,.35,1)',
        iterations:2,direction:'alternate'
      });
      animation.onfinish=unlock;animation.oncancel=unlock;
    }
  }catch{unlock()}
}

let opened=false;
function burst(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  for(let i=0;i<22;i++){
    const f=document.createElement('div');
    f.style.cssText='position:absolute;left:50%;bottom:330px;width:50px;height:50px;margin-left:-25px;pointer-events:none;z-index:5';
    f.innerHTML=flower(cols[i%cols.length]);stage.appendChild(f);
    const dx=(Math.random()-.5)*Math.min(innerWidth*.7,420),up=120+Math.random()*220,s=.5+Math.random()*.9,r=(Math.random()-.5)*720;
    f.animate([
      {transform:'translate(0,40px) scale(0) rotate(0)',opacity:0},
      {transform:`translate(${dx*.4}px,${-up}px) scale(${s}) rotate(${r*.5}deg)`,opacity:1,offset:.45},
      {transform:`translate(${dx}px,${-up+260+Math.random()*120}px) scale(${s*.8}) rotate(${r}deg)`,opacity:0}
    ],{duration:(reduce?1400:2600)+Math.random()*1600,delay:i*70,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).onfinish=()=>f.remove();
  }
}
stage.addEventListener('click',()=>{
  if(!opened){opened=true;stage.classList.add('open');notes.classList.add('on');hint.textContent='Tap again to replay';}
  animateBottle();
  burst();
});

const catalog={perfume:{name:'Night De Paris Motion, 100 ml',price:350},chocolate:{name:'Dubai Chocolate Bar',price:45}};
let bagState={};try{const saved=JSON.parse(localStorage.getItem('chocoscent-bag')||'{}');for(const id of Object.keys(catalog)){if(Number.isInteger(saved[id])&&saved[id]>0)bagState[id]=Math.min(saved[id],99)}}catch{}
const cart=document.getElementById('cart'),items=document.getElementById('cartItems');let toastTimer;
function renderBag(){let count=0,total=0;items.replaceChildren();for(const [id,qty]of Object.entries(bagState)){const p=catalog[id];count+=qty;total+=qty*p.price;const row=document.createElement('div');row.className='cart-row';row.innerHTML=`<h3>${p.name}</h3><p>AED ${p.price} each · AED ${p.price*qty}</p><div class="quantity"><button data-id="${id}" data-action="minus" aria-label="Decrease ${p.name} quantity">−</button><span>${qty}</span><button data-id="${id}" data-action="plus" aria-label="Increase ${p.name} quantity" ${qty>=99?'disabled':''}>+</button><button class="remove" data-id="${id}" data-action="remove">Remove</button></div>`;items.append(row)}if(!count){const p=document.createElement('p');p.textContent='Your bag is waiting for a little indulgence.';items.append(p)}document.getElementById('count').textContent=count;document.getElementById('bag').setAttribute('aria-label',`Open shopping bag, ${count} items`);document.getElementById('subtotal').textContent=`AED ${total}`;try{localStorage.setItem('chocoscent-bag',JSON.stringify(bagState))}catch{}}
document.querySelectorAll('.add').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.product;bagState[id]=Math.min((bagState[id]||0)+1,99);renderBag();const toast=document.getElementById('toast');toast.textContent=`${catalog[id].name} added to your bag`;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}));
items.addEventListener('click',event=>{const b=event.target.closest('button[data-action]');if(!b)return;const id=b.dataset.id;if(b.dataset.action==='remove')delete bagState[id];else{bagState[id]=Math.min(99,bagState[id]+(b.dataset.action==='plus'?1:-1));if(bagState[id]<=0)delete bagState[id]}renderBag();const replacement=items.querySelector(`button[data-id="${id}"][data-action="${b.dataset.action}"]`);(replacement||document.getElementById('closeCart')).focus()});
document.getElementById('bag').addEventListener('click',()=>{cart.showModal();document.body.style.overflow='hidden'});
function closeBag(){cart.close()}
document.getElementById('closeCart').addEventListener('click',closeBag);document.getElementById('continueShopping').addEventListener('click',closeBag);cart.addEventListener('close',()=>{document.body.style.overflow='';document.getElementById('bag').focus()});cart.addEventListener('click',event=>{if(event.target===cart){const r=cart.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeBag()}});renderBag();


/* SVG product motion: distortion and six-point polygon morphing. */
const productMotionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let productAnimate=null,productMotionId=0;
const productMotionEntries=new Map();
function syncProductMotion(){
  for(const entry of productMotionEntries.values()){
    const running=entry.visible&&!document.hidden&&!productMotionQuery.matches;
    for(const animation of entry.animations)running?animation.resume():animation.pause();
    if(productMotionQuery.matches){
      for(const animation of entry.animations)animation.reset();
      entry.displacement.setAttribute('scale','0');
    }
  }
}
const productMotionObserver=new IntersectionObserver(entries=>{
  for(const observed of entries){
    const entry=productMotionEntries.get(observed.target);
    if(entry)entry.visible=observed.isIntersecting;
  }
  syncProductMotion();
},{threshold:.15});
function decorateProductMotion(){
  for(const [element,entry]of productMotionEntries){
    if(!element.isConnected){
      entry.animations.forEach(animation=>animation.cancel());
      productMotionObserver.unobserve(element);
      productMotionEntries.delete(element);
    }
  }
  document.querySelectorAll('.art, .fragrance-visual').forEach(visual=>{
    if(productMotionEntries.has(visual))return;
    const id='product-wave-'+(++productMotionId);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('product-motion-svg');
    svg.setAttribute('viewBox','0 0 128 128');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.innerHTML=`<defs><filter id="${id}" x="-35%" y="-35%" width="170%" height="170%"><feTurbulence type="fractalNoise" numOctaves="2" baseFrequency="0.008" seed="3" result="turbulence"/><feDisplacementMap in="SourceGraphic" in2="turbulence" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs><polygon points="64 116 18 90 18 38 64 12 110 38 110 90" fill="none" stroke="currentColor" stroke-width="0.7" filter="url(#${id})"/>`;
    visual.prepend(svg);visual.classList.add('has-product-motion');
    const entry={visible:false,animations:[],svg,displacement:svg.querySelector('feDisplacementMap')};
    productMotionEntries.set(visual,entry);productMotionObserver.observe(visual);
    if(productAnimate)startProductMotion(entry);
  });
}
function startProductMotion(entry){
  if(entry.animations.length)return;
  const common={duration:3200,alternate:true,loop:true,ease:'inOut(2)',autoplay:false};
  entry.animations=[
    productAnimate(entry.svg.querySelector('feTurbulence'),{...common,baseFrequency:[.008,.05]}),
    productAnimate(entry.displacement,{...common,scale:[0,15]}),
    productAnimate(entry.svg.querySelector('polygon'),{...common,duration:4600,points:'64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100'})
  ];
}
function initProductMotion(animate){
  productAnimate=animate;
  for(const entry of productMotionEntries.values())startProductMotion(entry);
  syncProductMotion();
}
decorateProductMotion();
const productGrid=document.querySelector('main');
if(productGrid)new MutationObserver(decorateProductMotion).observe(productGrid,{childList:true,subtree:true});
document.addEventListener('visibilitychange',syncProductMotion);
productMotionQuery.addEventListener('change',syncProductMotion);
