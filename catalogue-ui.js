(()=>{
const products=window.CHOCOSCENT_PRODUCTS||[],shop=document.getElementById('shop');if(!shop||!products.length)return;
const section=document.createElement('section');section.id='fragrance-catalogue';section.className='catalogue-section';
section.innerHTML='<div class="catalogue-heading"><p class="eyebrow">L’ORIENTALE FRAGRANCES</p><h2>Find your signature scent.</h2><p>Explore all 57 fragrances across 10 collections. Discover their character, ingredients, and original product photography.</p></div><div class="catalogue-controls"><input id="fragrance-search" type="search" placeholder="Search a fragrance or note…" aria-label="Search fragrances and notes"><select id="fragrance-filter" aria-label="Filter fragrance collection"><option value="">All collections</option></select><select id="scent-filter" aria-label="Filter scent family"><option value="">All scent families</option></select></div><p id="catalogue-count" class="catalogue-count" role="status" aria-live="polite"></p><div id="fragrance-grid" class="fragrance-grid"></div><p class="catalogue-footnote">Prices and availability on request.</p>';
shop.after(section);
const filter=section.querySelector('#fragrance-filter'),family=section.querySelector('#scent-filter'),search=section.querySelector('#fragrance-search'),grid=section.querySelector('#fragrance-grid'),counter=section.querySelector('#catalogue-count');
function option(select,name,label=name){const o=document.createElement('option');o.value=name;o.textContent=label;select.append(o)}
for(const name of new Set(products.map(p=>p.collection)))option(filter,name,name+' ('+products.filter(p=>p.collection===name).length+')');
for(const name of [...new Set(products.map(p=>p.family).filter(Boolean))].sort())option(family,name);
const dialog=document.createElement('dialog');dialog.className='fragrance-dialog';dialog.setAttribute('aria-labelledby','fragrance-title');dialog.innerHTML='<div class="cart-head"><p class="eyebrow">DISCOVER YOUR FRAGRANCE</p><button class="fragrance-close" aria-label="Close fragrance details">✕</button></div><div class="fragrance-detail-content"></div>';document.body.append(dialog);
let returnFocus=null;const close=dialog.querySelector('.fragrance-close');close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus()});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
function node(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e}
function picture(p,lazy=true){const img=node('img');img.src=p.image;img.alt=p.name+' perfume bottle, '+p.collection+' collection';img.loading=lazy?'lazy':'eager';img.decoding='async';img.width=400;img.height=400;return img}
function catPresentation(p){
  const scene=node('div',null,'cat-perfume-scene');
  const body=picture(p,false);body.className='cat-bottle-body';
  const cap=picture(p,false);cap.alt='';cap.setAttribute('aria-hidden','true');cap.className='cat-bottle-cap';
  const cat=node('div',null,'perfume-cat articulated-cat');cat.setAttribute('aria-hidden','true');
  cat.append(node('span',null,'cat-photo-body'),node('span',null,'cat-photo-lift-paw'),node('span',null,'cat-photo-press-paw'));
  const nozzle=node('span',null,'cat-spray-nozzle');nozzle.setAttribute('aria-hidden','true');
  const mist=node('span',null,'cat-perfume-mist');mist.setAttribute('aria-hidden','true');
  for(let i=0;i<16;i++){const drop=node('i');drop.style.setProperty('--angle',(i/15*42-21)+'deg');drop.style.setProperty('--delay',(i%4*.045)+'s');mist.append(drop)}
  scene.append(body,cap,nozzle,mist,cat);
  function alignCap(){
    try{
      const canvas=document.createElement('canvas');canvas.width=body.naturalWidth;canvas.height=body.naturalHeight;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(body,0,0);
      const w=canvas.width,h=canvas.height,data=ctx.getImageData(0,0,w,h).data,rows=[];
      for(let y=0;y<h;y++){let left=w,right=0,count=0;for(let x=Math.floor(w*.25);x<w*.75;x++){const k=(y*w+x)*4;if(data[k]*.2126+data[k+1]*.7152+data[k+2]*.0722<170){left=Math.min(left,x);right=Math.max(right,x);count++}}rows.push({left,right,width:count>3?right-left+1:0})}
      const first=rows.findIndex(r=>r.width>5);if(first<0)return;
      let peak=first;for(let y=first;y<Math.min(h,first+h*.08);y++)if(rows[y].width>rows[peak].width)peak=y;
      let split=peak+Math.round(h*.045);
      for(let y=peak+3;y<Math.min(h,first+h*.18);y++)if(rows[y].width>3&&rows[y].width<rows[peak].width*.52){split=y;break}
      split=Math.max(first+6,Math.min(split,h*.55));
      scene.style.setProperty('--cap-line',(split/h*100)+'%');
      scene.style.setProperty('--grip-x',((rows[peak].left+rows[peak].right)/2/w*100)+'%');
      scene.style.setProperty('--grip-y',(peak/h*100)+'%');
      scene.style.setProperty('--cap-left',Math.max(0,(rows[peak].left-3)/w*100)+'%');
      scene.style.setProperty('--cap-right',Math.max(0,(w-rows[peak].right-4)/w*100)+'%');
    }catch{}
  }
  if(body.complete&&body.naturalWidth)alignCap();else body.addEventListener('load',alignCap,{once:true});
  return scene;
}
const catFrames=new Map();
function stopCat(scene){
  cancelAnimationFrame(catFrames.get(scene));catFrames.delete(scene);
  scene.classList.remove('cat-playing','cat-cap-off','cat-pressing','cat-misting');scene.style.setProperty('--cat-opacity','0');
}
dialog.addEventListener('close',()=>{for(const scene of catFrames.keys())stopCat(scene)});
function playCat(scene){
  stopCat(scene);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  scene.classList.add('cat-playing');
  const started=performance.now();
  const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
  function frame(now){
    if(!dialog.open||!scene.isConnected){stopCat(scene);return}
    const t=now-started;
    const lift=smooth((t-1100)/1200)*(1-smooth((t-4100)/1200));
    const angle=lift*50*Math.PI/180,scale=.5;
    // The cap follows the upper paw's exact pivot arc.
    const dx=scale*(-.26*Math.cos(angle)+.24*Math.sin(angle)+.26);
    const dy=scale*(-.26*Math.sin(angle)-.24*Math.cos(angle)+.24);
    const press=smooth((t-2700)/280)*(1-smooth((t-3400)/350));
    scene.style.setProperty('--paw-angle',(lift*50)+'deg');
    scene.style.setProperty('--cap-dx',(dx*scene.clientWidth)+'px');
    scene.style.setProperty('--cap-dy',(dy*scene.clientWidth)+'px');
    scene.style.setProperty('--cap-angle',(lift*8)+'deg');
    scene.style.setProperty('--press-angle',(-press*12)+'deg');
    scene.style.setProperty('--cat-opacity',String(smooth(t/700)*(1-smooth((t-5700)/800))));
    scene.classList.toggle('cat-cap-off',lift>.01);
    scene.classList.toggle('cat-pressing',press>.4);
    scene.classList.toggle('cat-misting',t>3000&&t<3550);
    if(t<6600)catFrames.set(scene,requestAnimationFrame(frame));else stopCat(scene);
  }
  catFrames.set(scene,requestAnimationFrame(frame));
}
function showProduct(p,button){returnFocus=button;const content=dialog.querySelector('.fragrance-detail-content');content.replaceChildren();const imageArea=node('div',null,'fragrance-detail-image');const scene=catPresentation(p);const replay=node('button','Replay cat & spray','cat-replay');replay.type='button';replay.addEventListener('click',()=>playCat(scene));imageArea.append(scene,replay);const info=node('div',null,'fragrance-detail-info');const title=node('h2',p.name);title.id='fragrance-title';info.append(node('p',p.collection+' collection','eyebrow'),title,node('p',p.volume+' · '+p.concentration,'fragrance-spec'),node('p',p.description,'fragrance-description'));
const list=node('dl',null,'fragrance-notes');for(const [label,value]of [['Scent family',p.family],['Top notes',p.topNotes],['Heart notes',p.heartNotes],['Base notes',p.baseNotes],['Accords',p.accords]])if(value){list.append(node('dt',label),node('dd',value))}info.append(list,node('p','Prices and availability on request.','fragrance-availability'));content.append(imageArea,info);dialog.showModal();document.body.style.overflow='hidden';close.focus();requestAnimationFrame(()=>playCat(scene))}
function render(){const term=search.value.trim().toLocaleLowerCase();const matching=products.filter(p=>(!filter.value||p.collection===filter.value)&&(!family.value||p.family===family.value)&&(!term||[p.name,p.collection,p.family,p.topNotes,p.heartNotes,p.baseNotes].join(' ').toLocaleLowerCase().includes(term)));counter.textContent=matching.length+' of '+products.length+' fragrances';grid.replaceChildren();const fragment=document.createDocumentFragment();for(const p of matching){const card=node('article',null,'fragrance-card');const visual=node('button',null,'fragrance-visual');visual.type='button';visual.setAttribute('aria-label','View '+p.name+' fragrance details');visual.append(picture(p));visual.addEventListener('click',()=>showProduct(p,visual));const info=node('div',null,'fragrance-info');const details=node('button','View fragrance ↗','fragrance-details-button');details.type='button';details.addEventListener('click',()=>showProduct(p,details));info.append(node('small',p.collection+' collection'),node('h3',p.name),node('p',p.volume+' · '+p.concentration),node('p',p.family,'fragrance-family'),details);card.append(visual,info);fragment.append(card)}if(!matching.length){const empty=node('div',null,'catalogue-empty');empty.append(node('h3','No fragrances found'),node('p','Try another name, note, or collection.'));const reset=node('button','Clear filters','btn');reset.addEventListener('click',()=>{search.value='';filter.value='';family.value='';render();search.focus()});empty.append(reset);fragment.append(empty)}grid.append(fragment)}
filter.addEventListener('change',render);family.addEventListener('change',render);search.addEventListener('input',render);render();
})();

