## Obiettivo
Normalizzare la percezione ottica dei loghi nella marquee della homepage senza duplicare asset, assegnando a ogni logo una classe in base alla sua forma.

## Approccio
1. **Definire 3 classi CSS** in `public/site/assets/site.css` per la marquee clienti:
   - `.logo--wide` → loghi orizzontali (rapporto >2:1): altezza ~28px, max-width ~130px
   - `.logo--square` → loghi quadrati/compatti (rapporto ~1:1): altezza ~52px, max-width ~80px
   - `.logo--tall` → loghi verticali (rapporto <1:1): altezza ~56px, max-width ~60px
   
   Tutte con `object-fit: contain` e allineamento verticale centrato per uniformare l'area ottica percepita.

2. **Classificare i 33 loghi** attualmente presenti nella striscia in `public/site/index.html` e assegnare la classe corretta a ciascun `<img>`. Classificazione preliminare:
   - **Wide** (orizzontali): RDS, TIM, Live Nation, Cirque du Soleil, Essilor, Roche Bobois, Compagnia Italiana, Sandro Ferrone, Divanidea, Maury's, Cisalfa, Finstral, Verisure, Naima, Caffè Trombetta, Gros, CTS, Iper Triscount, Casaidea, MoaCasa, Boomerang, Mila, Parah, Regione Lazio
   - **Square** (BCC e simili): BCC Iccrea, BCC Roma, BCC Garda, BCC Vicentino, BCC Pesaro, BCC Binasco, BCC Emilbanca, McDonald's, Cartoon Network, Crik Crok
   - **Tall**: (verificare, probabilmente nessuno — in caso confluiscono in square)
   
   La classificazione finale verrà fatta ispezionando i file reali in `public/site/assets/clients/` per leggere le proporzioni.

3. **Rimuovere/aggiornare** la regola generica esistente `.marquee-clients img { height: 52px }` (o simili) per non entrare in conflitto con le nuove classi.

## File da modificare
- `public/site/assets/site.css` — nuove classi
- `public/site/index.html` — aggiunta della classe corretta a ogni `<img>` della marquee clienti

## Fuori scopo
- Nessuna modifica agli asset (i file loghi restano invariati)
- Nessuna modifica alle altre pagine
- Nessuna modifica alla velocità/direzione della marquee
