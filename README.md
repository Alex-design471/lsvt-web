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

- `assets/app.js` – közös fejléc/lábléc, kosár (localStorage), termék modal, pénztár
- `assets/experience.js` – oldalátmenet, görgetésjelző, játék, technika, galéria, kapcsolat űrlap
- `_redirects` – a régi WordPress címek (oldalak, kategóriák, 52 termék) 301-es átirányítása Cloudflare Pages-en
- `assets/products.json` – termékadatok a régi WooCommerce boltból

Helyi futtatás: `python3 -m http.server` → http://localhost:8000

## Hátravan élesítés előtt
- A rendelés és a kapcsolat űrlap most a látogató levelezőjében nyit egy kitöltött e-mailt az info@ls-vt.hu címre. Élesben backend kell (Supabase vagy a WooCommerce API), opcionálisan online fizetés.
- Az adatkezelési tájékoztató tervezetét szakemberrel ellenőriztetni; az ÁSZF a régi WooCommerce-folyamatot írja le (regisztráció, online rendelés), az új rendelési módhoz igazítani kell.
- A „Praudit” szponzor linkje hiányzik.
- `og:image` relatív útvonal: a végleges domainnel abszolút URL-re kell cserélni.
