/* LS_VT – közös logika: fejléc, lábléc, kosár, termék modal, pénztár */
const SHOP = { email: "info@ls-vt.hu", phone: "+36 20 314 5919" };
/* Rendeléskezelés (Supabase). Ha az url üres, a rendelés e-mailben megy (tartalék mód).
   A publishable kulcs nyilvános: a rendelés csak a place_order() függvényen át írható, olvasni nem lehet. */
const BACKEND = { url: "", key: "" };
const SOCIAL = [
  ["Facebook", "https://www.facebook.com/lsvtcoachingmanagement", '<path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.2V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/>'],
  ["Instagram", "https://www.instagram.com/ls_vt_powerteam/", '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3"/>'],
  ["TikTok", "https://www.tiktok.com/@ls_vt_powerteam", '<path d="M16.5 3c.4 2.3 1.9 3.8 4.3 4v3.2c-1.6 0-3-.4-4.3-1.2v6.3c0 3.5-2.6 5.7-5.6 5.7-3.2 0-5.4-2.5-5.4-5.4 0-3.3 2.9-5.8 6.4-5.3v3.3c-1.6-.4-3.1.6-3.1 2.1 0 1.2 1 2.2 2.2 2.2 1.4 0 2.3-1 2.3-2.6V3z"/>']
];
const socialHTML = () => `<div class="social">${SOCIAL.map(([n, u, d]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="LS_VT Powerteam – ${n}" title="${n}"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">${d}</svg></a>`).join("")}</div>`;
const ft = n => n.toLocaleString("hu-HU") + " Ft";
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const page = document.body.dataset.page;

/* ---------- fejléc + lábléc ---------- */
$("#hdr").outerHTML = `
<header class="hdr" id="hdr"><div class="wrap">
  <a class="logo" href="index.html" aria-label="LS_VT kezdőlap"><img src="assets/img/logo-mark.png" alt="LSVT Powerteam by Sövér" width="120" height="34"></a>
  <nav class="nav" id="nav" aria-label="Fő navigáció">
    <a href="csapat.html" ${page === "team" ? 'class="on"' : ""}><span class="na">A </span>csapat</a>
    <a href="technika.html" ${page === "tech" ? 'class="on"' : ""}><span class="na">A </span>technika</a>
    <a href="galeria.html" ${page === "gallery" ? 'class="on"' : ""}><span class="na">A </span>paddock</a>
    <a href="webshop.html" ${page === "shop" ? 'class="on"' : ""}>Webshop</a>
    <a href="csapat.html#kapcsolat">Csatlakozz<span class="na"> ↗</span></a>
  </nav>
  <div style="display:flex;gap:8px">
    <button class="cartbtn" id="cartOpen" aria-label="Kosár">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
      <b id="cartCount">0</b></button>
  </div>
</div></header>`;

$("#ftr").outerHTML = `
<footer><div class="wrap">
  <div class="fgrid">
    <div><img src="assets/img/logo-mark.png" alt="LSVT Powerteam by Sövér" width="141" height="40" style="height:40px;width:auto;margin-bottom:16px">
      <p>LS_VT Coaching &amp; Management – gokart pilóták felkészítése, csapatmenedzsment és csapatruházat.</p></div>
    <div><h4>Oldalak</h4><ul><li><a href="csapat.html">Csapat</a></li><li><a href="galeria.html">Galéria</a></li><li><a href="webshop.html">Webshop</a></li><li><a href="csapat.html#kapcsolat">Kapcsolat</a></li></ul></div>
    <div><h4>Webshop</h4><ul><li><a href="webshop.html?k=Férfi ruházat">Férfi ruházat</a></li><li><a href="webshop.html?k=Női ruházat">Női ruházat</a></li><li><a href="webshop.html?k=Gyerek ruházat">Gyerek ruházat</a></li><li><a href="webshop.html?k=Kiegészítők">Kiegészítők</a></li></ul></div>
    <div><h4>Elérhetőség</h4><ul><li>7150 Bonyhád, Fáy ltp. 7/A. 3/8.</li><li><a href="tel:+36203145919">${SHOP.phone}</a></li><li><a href="mailto:${SHOP.email}">${SHOP.email}</a></li>
      <li>${socialHTML()}</li></ul></div>
  </div>
  <div class="fbot"><span>© ${new Date().getFullYear()} LS_VT Powerteam · <a href="aszf.html">ÁSZF</a> · <a href="adatvedelem.html">Adatvédelem</a></span>
  <span>Részletfotók: Peter Kocsar Photography · LS_VT csapatfotók</span></div>
</div></footer>
<div class="ov" id="ov"></div>
<aside class="drawer" id="drawer" aria-label="Kosár">
  <div class="dh"><h3>Kosár</h3><button class="x" data-close>×</button></div>
  <div class="items" id="items"></div>
  <div class="df" id="dfoot"></div>
</aside>
<div class="modal" id="modal"><div class="mbox" id="mbox"></div></div>
<div class="toast" id="toast"></div>`;

const hdr = $("#hdr");
const solid = () => hdr.classList.toggle("solid", scrollY > 40 || page === "shop");
addEventListener("scroll", solid); solid();

/* ---------- termékek ---------- */
let PRODUCTS = [];
const productsReady = fetch("assets/products.json").then(r => r.json()).then(d => (PRODUCTS = d));
const byId = id => PRODUCTS.find(p => p.id === id);
const priceTxt = p => p.max && p.max !== p.price ? `${ft(p.price)} – ${ft(p.max)}` : ft(p.price);

function card(p) {
  return `<article class="pc">
    <a class="ph" href="#" data-open="${p.id}">${p.img.slice(0, 2).map((s, i) => `<img src="${s}" alt="${i ? "" : esc(p.name)}" loading="lazy">`).join("")}</a>
    <div class="bd"><span class="ct">${esc(p.cats.filter(c => c !== "Sport ruházat")[0] || p.cats[0] || "")}</span>
      <h3>${esc(p.name)}</h3><span class="pr">${priceTxt(p)}</span>
      <button class="add" data-open="${p.id}">Kosárba</button></div></article>`;
}

/* ---------- kosár ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("lsvt-cart") || "[]"); } catch { }
const save = () => { try { localStorage.setItem("lsvt-cart", JSON.stringify(cart)); } catch { } renderCart(); };
const total = () => cart.reduce((s, i) => s + i.price * i.q, 0);
const priceFor = (p, opts = {}) => {
  const v = (p.variants || []).filter(v => v.size === opts["Méret"] && (!v.color || v.color === opts["Szín"]))
    .sort((a, b) => (b.color ? 1 : 0) - (a.color ? 1 : 0))[0];
  return v ? v.price : p.price;
};

function addToCart(p, opts, q = 1) {
  const key = p.id + "|" + Object.values(opts).join("|");
  const ex = cart.find(i => i.key === key);
  ex ? ex.q += q : cart.push({ key, id: p.id, name: p.name, img: p.img[0], price: priceFor(p, opts), opts, q });
  save(); toast(q > 1 ? `${q} db kosárba téve ✓` : "Kosárba téve ✓");
}
function renderCart() {
  const n = cart.reduce((s, i) => s + i.q, 0);
  $("#cartCount").textContent = n; $("#cartCount").hidden = !n;
  $("#items").innerHTML = cart.length ? cart.map((i, k) => `
    <div class="it"><img src="${i.img}" alt="">
      <div><strong>${esc(i.name)}</strong><small>${Object.entries(i.opts).map(([a, v]) => `${esc(a)}: ${esc(v)}`).join(" · ")}</small>
        <div class="qty"><button data-q="${k}" data-d="-1" aria-label="Kevesebb">−</button><input class="qn" data-k="${k}" type="number" min="1" max="99" value="${i.q}" aria-label="Darabszám"><button data-q="${k}" data-d="1" aria-label="Több">+</button></div></div>
      <strong>${ft(i.price * i.q)}</strong></div>`).join("") : `<p class="empty">A kosarad üres.</p>`;
  $("#dfoot").innerHTML = cart.length ? `<div class="tot"><span>Részösszeg</span><span>${ft(total())}</span></div>
    <button class="btn btn-red" id="checkout" style="justify-content:center">Tovább a pénztárhoz</button>` :
    `<a class="btn btn-ghost" href="webshop.html" style="justify-content:center">Irány a webshop</a>`;
}
$("#items").onchange = e => {
  const inp = e.target.closest(".qn"); if (!inp) return;
  const v = parseInt(inp.value, 10); const k = +inp.dataset.k;
  if (!v || v < 1) cart.splice(k, 1); else cart[k].q = Math.min(99, v); save();
};
$("#items").onclick = e => {
  const b = e.target.closest("[data-q]"); if (!b) return;
  const i = cart[+b.dataset.q]; i.q += +b.dataset.d; if (i.q < 1) cart.splice(+b.dataset.q, 1); save();
};
const openDrawer = () => { $("#drawer").classList.add("on"); $("#ov").classList.add("on"); };
const closeAll = () => ["#drawer", "#ov", "#modal"].forEach(s => $(s).classList.remove("on"));
$("#cartOpen").onclick = openDrawer;
$("#ov").onclick = closeAll;
document.addEventListener("keydown", e => e.key === "Escape" && closeAll());
document.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) closeAll();
  const o = e.target.closest("[data-open]");
  if (o) { e.preventDefault(); productsReady.then(() => openProduct(+o.dataset.open)); }
  if (e.target.id === "checkout") openCheckout();
});
// Kapcsos zárójel kell: az onclick-ból visszaadott false minden kattintást visszavonna a modalban (checkbox, linkek).
$("#modal").onclick = e => { if (e.target.id === "modal") closeAll(); };

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 1800); }
function modal(html) { $("#mbox").innerHTML = `<button class="x" data-close>×</button>` + html; $("#modal").classList.add("on"); $("#ov").classList.add("on"); }

/* ---------- termék részletek ---------- */
function openProduct(id) {
  const p = byId(id); if (!p) return;
  const sel = {};
  const attrs = Object.entries(p.attrs || {});
  const sortSize = a => { const o = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]; return [...a].sort((x, y) => (o.indexOf(x) + 1 || 99) - (o.indexOf(y) + 1 || 99) || x.localeCompare(y, "hu", { numeric: true })); };
  modal(`<div class="pd">
    <div class="gal2"><img id="mainImg" src="${p.img[0]}" alt="${esc(p.name)}">
      ${p.img.length > 1 ? `<div class="thumbs">${p.img.map((s, i) => `<img src="${s}" class="${i ? "" : "on"}" data-src="${s}" alt="">`).join("")}</div>` : ""}</div>
    <div class="info"><span class="eyebrow">${esc(p.cats.join(" · "))}</span><h2>${esc(p.name)}</h2>
      <div class="pr" id="mPrice">${priceTxt(p)}</div>${p.desc ? `<p style="color:var(--mut)">${esc(p.desc)}</p>` : ""}
      ${attrs.map(([a, vals]) => `<div><label>${esc(a)}</label><div class="opts" data-attr="${esc(a)}" style="margin-top:8px">${(a === "Méret" ? sortSize(vals) : vals).map(v => `<button class="opt" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div></div>`).join("")}
      <p class="steps" id="hint"></p>
      <div class="buy"><div class="qty-pick"><button type="button" data-step="-1" aria-label="Kevesebb">−</button><input id="qtyIn" type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Mennyiség"><button type="button" data-step="1" aria-label="Több">+</button></div>
      <button class="btn btn-red" id="addBtn" style="justify-content:center">Kosárba</button></div>
    </div></div>`);
  $("#mbox").querySelectorAll(".thumbs img").forEach(t => t.onclick = () => { $("#mainImg").src = t.dataset.src; $("#mbox").querySelectorAll(".thumbs img").forEach(x => x.classList.toggle("on", x === t)); });
  $("#mbox").querySelectorAll(".opts").forEach(g => g.onclick = e => {
    const b = e.target.closest(".opt"); if (!b) return;
    g.querySelectorAll(".opt").forEach(x => x.classList.toggle("on", x === b)); sel[g.dataset.attr] = b.dataset.v; $("#hint").textContent = "";
    if (p.variants && sel["Méret"]) $("#mPrice").textContent = ft(priceFor(p, sel));
  });
  const qtyIn = $("#qtyIn");
  const qty = () => Math.min(99, Math.max(1, parseInt(qtyIn.value, 10) || 1));
  $("#mbox").querySelectorAll("[data-step]").forEach(b => b.onclick = () => { qtyIn.value = Math.min(99, Math.max(1, qty() + +b.dataset.step)); });
  qtyIn.onchange = () => { qtyIn.value = qty(); };
  $("#addBtn").onclick = () => {
    const miss = attrs.map(a => a[0]).filter(a => !sel[a]);
    if (miss.length) { $("#hint").textContent = "Válassz: " + miss.join(", ").toLowerCase(); return; }
    addToCart(p, sel, qty()); closeAll(); openDrawer();
  };
}

/* ---------- pénztár ---------- */
function openCheckout() {
  closeAll();
  modal(`<div style="padding:34px 28px"><span class="eyebrow">Pénztár</span><h2 style="font-size:2rem;margin-bottom:20px">Rendelés leadása</h2>
    <form class="f" id="cf">
      <div class="row"><input name="nev" placeholder="Teljes név *" required autocomplete="name"><input name="tel" placeholder="Telefonszám *" required autocomplete="tel"></div>
      <input name="email" type="email" placeholder="E-mail *" required autocomplete="email">
      <div class="row"><select name="szall"><option>Házhoz szállítás (futár)</option><option>Személyes átvétel – Bonyhád</option><option>Átvétel versenyhétvégén</option></select>
        <select name="fiz"><option>Utánvét</option><option>Banki átutalás</option></select></div>
      <div class="row"><input name="irsz" placeholder="Irányítószám" autocomplete="postal-code"><input name="varos" placeholder="Település" autocomplete="address-level2"></div>
      <input name="cim" placeholder="Utca, házszám" autocomplete="street-address">
      <textarea name="megj" rows="3" placeholder="Megjegyzés (pl. egyedi felirat, rajtszám)"></textarea>
      <label style="display:flex;gap:10px;align-items:flex-start;color:var(--mut);font-size:.9rem"><input type="checkbox" required style="width:auto;margin-top:4px"> Elfogadom az <a href="aszf.html" target="_blank" style="text-decoration:underline">ÁSZF</a>-et és az <a href="adatvedelem.html" target="_blank" style="text-decoration:underline">adatkezelési tájékoztatót</a>.</label>
      <div class="tot" style="margin-top:6px"><span>Végösszeg (szállítás nélkül)</span><span>${ft(total())}</span></div>
      <p class="steps">Futáros szállítás: nettó 1 300 Ft + áfa csomagonként, utánvét esetén további nettó 250 Ft + áfa (ÁSZF szerint). Személyes átvételnél nincs szállítási díj. A pontos végösszeget visszaigazoló e-mailben küldjük.</p>
      <button class="btn btn-red" style="justify-content:center">Megrendelem</button>
    </form></div>`);
  const cf = $("#cf");
  const syncAddr = () => cf.querySelectorAll("[name=irsz],[name=varos],[name=cim]").forEach(i => i.required = cf.szall.value.startsWith("Házhoz"));
  cf.szall.onchange = syncAddr; syncAddr();
  cf.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (BACKEND.url) {
      const btn = cf.querySelector("button.btn"); btn.disabled = true; btn.textContent = "Küldés…";
      try {
        const r = await fetch(`${BACKEND.url}/rest/v1/rpc/place_order`, {
          method: "POST", headers: { "Content-Type": "application/json", apikey: BACKEND.key, Authorization: `Bearer ${BACKEND.key}` },
          body: JSON.stringify({ payload: {
            customer: { name: d.nev, phone: d.tel, email: d.email, shipping: d.szall, payment: d.fiz, zip: d.irsz, city: d.varos, address: d.cim, note: d.megj },
            items: cart.map(i => ({ id: i.id, q: i.q, opts: i.opts })) } })
        });
        const res = await r.json();
        if (!r.ok) throw new Error(res.message || "A rendelést nem sikerült rögzíteni.");
        cart = []; save();
        $("#mbox").innerHTML = `<button class="x" data-close>×</button><div class="ok"><span class="eyebrow">Köszönjük!</span><h2>Rendelés rögzítve</h2>
          <p style="color:var(--mut)">Rendelésszám: <strong style="color:#fff">${esc(res.order_no)}</strong><br>Termékek összesen: <strong style="color:#fff">${ft(res.subtotal)}</strong> (szállítás nélkül)<br>
          Hamarosan felvesszük veled a kapcsolatot a megadott e-mail-címen vagy telefonszámon. Kérdés esetén: ${SHOP.phone}</p></div>`;
        return;
      } catch (err) {
        btn.disabled = false; btn.textContent = "Megrendelem";
        let m = $("#cfErr"); if (!m) { m = document.createElement("p"); m.id = "cfErr"; m.className = "form-err"; btn.before(m); }
        m.textContent = `${err.message.replace(/[.!?]?$/, ".")} Próbáld újra, vagy hívj minket: ${SHOP.phone}.`;
        return;
      }
    }
    const id = "LSVT-" + Date.now().toString(36).toUpperCase();
    const lines = cart.map(i => `- ${i.name} (${Object.values(i.opts).join(", ")}) x${i.q} = ${ft(i.price * i.q)}`).join("\n");
    const body = `Rendelés: ${id}\n\n${lines}\n\nÖsszesen: ${ft(total())}\n\nNév: ${d.nev}\nTel: ${d.tel}\nE-mail: ${d.email}\nSzállítás: ${d.szall}\nFizetés: ${d.fiz}\nCím: ${d.irsz} ${d.varos}, ${d.cim}\nMegjegyzés: ${d.megj}`;
    // Tartalék mód (nincs BACKEND.url): a rendelés a vásárló levelezőjéből megy e-mailben.
    location.href = `mailto:${SHOP.email}?subject=${encodeURIComponent("Új rendelés " + id)}&body=${encodeURIComponent(body)}`;
    // A kosár csak akkor ürül, ha a vásárló jelzi, hogy elküldte az e-mailt; addig a rendelés nincs nálunk.
    $("#mbox").innerHTML = `<button class="x" data-close>×</button><div class="ok"><span class="eyebrow">Még egy lépés</span><h2>Küldd el az e-mailt</h2>
      <p style="color:var(--mut)">A rendelés (<strong style="color:#fff">${id}</strong>) a leveleződben nyílt meg. Akkor kapjuk meg, ha onnan elküldöd.<br>
      Ha nem nyílt meg, írj az <strong style="color:#fff">${SHOP.email}</strong> címre, vagy hívj: ${SHOP.phone}</p>
      <textarea readonly rows="7" style="width:100%;margin:18px 0;background:var(--card);color:var(--fg);border:1px solid var(--line);padding:12px;font:13px/1.5 var(--ff)">${esc(body)}</textarea>
      <button class="btn btn-red" id="orderSent" style="justify-content:center">Elküldtem, kosár ürítése</button></div>`;
    $("#orderSent").onclick = () => { cart = []; save(); closeAll(); toast("Köszönjük a rendelést!"); };
  };
}

document.querySelectorAll("[data-social]").forEach(el => el.innerHTML = socialHTML());

renderCart();
window.LSVT = { productsReady, card, openProduct, get products() { return PRODUCTS; } };

/* Finom belépés a szekciókba; tartalom JS nélkül is látható. */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.split, .head-row, .pill, .contact');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08});
  targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  document.documentElement.classList.add('reveal-ready');
}
