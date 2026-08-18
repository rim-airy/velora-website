---
description: 
---

# Workflow: Auto-Self-Correction & Hierarchy Audit

1. CODE-SCAN GEGEN PRIÖRITÄT 0 (00-master-architecture.md):
   - Scanne HTML und CSS auf Verstöße gegen Ebene 1 & 2.
   - Prüfe: Stehen Formular-Inputs und Buttons auf eigener Zeile?
   - Prüfe: Gibt es starre `px`-Breiten bei Text-Containern?
   - Prüfe: Werden Wörter in Platzhaltern oder Buttons abgeschnitten?

2. AUTOMATISCHE SELBSTKORREKTUR:
   - Wenn ein Verstoß gefunden wird: Stoppe die Ausgabe.
   - Repariere das CSS/HTML direkt im selben Schritt, sodass es strikt der '00-master-architecture.md' entspricht.
   - Führe die Reparatur durch, OHNE den User nach manuellen Korrekturen zu fragen.

3. FINALE BESTÄTIGUNG:
   - Gib dem User nur dann "Alles grün" zurück, wenn der Selbsttest zu 100% bestanden ist.