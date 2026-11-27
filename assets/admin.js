/* Rendelések kezelése: bejelentkezés (Supabase Auth), lista, státuszváltás, belső megjegyzés. */
(() => {
  const STATUS = { uj: "Új", visszaigazolva: "Visszaigazolva", fizetve: "Fizetve", feladva: "Feladva", teljesitve: "Teljesítve", torolve: "Törölve" };
  const el = id => document.getElementById(id);
  if (!BACKEND.url || !window.supabase) { el("cfg").hidden = false; el("adm-sub").textContent = ""; return; }
  const sb = window.supabase.createClient(BACKEND.url, BACKEND.key);
  let orders = [], messages = [], filter = "nyitott";

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
    const [o, m] = await Promise.all([
      sb.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(500),
      sb.from("shop_messages").select("*").order("created_at", { ascending: false }).limit(300)]);
    const error = o.error || m.error;
    if (error) { el("list").innerHTML = `<p class="form-err">Nem sikerült betölteni: ${esc(error.message)}</p>`; return; }
    orders = o.data; messages = m.data;
    render();
  }

  function render() {
    const open = o => !["teljesitve", "torolve"].includes(o.status);
    const groups = { nyitott: ["Nyitott", orders.filter(open)], ...Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, [v, orders.filter(o => o.status === k)]])), osszes: ["Összes", orders] };
    const unread = messages.filter(x => !x.handled).length;
    el("filters").innerHTML = Object.entries(groups).map(([k, [n, l]]) => `<button class="chip ${k === filter ? "on" : ""}" data-f="${k}">${n} <sup>${l.length}</sup></button>`).join("")
      + `<button class="chip ${filter === "uzenetek" ? "on" : ""}" data-f="uzenetek">Üzenetek <sup>${unread ? unread + " új" : messages.length}</sup></button>`;
    if (filter === "uzenetek") {
      el("list").innerHTML = messages.length ? messages.map(x => `
      <article class="adm-order" data-mid="${x.id}">
        <header><div><strong>${esc(x.subject)}</strong><small>${new Date(x.created_at).toLocaleString("hu-HU")} · ${esc(x.name)} · <a href="mailto:${esc(x.email)}">${esc(x.email)}</a></small></div>
          <span class="adm-st ${x.handled ? "st-teljesitve" : "st-uj"}">${x.handled ? "Kezelve" : "Új"}</span></header>
        <p class="adm-note" style="white-space:pre-wrap">${esc(x.message)}</p>
        <div class="adm-actions"><button class="btn btn-ghost" data-done="${x.handled ? "0" : "1"}">${x.handled ? "Visszaállítás újra" : "Kezeltnek jelölöm"}</button></div>
      </article>`).join("") : `<p class="steps">Még nincs üzenet.</p>`;
      return;
    }
    const list = groups[filter][1];
    if (!orders.length) { el("list").innerHTML = `<p class="steps">Még nincs rendelés. Ha biztosan van, ellenőrizd, hogy a fiókod szerepel-e a shop_admins táblában.</p>`; return; }
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
    const d = e.target.closest("[data-done]");
    if (d) {
      d.disabled = true;
      const { error } = await sb.from("shop_messages").update({ handled: d.dataset.done === "1" }).eq("id", d.closest("[data-mid]").dataset.mid);
      if (error) { d.disabled = false; toast("Mentés sikertelen: " + error.message); return; }
      toast("Mentve ✓"); load(); return;
    }
    const b = e.target.closest("[data-save]"); if (!b) return;
    const card = b.closest(".adm-order");
    b.disabled = true;
    const { error } = await sb.from("shop_orders").update({ status: card.querySelector("[data-st]").value, admin_note: card.querySelector("[data-note]").value || null }).eq("id", card.dataset.id);
    b.disabled = false;
    if (error) { toast("Mentés sikertelen: " + error.message); return; }
    toast("Mentve ✓"); load();
  };

  show();
})();
