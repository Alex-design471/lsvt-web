# LS_VT Powerteam – weboldal + webshop

Statikus oldal (HTML/CSS/JS, build nélkül): a gokartcsapat bemutatkozó oldala és a csapatruházat webshop.

- `index.html` – bemutatkozó oldal: csapat, filozófia, galéria, kiemelt termékek, szponzorok, kapcsolat
- `webshop.html` – terméklista: kategóriaszűrő, keresés, rendezés, termékoldal (méret/szín), kosár, pénztár
- `assets/products.json` – 52 termék a jelenlegi WooCommerce boltból (név, ár, kategória, méret/szín, képek)
- `assets/app.js` – közös fejléc/lábléc, kosár (localStorage), termék modal, pénztár

Helyi futtatás: `python3 -m http.server` → http://localhost:8000

## Hátravan élesítés előtt
- A rendelés most e-mailben megy az info@ls-vt.hu címre (mailto). Élesben backend kell (Supabase vagy a meglévő WooCommerce API), opcionálisan Stripe/Barion fizetés.
- Szállítási díjak, ÁSZF/Adatvédelem oldalak (most a régi oldalra mutatnak).
- A „Praudit” szponzor linkje hiányzik.
