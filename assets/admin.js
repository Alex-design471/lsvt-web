/* Rendelések kezelése: bejelentkezés (Supabase Auth), lista, státuszváltás, belső megjegyzés. */
(() => {
  const STATUS = { uj: "Új", visszaigazolva: "Visszaigazolva", fizetve: "Fizetve", feladva: "Feladva", teljesitve: "Teljesítve", torolve: "Törölve" };
  const el = id => document.getElementById(id);
  if (!BACKEND.url || !window.supabase) { el("cfg").hidden = false; el("adm-sub").textContent = ""; return; }
  const sb = window.supabase.createClient(BACKEND.url, BACKEND.key);
  let orders = [], filter = "nyitott";

  const show = async () => {
    const { data: { session } } = await sb.auth.getSession();
    el("login").hidden = !!session; el("panel").hidden = !session;
    if (session) { el("adm-sub").textContent = session.user.email; load(); } else el("adm-sub").textContent = "Jelentkezz be az admin fiókoddal.";
  };

  el("login").onsubmit = async e => {
    e.preventDefault(); el("lerr").textContent = "";
    const { error } = await sb.auth.signInWithPassword({ email: el("lemail").value, password: el("lpass").value });
    if (error) el("lerr").textContent = "Hibás e-mail vagy jelszó."; else show();
  };
  el("logout").onclick = async () => { await sb.auth.signOut(); show(); };
  el("reload").onclick = () => load();

  async function load() {
    el("list").innerHTML = `<p class="steps">Betöltés…</p>`;
    const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) { el("list").innerHTML = `<p class="form-err">Nem sikerült betölteni: ${esc(error.message)}</p>`; return; }
    orders = data;
    if (!orders.length) { el("list").innerHTML = `<p class="steps">Még nincs rendelés. Ha biztosan van, ellenőrizd, hogy a fiókod szerepel-e az admins táblában.</p>`; }
    render();
  }

  function render() {
    const open = o => !["teljesitve", "torolve"].includes(o.status);
    const groups = { nyitott: ["Nyitott", orders.filter(open)], ...Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, [v, orders.filter(o => o.status === k)]])), osszes: ["Összes", orders] };
    el("filters").innerHTML = Object.entries(groups).map(([k, [n, l]]) => `<button class="chip ${k === filter ? "on" : ""}" data-f="${k}">${n} <sup>${l.length}</sup></button>`).join("");
    const list = groups[filter][1];
    if (!orders.length) return;
    el("list").innerHTML = list.length ? list.map(o => `
      <article class="adm-order" data-id="${o.id}">
        <header><div><strong>${esc(o.order_no)}</strong><small>${new Date(o.created_at).toLocaleString("hu-HU")}</small></div>
          <span class="adm-st st-${o.status}">${STATUS[o.status]}</span><strong>${ft(o.subtotal)}</strong></header>
        <div class="adm-cols">
          <div><small>Vevő</small>${esc(o.customer_name)}<br><a href="mailto:${esc(o.email)}">${esc(o.email)}</a><br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></div>
          <div><small>Szállítás / fizetés</small>${esc(o.shipping_method)}<br>${esc(o.payment_method)}${o.city ? `<br>${esc(o.zip || "")} ${esc(o.city)}, ${esc(o.address || "")}` : ""}</div>
          <div><small>Tételek</small>${o.items.map(i => `${i.q} × ${esc(i.name)}${Object.values(i.opts || {}).length ? ` <span class="steps">(${esc(Object.values(i.opts).join(", "))})</span>` : ""} – ${ft(i.line_total)}`).join("<br>")}</div>
        </div>
        ${o.note ? `<p class="adm-note"><small>Vevő megjegyzése</small>${esc(o.note)}</p>` : ""}
        <div class="adm-actions">
          <select data-st aria-label="Státusz">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${v}</option>`).join("")}</select>
          <input data-note placeholder="Belső megjegyzés" value="${esc(o.admin_note || "")}">
          <button class="btn btn-red" data-save>Mentés</button>
        </div>
      </article>`).join("") : `<p class="steps">Nincs ilyen rendelés.</p>`;
  }

  el("filters").onclick = e => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; render(); } };
  el("list").onclick = async e => {
    const b = e.target.closest("[data-save]"); if (!b) return;
    const card = b.closest(".adm-order");
    b.disabled = true;
    const { error } = await sb.from("orders").update({ status: card.querySelector("[data-st]").value, admin_note: card.querySelector("[data-note]").value || null }).eq("id", card.dataset.id);
    b.disabled = false;
    if (error) { toast("Mentés sikertelen: " + error.message); return; }
    toast("Mentve ✓"); load();
  };

  show();
})();
