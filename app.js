const data = window.beers || [];
const $ = id => document.getElementById(id);
const fields = ['type','producer','country'];
for (const field of fields) [...new Set(data.map(b => b[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'is')).forEach(value => $(field).add(new Option(value,value)));
let ascending = true;
function render(){
  const query = $('search').value.trim().toLocaleLowerCase('is');
  const places = [...document.querySelectorAll('.place:checked')].map(x=>x.value);
  const active = data.filter(b => (!query || [b.name,b.producer,b.description].join(' ').toLocaleLowerCase('is').includes(query)) && fields.every(f => !$(f).value || b[f] === $(f).value) && places.every(place => b.availability?.[place]));
  const sort = $('sort').value;
  active.sort((a,b) => { let x = sort === 'abv' ? parseFloat(a.abv.replace(',','.')) : a[sort]; let y = sort === 'abv' ? parseFloat(b.abv.replace(',','.')) : b[sort]; return (typeof x === 'number' ? x-y : String(x).localeCompare(String(y),'is')) * (ascending?1:-1); });
  $('count').textContent = `${active.length} af ${data.length} vörum`; const list=$('cards'),tpl=$('card-template'); list.replaceChildren(...active.map(b=>{const n=tpl.content.cloneNode(true); const q=s=>n.querySelector(s);q('.image-link').href=b.source;q('img').src=b.image;q('img').alt=b.name;q('.country').textContent=b.country;q('.abv').textContent=b.abv+'%';q('h2').textContent=b.name;q('.producer').textContent=b.producer;q('.type').textContent=[b.category,b.type].filter(Boolean).join(' — ');q('.description').textContent=b.description;q('.stores').innerHTML=Object.entries(b.availability||{}).map(([place,ok])=>`<span class="${ok?'store-ok':'store-no'}">${ok?'●':'○'} ${place}</span>`).join(' · ');q('.price').textContent=new Intl.NumberFormat('is-IS').format(b.price)+' kr.';q('.source').href=b.source;return n;}));
}
['search','type','producer','country','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));document.querySelectorAll('.place').forEach(x=>x.addEventListener('change',render));$('direction').onclick=()=>{ascending=!ascending;$('direction').textContent=ascending?'↑':'↓';render()};render();
