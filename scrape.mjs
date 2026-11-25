import { writeFile } from 'node:fs/promises';

const ids = `30871 62422 28415 25945 29805 26483 63165 26685 21984 29793 63040 31752 13791 09452 63161 26504 30643 23597 17489 29813 26263 31667 20716 07499 09483 31037 30620 28790 25399 25402 03590 31413 26170 31696 27285 24442 29804 63039 29988 32121 30110 30874 26238 62421 31386 21286 27682 28796 22875 05479 31954 31794 26259 31697 27736 29035 22080 14801 25398 03587 28823 30723 20821 27724 29802 31690 10793 27520 24479 32122 17471 29809 63115 22261 20095 27714 22027 29787 27709 30229 63168 27284 25808`.split(' ');

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const find = (html, pattern) => decode((html.match(pattern) || [,''])[1]);

async function load(id) {
  const url = `https://www.vinbudin.is/desktopdefault.aspx/tabid-54/?productid=${id}/`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  const html = await res.text();
  return {
    id,
    name: find(html, /<h3[^>]*>([\s\S]*?)<\/h3>/),
    price: Number(find(html, /id="ctl00_ctl01_Label_ProductPrice"[^>]*>([\s\S]*?)<\/span>/).replace(/\./g, '')),
    abv: find(html, /id="ctl00_ctl01_Label_ProductAlchoholVolume"[^>]*>([\s\S]*?)<\/span>/),
    country: find(html, /id="ctl00_ctl01_Label_ProductCountryOfOrigin"[^>]*>([\s\S]*?)<\/span>/),
    producer: find(html, /id="ctl00_ctl01_Label_Producer"[^>]*>([\s\S]*?)<\/span>/),
    description: find(html, /class="hidden entire-text">\s*<p>([\s\S]*?)<\/p>/),
    category: find(html, /<span class="category">([\s\S]*?)<\/span>/),
    type: [...html.matchAll(/<span class="text(?: taste2)?">([\s\S]*?)<\/span>/g)].map(m => decode(m[1]).replace(/^-\s*/, '')).join(' — '),
    availability: { Akranes: html.includes('>Akranesi<'), Keflavík: html.includes('>Reykjanesbæ<'), Selfoss: html.includes('>Selfossi<'), Vestmannaeyjar: html.includes('>Vestmannaeyjum<') },
    image: `https://www.vinbudin.is/Portaldata/1/Resources/vorumyndir/medium/${id}_r.jpg`,
    source: url
  };
}

const out = [];
for (let i = 0; i < ids.length; i += 8) out.push(...await Promise.all(ids.slice(i, i + 8).map(load)));
await writeFile('data.js', `window.beers = ${JSON.stringify(out, null, 2)};\n`);
console.log(`Wrote ${out.length} products`);
