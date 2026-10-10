(()=>{
const core=window.ChocoCheckoutCore,cart=document.getElementById('cart'),items=document.getElementById('cartItems'),buy=document.getElementById('buyNow'),bagView=document.getElementById('bagView'),flow=document.getElementById('checkoutFlow');
let bag={},draft={},pending=null,toastTimer;
try{bag=core.normalizeBag(JSON.parse(localStorage.getItem('chocoscent-bag')||'{}'))}catch{}
try{draft=JSON.parse(sessionStorage.getItem('chocoscent-delivery')||'{}')||{}}catch{}
function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e}
function notify(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function saveBag(){try{localStorage.setItem('chocoscent-bag',JSON.stringify(bag))}catch{}}
function renderBag(){
const s=core.summary(bag);items.replaceChildren();
for(const p of s.lines){const row=element('div',null,'cart-row');row.append(element('h3',p.name),element('p',(p.testPrice?'Test price · ':'')+'AED '+p.price+' each · AED '+p.lineTotal));
const controls=element('div',null,'quantity');for(const [action,label]of [['minus','−'],['plus','+'],['remove','Remove']]){const button=element('button',label);button.type='button';button.dataset.id=p.id;button.dataset.action=action;button.setAttribute('aria-label',action+' '+p.name);if(action==='plus'&&p.quantity>=99)button.disabled=true;if(action==='remove')button.className='remove';controls.append(button);if(action==='minus')controls.append(element('span',String(p.quantity)))}row.append(controls);items.append(row)}
if(!s.count)items.append(element('p','Your bag is waiting for a little indulgence.'));
document.getElementById('count').textContent=s.count;document.getElementById('subtotal').textContent='AED '+s.total;document.getElementById('bag').setAttribute('aria-label','Open shopping bag, '+s.count+' items');buy.hidden=!s.count;saveBag();
}
function add(id){if(!Object.hasOwn(core.inventory,id))return;bag[id]=Math.min((bag[id]||0)+1,99);renderBag();notify(core.inventory[id].name+' added to cart')}
window.ChocoCart={add};
document.querySelectorAll('.add').forEach(b=>b.addEventListener('click',()=>add(b.dataset.product)));
items.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b||!bag[b.dataset.id])return;const id=b.dataset.id;if(b.dataset.action==='remove')delete bag[id];else{bag[id]+=b.dataset.action==='plus'?1:-1;if(bag[id]<=0)delete bag[id]}renderBag();(items.querySelector('button[data-id="'+id+'"][data-action="'+b.dataset.action+'"]')||document.getElementById('closeCart')).focus()});
function showBag(){bagView.hidden=false;flow.hidden=true;pending=null;document.getElementById('cartHeading').textContent='Your bag'}
function openBag(){showBag();cart.showModal();document.body.style.overflow='hidden'}
document.getElementById('bag').addEventListener('click',openBag);
document.getElementById('closeCart').addEventListener('click',()=>cart.close());
document.getElementById('continueShopping').addEventListener('click',()=>cart.close());
cart.addEventListener('close',()=>{document.body.style.overflow='';document.getElementById('bag').focus()});
cart.addEventListener('click',e=>{if(e.target===cart){const r=cart.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cart.close()}});
function prepare(title){bagView.hidden=true;flow.hidden=false;flow.replaceChildren();document.getElementById('cartHeading').textContent=title;flow.append(element('p','TEST CHECKOUT · No money will be charged','checkout-test-label'))}
function back(label,handler){const b=element('button',label,'checkout-back');b.type='button';b.addEventListener('click',handler);flow.append(b)}
function delivery(){
if(!core.summary(bag).count){showBag();return}
prepare('Delivery details');back('← Back to cart',showBag);
const form=element('form',null,'delivery-form');form.innerHTML='<label>Full name<input name="name" autocomplete="name" required maxlength="100"></label><label>Mobile number<input name="phone" type="tel" autocomplete="tel" placeholder="+971…" required maxlength="30"></label><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="150"></label><div class="checkout-fields"><label>Country<input name="country" autocomplete="country-name" required maxlength="80"></label><label>City / location<input name="city" autocomplete="address-level2" required maxlength="100"></label></div><label>Street address, building and apartment<textarea name="address" autocomplete="street-address" required maxlength="500" rows="3"></textarea></label><p class="checkout-note">Your details are saved in this browser tab for this test. This order is not sent to the store.</p><p class="checkout-error" role="alert"></p><button class="btn" type="submit">Save & continue to payment</button>';
for(const input of form.querySelectorAll('input,textarea'))input.value=draft[input.name]||'';
form.addEventListener('submit',e=>{e.preventDefault();try{draft=core.customer(Object.fromEntries(new FormData(form)));pending=core.order(bag,draft);try{sessionStorage.setItem('chocoscent-delivery',JSON.stringify(draft))}catch{}payment()}catch(error){form.querySelector('.checkout-error').textContent=error.message}});
flow.append(form);form.querySelector('input').focus();
}
function purchaseSummary(purchase){const box=element('div',null,'checkout-summary');for(const p of purchase.lines)box.append(element('p',p.quantity+' × '+p.name+' — AED '+p.lineTotal));box.append(element('strong','Total: AED '+purchase.total));return box}
function payment(){
if(!pending){delivery();return}
prepare('Test payment');back('← Edit delivery details',delivery);flow.append(purchaseSummary(pending));
const address=element('div',null,'checkout-address');address.append(element('h3','Deliver to'),element('p',draft.name),element('p',draft.address),element('p',draft.city+', '+draft.country),element('p',draft.phone),element('p',draft.email));flow.append(address);
flow.append(element('p','Test prices only. This simulates a successful payment; no card or bank details are needed.','checkout-note'));
const pay=element('button','Complete test payment','btn');pay.type='button';pay.addEventListener('click',()=>{if(!pending)return;const completed={...pending,id:'TEST-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),createdAt:new Date().toISOString(),status:'test-payment-completed'};pending=null;bag={};renderBag();try{sessionStorage.setItem('chocoscent-last-test-order',JSON.stringify(completed))}catch{}prepare('Test order complete');flow.append(element('p','✓ Test payment completed','checkout-success'),element('p','Order '+completed.id),purchaseSummary(completed),element('p','No money was charged. This test order is saved in this browser tab and has not been sent to the store.','checkout-note'));const finish=element('button','Continue shopping','btn');finish.addEventListener('click',()=>cart.close());flow.append(finish);finish.focus()});flow.append(pay);pay.focus();
}
buy.addEventListener('click',delivery);renderBag();
})();