# LS_VT Powerteam – weboldal + webshop

Statikus oldal (HTML/CSS/JS, build nélkül).

| Oldal | Tartalom |
|---|---|
| `index.html` | Nyitókép, belépők a három aloldalra, rajtreakció-játék, webshop-ajánló, szponzorok |
| `csapat.html` | Csapat, filozófia, misszió/vízió/stratégia, kapcsolat űrlap |
| `technika.html` | Interaktív gokart-részletek (hajtás, tapadás, adatok, karakter) |
| `galeria.html` | Szűrhető fotógaléria nagyító nézettel |
| `webshop.html` | 52 termék: kategória, keresés, rendezés, méret/szín, darabszám, kosár, pénztár (`?termek=<id>` megnyit egy terméket) |
| `aszf.html` | Az LS-VT Kft. ÁSZF-je a régi oldalról, változatlan szöveggel |
| `adatvedelem.html` | Adatkezelési tájékoztató **tervezet** (jogásszal ellenőriztetni) |
| `404.html` | Hibaoldal ismeretlen címekre |
| `kezeles-*.html` | Admin: rendelések és üzenetek (bejelentkezés, státusz, belső megjegyzés). Szándékosan nehezen kitalálható név, nincs a menüben, noindex |

- `assets/app.js` – közös fejléc/lábléc, kosár (localStorage), termék modal, pénztár
- `assets/experience.js` – oldalátmenet, görgetésjelző, játék, technika, galéria, kapcsolat űrlap
- `_redirects` – a régi WordPress címek (oldalak, kategóriák, 52 termék) 301-es átirányítása Cloudflare Pages-en
- `assets/products.json` – termékadatok a régi WooCommerce boltból

Helyi futtatás: `python3 -m http.server` → http://localhost:8000

## Rendeléskezelés (Supabase)
1. Supabase projekt (most: adoasszisztens, shop_ előtagú táblákkal) → SQL Editor: `supabase/schema.sql`, majd `supabase/seed_products.sql`.
2. `assets/app.js` elején a `BACKEND` értékei: a projekt URL-je és a publishable (anon) kulcsa.
3. Admin fiók: Authentication → Users → Add user (e-mail + jelszó), majd SQL: `insert into public.shop_admins (user_id) select id from auth.users where email = '...';`
4. A projektben az adóasszisztens is fut, ezért a nyilvános regisztrációt nem kapcsoljuk ki; egy regisztrált, de nem admin felhasználó a rendelésekhez nem fér hozzá (RLS + shop_admins).

Ha a `BACKEND.url` üres, a pénztár e-mailes tartalék módban működik. Az árakat a szerver (`shop_place_order`) számolja a `shop_products` / `shop_product_variants` táblából; árváltozáskor a `products.json`-t és a seed SQL-t is frissíteni kell.

## Hátravan élesítés előtt
- Új rendelésről e-mail értesítés (és visszaigazolás a vevőnek) – ehhez e-mail-küldő szolgáltatás kell (pl. Resend) egy Supabase Edge Functionnel. Online fizetés (Barion/Stripe) később.
- A kapcsolat űrlap továbbra is a látogató levelezőjében nyit e-mailt.
- Az adatkezelési tájékoztató tervezetét szakemberrel ellenőriztetni; az ÁSZF a régi WooCommerce-folyamatot írja le (regisztráció, online rendelés), az új rendelési módhoz igazítani kell.
- `og:image` relatív útvonal: a végleges domainnel abszolút URL-re kell cserélni.
