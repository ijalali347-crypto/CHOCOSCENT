(()=>{
const inventory={perfume:{name:'Night De Paris Motion, 100 ml',price:350},chocolate:{name:'Dubai Chocolate Bar',price:45}};
for(const p of window.CHOCOSCENT_PRODUCTS||[])inventory[p.id]={name:p.name+' · '+p.volume,price:Number.isFinite(p.price)?p.price:350,testPrice:!Number.isFinite(p.price),image:p.image};
function normalizeBag(value){const bag={};if(!value||typeof value!=='object')return bag;for(const [id,qty]of Object.entries(value))if(Object.hasOwn(inventory,id)&&Number.isInteger(qty)&&qty>0)bag[id]=Math.min(qty,99);return bag}
function summary(bag){const lines=Object.entries(normalizeBag(bag)).map(([id,quantity])=>({id,...inventory[id],quantity,lineTotal:inventory[id].price*quantity}));return{lines,count:lines.reduce((n,p)=>n+p.quantity,0),total:lines.reduce((n,p)=>n+p.lineTotal,0)}}
function customer(value){value=value||{};const result={};for(const key of ['name','phone','email','country','city','address'])result[key]=String(value[key]||'').trim();if(Object.values(result).some(v=>!v))throw Error('Please complete every delivery field.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))throw Error('Enter a valid email address.');if(result.phone.replace(/\D/g,'').length<7)throw Error('Enter a valid mobile number, including country code.');return result}
function order(bag,details){const purchase=summary(bag);if(!purchase.count)throw Error('Your cart is empty.');return{...purchase,customer:customer(details),currency:'AED',mode:'test',status:'awaiting-test-payment'}}
window.ChocoCheckoutCore={inventory,normalizeBag,summary,customer,order};
})();