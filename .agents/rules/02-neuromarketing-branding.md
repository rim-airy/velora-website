# RULE 02: NEUROMARKETING & SCHEMA-DRIVEN BRANDING ARCHITECTURE

## 1. GRUNDPRINZIP: SCHEMA-TRENNUNG & DYNAMISCHE STILE
- Sämtliche firmenspezifischen Daten (Farben, Geometrie, Typografie, Modul-Reihenfolge, Texte, Impressum, DSGVO) MÜSSEN ausschließlich über eine zentrale `config.json` gesteuert werden.
- Die Rendering-Dateien (`index.html`, `style.css`, `script.js`) fungieren als unveränderliche Engine. Direkte HTML-Manipulationen bei Kundenänderungen sind verboten.
- Design-Varianz: Stile wie Rahmenradien (rund vs. eckig), Farbschemata (feminin, maskulin, B2B, Handwerk) werden über Schema-Flags dynamisch appliziert.

## 2. BRANDING STANDARD: VELORA
- Standard-Brand für das Agentur-System: "Velora" (Subline: Intelligent Automation & Web Systems).
- Farbpsychologie Basis: Deep Obsidian `#0B0F19` (Autorität), Slate `#1E293B` (Struktur), Electric Cyan `#00F0FF` (Conversion/Action).

## 3. MODUL-SLOTS & RECHTSSICHERHEIT
Folgende dynamische Komponenten werden standardmäßig über `config.json` gerendert:
- Slot 1: Navbar (Logo-Vektor, Navigation, Direct-CTA)
- Slot 2: Hero (Value Proposition, Instant-Audit Lead-Formular)
- Slot 3: Social Proof / Metrics / Trust-Badges
- Slot 4: Interactive Showcase / Vorher-Nachher-Audit
- Slot 5: Onboarding- & Buchungs-Funnel
- Slot 6: Legal Hub (Dynamisch injectetes Impressum & Datenschutz gemäß aktuellen Richtlinien)

## 4. SCHNITTSTELLEN-KOMPATIBILITÄT (WHATSAPP / PORTAL-API)
- Eingehende automatisierte Kunden-Updates (Texte, Farben, Stil-Wechsel) modifizieren ausschließlich die `config.json`.
- Die Web-App rendert Änderungen zustandsbasiert und verlustfrei.
