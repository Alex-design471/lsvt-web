/* LS_VT – közös logika: fejléc, lábléc, kosár, termék modal, pénztár */
const SHOP = { email: "info@ls-vt.hu", phone: "+36 20 314 5919" };
const ft = n => n.toLocaleString("hu-HU") + " Ft";
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const page = document.body.dataset.page;

/* ---------- fejléc + lábléc ---------- */
$("#hdr").outerHTML = `
<header class="hdr" id="hdr"><div class="wrap">
  <a class="logo" href="index.html" aria-label="LS_VT kezdőlap"><img src="assets/img/brand.webp" alt="LS_VT" width="114" height="38"></a>
  <nav class="nav" id="nav" aria-label="Fő navigáció">
    <a href="csapat.html" ${page === "team" ? 'class="on"' : ""}>A csapat</a>
    <a href="technika.html" ${page === "tech" ? 'class="on"' : ""}>A technika</a>
    <a href="galeria.html" ${page === "gallery" ? 'class="on"' : ""}>A paddock</a>
    <a href="webshop.html" ${page === "shop" ? 'class="on"' : ""}>Webshop</a>
    <a href="csapat.html#kapcsolat">Csatlakozz ↗</a>
  </nav>
  <div style="display:flex;gap:8px">
    <button class="cartbtn" id="cartOpen" aria-label="Kosár">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
      <b id="cartCount">0</b></button>
    <button class="burger cartbtn" id="burger" aria-label="Menü" aria-controls="nav" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  </div>
</div></header>`;

$("#ftr").outerHTML = `
<footer><div class="wrap">
  <div class="fgrid">
    <div><img src="assets/img/brand.webp" alt="LS_VT" style="height:40px;width:auto;margin-bottom:16px">
      <p>LS_VT Coaching &amp; Management – gokart pilóták felkészítése, csapatmenedzsment és csapatruházat.</p></div>
    <div><h4>Oldalak</h4><ul><li><a href="csapat.html">Csapat</a></li><li><a href="galeria.html">Galéria</a></li><li><a href="webshop.html">Webshop</a></li><li><a href="csapat.html#kapcsolat">Kapcsolat</a></li></ul></div>
    <div><h4>Webshop</h4><ul><li><a href="webshop.html?k=Férfi ruházat">Férfi ruházat</a></li><li><a href="webshop.html?k=Női ruházat">Női ruházat</a></li><li><a href="webshop.html?k=Gyerek ruházat">Gyerek ruházat</a></li><li><a href="webshop.html?k=Kiegészítők">Kiegészítők</a></li></ul></div>
    <div><h4>Elérhetőség</h4><ul><li>7150 Bonyhád, Fáy ltp. 7/A. 3/8.</li><li><a href="tel:+36203145919">${SHOP.phone}</a></li><li><a href="mailto:${SHOP.email}">${SHOP.email}</a></li>
      <li><a href="https://www.facebook.com/lsvtcoachingmanagement" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.instagram.com/ls_vt_powerteam/" target="_blank" rel="noopener">Instagram</a></li></ul></div>
  </div>
  <div class="fbot"><span>© ${new Date().getFullYear()} LS_VT Powerteam · <a href="https://ls-vt.hu/altalanos-szerzodesi-feltetelek/">ÁSZF</a> · <a href="https://ls-vt.hu/adatkezelesi-tajekoztato/">Adatvédelem</a></span>
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
$("#burger").onclick = () => { const open = $("#nav").classList.toggle("open"); $("#burger").setAttribute("aria-expanded", open); };
$("#nav").onclick = e => { if (e.target.closest("a")) { $("#nav").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false"); } };

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

function addToCart(p, opts) {
  const key = p.id + "|" + Object.values(opts).join("|");
  const ex = cart.find(i => i.key === key);
  ex ? ex.q++ : cart.push({ key, id: p.id, name: p.name, img: p.img[0], price: p.price, opts, q: 1 });
  save(); toast("Kosárba téve ✓");
}
function renderCart() {
  $("#cartCount").textContent = cart.reduce((s, i) => s + i.q, 0);
  $("#items").innerHTML = cart.length ? cart.map((i, k) => `
    <div class="it"><img src="${i.img}" alt="">
      <div><strong>${esc(i.name)}</strong><small>${Object.entries(i.opts).map(([a, v]) => `${esc(a)}: ${esc(v)}`).join(" · ")}</small>
        <div class="qty"><button data-q="${k}" data-d="-1">−</button>${i.q}<button data-q="${k}" data-d="1">+</button></div></div>
      <strong>${ft(i.price * i.q)}</strong></div>`).join("") : `<p class="empty">A kosarad üres.</p>`;
  $("#dfoot").innerHTML = cart.length ? `<div class="tot"><span>Részösszeg</span><span>${ft(total())}</span></div>
    <button class="btn btn-red" id="checkout" style="justify-content:center">Tovább a pénztárhoz</button>` :
    `<a class="btn btn-ghost" href="webshop.html" style="justify-content:center">Irány a webshop</a>`;
}
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
$("#modal").onclick = e => e.target.id === "modal" && closeAll();

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
      <div class="pr">${priceTxt(p)}</div>${p.desc ? `<p style="color:var(--mut)">${esc(p.desc)}</p>` : ""}
      ${attrs.map(([a, vals]) => `<div><label>${esc(a)}</label><div class="opts" data-attr="${esc(a)}" style="margin-top:8px">${(a === "Méret" ? sortSize(vals) : vals).map(v => `<button class="opt" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div></div>`).join("")}
      <p class="steps" id="hint"></p>
      <button class="btn btn-red" id="addBtn" style="justify-content:center">Kosárba</button>
    </div></div>`);
  $("#mbox").querySelectorAll(".thumbs img").forEach(t => t.onclick = () => { $("#mainImg").src = t.dataset.src; $("#mbox").querySelectorAll(".thumbs img").forEach(x => x.classList.toggle("on", x === t)); });
  $("#mbox").querySelectorAll(".opts").forEach(g => g.onclick = e => {
    const b = e.target.closest(".opt"); if (!b) return;
    g.querySelectorAll(".opt").forEach(x => x.classList.toggle("on", x === b)); sel[g.dataset.attr] = b.dataset.v; $("#hint").textContent = "";
  });
  $("#addBtn").onclick = () => {
    const miss = attrs.map(a => a[0]).filter(a => !sel[a]);
    if (miss.length) { $("#hint").textContent = "Válassz: " + miss.join(", ").toLowerCase(); return; }
    addToCart(p, sel); closeAll(); openDrawer();
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
      <label style="display:flex;gap:10px;align-items:flex-start;color:var(--mut);font-size:.9rem"><input type="checkbox" required style="width:auto;margin-top:4px"> Elfogadom az <a href="https://ls-vt.hu/altalanos-szerzodesi-feltetelek/" target="_blank" style="text-decoration:underline">ÁSZF</a>-et és az adatkezelési tájékoztatót.</label>
      <div class="tot" style="margin-top:6px"><span>Végösszeg (szállítás nélkül)</span><span>${ft(total())}</span></div>
      <p class="steps">A szállítási díjat és a fizetés részleteit visszaigazoló e-mailben küldjük.</p>
      <button class="btn btn-red" style="justify-content:center">Megrendelem</button>
    </form></div>`);
  $("#cf").onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const id = "LSVT-" + Date.now().toString(36).toUpperCase();
    const lines = cart.map(i => `- ${i.name} (${Object.values(i.opts).join(", ")}) x${i.q} = ${ft(i.price * i.q)}`).join("\n");
    const body = `Rendelés: ${id}\n\n${lines}\n\nÖsszesen: ${ft(total())}\n\nNév: ${d.nev}\nTel: ${d.tel}\nE-mail: ${d.email}\nSzállítás: ${d.szall}\nFizetés: ${d.fiz}\nCím: ${d.irsz} ${d.varos}, ${d.cim}\nMegjegyzés: ${d.megj}`;
    // TODO: éles üzemben a rendelés a backendre megy (Supabase/WooCommerce API); addig e-mailben továbbítjuk.
    location.href = `mailto:${SHOP.email}?subject=${encodeURIComponent("Új rendelés " + id)}&body=${encodeURIComponent(body)}`;
    cart = []; save();
    $("#mbox").innerHTML = `<button class="x" data-close>×</button><div class="ok"><span class="eyebrow">Köszönjük!</span><h2>Rendelés rögzítve</h2>
      <p style="color:var(--mut)">Azonosító: <strong style="color:#fff">${id}</strong><br>Hamarosan visszaigazoljuk e-mailben. Kérdés esetén: ${SHOP.phone}</p></div>`;
  };
}

renderCart();
window.LSVT = { productsReady, card, get products() { return PRODUCTS; } };

/* Finom belépés a szekciókba; tartalom JS nélkül is látható. */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.split, .head-row, .pill, .contact, .cats');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08});
  targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  document.documentElement.classList.add('reveal-ready');
}
