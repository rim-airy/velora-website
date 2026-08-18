---
trigger: always_on
---

# Rule: Master Architecture & Conflict Resolution Engine (Priority 0)

## 1. DIE HIERARCHIE-REGEL (Kollisions-Schutz)
- Diese Rule ist PRIORITÄT 0 (Höchste Stufe). Keine zukünftige Rule darf die Prinzipien dieser Datei außer Kraft setzen.
- Wenn eine Design- oder Marketing-Rule im Widerspruch zur Lesbarkeit oder Statik steht, gewinnt IMMER die Statik und Lesbarkeit.

## 2. STATIK & LAYOUT-SICHERHEIT (Ebene 1 & 2)
- Formular-Gruppen (Inputs + Buttons) MÜSSEN ausnahmslos vertikal gestapelt werden (`display: flex; flex-direction: column; width: 100%;`).
- Es ist VERBOTEN, Eingabefelder und Absende-Buttons nebeneinander in eine Zeile zu quetschen.
- Text-Container dürfen NIEMALS starre Pixelbreiten besitzen (`width: 300px` verboten). Nutze immer `width: 100%; max-width: Xpx; box-sizing: border-box;`.
- `placeholder="..."` enthält AUSSCHLIESSLICH kurze Beispiele (z. B. `placeholder="www.ihre-firma.de"`). Die Anweisung steht als `<label>` darüber.

## 3. ZUKUNFTS-KOMPATIBILITÄT (Ebene 3)
- Neue Rules dürfen nur visuelle Schichten (Farben, Schatten, Typografie, Copywriting) hinzufügen, NIEMALS aber die grundlegende Flex-Box-Struktur zerstören.