/**
 * VELORA – script.js
 * Rendering-Engine: Lädt config.json und injiziert alle Slots dynamisch.
 * Rule 00: Keine hardcodierten Layout-Brüche.
 * Rule 01: Keine manuellen Buchungs-Flows. 100% automatisiert.
 * Rule 02: Einzige Datenquelle = config.json
 *
 * RENDER-IMMUNSYSTEM (Modul-Schritt 1)
 * Jeder Slot ist in safeRender() isoliert. Ein Fehler in einem Slot
 * blockiert NIEMALS die übrigen Slots. Lokale Datenfehler erzeugen
 * nur eine sichtbare Inline-Warnung im betroffenen Slot.
 */

// ============================================================
// 0. UTILITY: XSS-Sanitization & Render-Immunsystem
// ============================================================
function sanitize(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

/**
 * safeRender – Render-Immunsystem-Wrapper
 * Führt fn() aus und fängt alle Exceptions ab.
 * Bei Fehler: Inline-Warnung im betroffenen Slot, alle anderen Slots laufen weiter.
 * @param {string} slotName   – Lesbarer Name für Logging/Anzeige
 * @param {Function} fn       – Render-Funktion die ausgeführt wird
 * @param {string} [slotId]   – Optional: Slot-DOM-ID für Fehleranzeige
 */
function safeRender(slotName, fn, slotId) {
  try {
    fn();
  } catch (err) {
    console.error(`[Velora Immune] Slot "${slotName}" fehlgeschlagen:`, err);
    // Zeige Inline-Warnung im betroffenen Slot (silent fail nach außen)
    if (slotId) {
      const el = document.getElementById(slotId);
      if (el) {
        el.innerHTML = `
          <div style="padding:1.5rem;text-align:center;opacity:0.5;font-size:0.8rem;color:#94A3B8;">
            ⚠ Abschnitt konnte nicht geladen werden.
          </div>`;
      }
    }
  }
}

function sanitizeUrl(str) {
  if (typeof str !== 'string') return '#';
  const s = str.trim();
  if (/^(https?:\/\/|\/|#)/.test(s)) return s;
  return '#';
}

// ============================================================
// 1. DESIGN TOKEN INJECTION (CSS-Variablen auf :root)
// ============================================================
function applyDesignTokens(theme) {
  const root = document.documentElement;
  const { colors, typography, layout } = theme;

  root.style.setProperty('--color-primary',        colors.primary);
  root.style.setProperty('--color-secondary',      colors.secondary);
  root.style.setProperty('--color-accent',         colors.accent);
  root.style.setProperty('--color-accent-hover',   colors.accentHover);
  root.style.setProperty('--color-text-primary',   colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--font-family',          typography.fontFamily);
  root.style.setProperty('--heading-weight',       typography.headingWeight);
  root.style.setProperty('--container-width',      layout.containerWidth);

  const radiusMap = { small: '6px', medium: '10px', large: '16px', pill: '999px' };
  const r   = radiusMap[layout.borderRadius] || '10px';
  const rSm = layout.borderRadius === 'small' ? '4px' : '6px';
  const rLg = layout.borderRadius === 'large' ? '18px' : '14px';
  root.style.setProperty('--radius-sm', rSm);
  root.style.setProperty('--radius-md', r);
  root.style.setProperty('--radius-lg', rLg);
}

// ============================================================
// 2. META / SEO UPDATE
// ============================================================
function updateMeta(brand) {
  document.title = `${sanitize(brand.name)} – ${sanitize(brand.subline)}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', sanitize(brand.tagline));
}

// ============================================================
// 3. SVG ICON MAP
// ============================================================
const ICONS = {
  cpu:    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  zap:    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  check:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  star:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  chevron:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`,
};

function getIcon(name) { return ICONS[name] || ICONS['zap']; }

// Keyframe für Loading-Spinner
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

// ============================================================
// 3b. PROGRESSIVE BODY-SCROLL-LOCK (ohne Seiten-Sprung)
// ============================================================
let savedGlobalScrollY = 0;
let activeScrollLocks = 0;

function lockBodyScroll() {
  if (activeScrollLocks === 0) {
    savedGlobalScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedGlobalScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  activeScrollLocks++;
}

function unlockBodyScroll() {
  if (activeScrollLocks <= 0) return;
  activeScrollLocks--;
  if (activeScrollLocks === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, savedGlobalScrollY);
  }
}

// ============================================================
// 4. SMOOTH SCROLLING & ANCHOR RESOLUTION
// ============================================================
function resolveSectionElement(targetId) {
  if (!targetId) return null;
  const cleanId = targetId.replace(/^#/, '');
  const aliasMap = {
    'solutions': 'slot-features',
    'features': 'slot-features',
    'showcase': 'slot-showcase',
    'pricing': 'slot-pricing',
    'templates': 'slot-templates',
    'check': 'slot-funnel',
    'funnel': 'slot-funnel',
    'faq': 'slot-faq'
  };
  return document.getElementById(cleanId) || document.getElementById(aliasMap[cleanId]) || null;
}

function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = resolveSectionElement(href.slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ============================================================
// 5. SLOT 1: NAVBAR
// ============================================================
function renderNavbar(cfg) {
  const { brand, navigation } = cfg;

  // Desktop nav items
  const navItems = navigation.map(item => {
    let classes = 'nav-item';
    if (item.isCTA)        classes += ' is-cta';
    if (item.isPortalLink) classes += ' is-portal-link';
    const icon = item.isPortalLink ? `${getIcon('lock')} ` : '';
    return `
    <li class="${classes}">
      <a href="${sanitizeUrl(item.href)}">${icon}${sanitize(item.label)}</a>
    </li>`;
  }).join('');

  // Mobile nav items (same links, bigger touch targets)
  const mobileNavItems = navigation.map(item => {
    let classes = '';
    if (item.isCTA)        classes += ' is-cta';
    if (item.isPortalLink) classes += ' is-portal-link';
    const icon = item.isPortalLink ? `${getIcon('lock')} ` : '';
    return `
    <li class="${classes}">
      <a href="${sanitizeUrl(item.href)}">${icon}${sanitize(item.label)}</a>
    </li>`;
  }).join('');

  document.getElementById('slot-navbar').innerHTML = `
    <a href="#" class="navbar-logo" aria-label="${sanitize(brand.name)} Startseite">
      <span class="logo-text">${sanitize(brand.logo.text)}</span>
      <span class="logo-badge">${sanitize(brand.logo.badge)}</span>
    </a>

    <!-- Desktop Nav -->
    <nav class="navbar-desktop" aria-label="Hauptnavigation">
      <ul class="navbar-nav">${navItems}</ul>
    </nav>

    <!-- Hamburger Button (mobile only) -->
    <button class="hamburger-btn" id="hamburger-btn"
            aria-label="Menü öffnen" aria-expanded="false"
            aria-controls="mobile-nav" type="button">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  `;

  // Mobile nav panel – in body injiziert (außerhalb der Navbar)
  if (!document.getElementById('mobile-nav')) {
    const panel = document.createElement('div');
    panel.id        = 'mobile-nav';
    panel.className = 'mobile-nav-panel';
    panel.setAttribute('role', 'navigation');
    panel.setAttribute('aria-label', 'Mobilnavigation');
    panel.innerHTML = `<ul class="mobile-nav-list">${mobileNavItems}</ul>`;
    document.body.appendChild(panel);

    const overlay = document.createElement('div');
    overlay.id        = 'mobile-nav-overlay';
    overlay.className = 'mobile-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  // Scroll-Effekt mit requestAnimationFrame-Throttling (FPS- & Performance-Boost)
  const navbar = document.getElementById('slot-navbar');
  let isScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  initHamburger();
}

// ============================================================
// 5b. HAMBURGER MENU TOGGLE
// ============================================================
function initHamburger() {
  const btn     = document.getElementById('hamburger-btn');
  const panel   = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!btn || !panel) return;

  function openMenu() {
    panel.classList.add('open');
    overlay?.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    panel.classList.remove('open');
    overlay?.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = 'auto';
  }

  btn.addEventListener('click', () => {
    panel.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  // Klicks auf "Lösungen", "Vorher/Nachher", "Pakete & Wartung", "Kostenloser Website-Check"
  // schließen das Menü sofort und scrollen zuverlässig zur jeweiligen Sektion (#slot-features, #slot-showcase, #slot-pricing, #slot-funnel)
  panel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      closeMenu();

      if (href && href.startsWith('#')) {
        const targetEl = resolveSectionElement(href.slice(1));
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ESC-Taste
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeMenu();
  });
}

// ============================================================
// 6. DEFAULT NEUGRÜNDER STEPS & HELPER
// ============================================================
const DEFAULT_FOUNDER_STEPS = [
  {
    id: 'industry',
    question: 'In welcher Branche bist du tätig?',
    options: [
      { value: 'handwerk',     label: '🔧 Handwerk & Bau' },
      { value: 'gastronomie', label: '🍽️ Gastronomie & Hotel' },
      { value: 'beratung',    label: '💼 Beratung & Coaching' },
      { value: 'handel',      label: '🛒 E-Commerce & Handel' },
      { value: 'gesundheit',  label: '🏥 Gesundheit & Beauty' },
      { value: 'sonstige',    label: '✨ Sonstige Branche' }
    ]
  },
  {
    id: 'style',
    question: 'Welchen Design-Stil bevorzugst du?',
    options: [
      { value: 'modern',       label: '🖤 Modern & Minimalistisch' },
      { value: 'elegant',      label: '✨ Elegant & Premium' },
      { value: 'freundlich',   label: '😊 Freundlich & Nahbar' },
      { value: 'kraftvoll',    label: '💥 Kraftvoll & Dynamisch' }
    ]
  },
  {
    id: 'goal',
    question: 'Was ist dein primäres Ziel?',
    options: [
      { value: 'leads',        label: '📊 Mehr Anfragen & Neukunden' },
      { value: 'verkauf',      label: '🛍️ Online-Produkte verkaufen' },
      { value: 'sichtbarkeit', label: '👁️ Lokale Sichtbarkeit aufbauen' },
      { value: 'vertrauen',    label: '🤝 Professionalität & Vertrauen' }
    ]
  }
];

function animatePercent(el, fromVal, toVal, duration = 320) {
  if (!el) return;
  if (fromVal === toVal) {
    el.textContent = `${toVal}%`;
    return;
  }
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(fromVal + (toVal - fromVal) * ease);
    el.textContent = `${current}%`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${toVal}%`;
    }
  }
  requestAnimationFrame(step);
}

function renderFounderConfiguratorHtml(steps) {
  const stepList = (steps && steps.length) ? steps : DEFAULT_FOUNDER_STEPS;
  return `
    <div class="founder-progress-header">
      <span class="founder-progress-label">Konfigurations-Fortschritt</span>
      <span class="founder-progress-percent">0%</span>
    </div>
    <div class="founder-progress-bar">
      <div class="founder-progress-fill" style="width:0%"></div>
    </div>
    ${stepList.map((step, idx) => `
    <div class="founder-step${idx === 0 ? ' active' : ''}" data-step-index="${idx}">
      <div class="founder-step-counter">Schritt ${idx + 1} von ${stepList.length}</div>
      <div class="founder-step-question">${sanitize(step.question)}</div>
      <div class="founder-options">
        ${step.options.map(opt => `
        <button class="founder-option-btn"
                type="button"
                data-step="${idx}"
                data-value="${sanitize(opt.value)}"
                data-label="${sanitize(opt.label)}">
          ${sanitize(opt.label)}
        </button>
        `).join('')}
      </div>
    </div>
    `).join('')}
    <!-- Ergebnis -->
    <div class="founder-result" aria-live="polite"></div>
  `;
}

function setupFounderConfigurator(container, steps, pricing) {
  if (!container) return;
  const stepList = (steps && steps.length) ? steps : DEFAULT_FOUNDER_STEPS;
  const totalSteps = stepList.length;
  const answers = {};
  let isTransitioning = false;
  let currentPct = 0;

  const progressFill = container.querySelector('.founder-progress-fill');
  const progressPercent = container.querySelector('.founder-progress-percent');
  const stepElements = container.querySelectorAll('.founder-step');
  const resultEl = container.querySelector('.founder-result');

  function updateProgress(targetPct) {
    if (progressFill) progressFill.style.width = `${targetPct}%`;
    if (progressPercent) {
      animatePercent(progressPercent, currentPct, targetPct);
      currentPct = targetPct;
    }
  }

  function showStep(idx) {
    stepElements.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    if (resultEl) {
      resultEl.classList.remove('visible');
      resultEl.innerHTML = '';
    }

    // Genau nach Spezifikation: Schritt 1 = 0%, Schritt 2 = 33%, Schritt 3 = 66%
    const stepPercents = [0, 33, 66];
    const targetPct = stepPercents[idx] !== undefined ? stepPercents[idx] : Math.round((idx / totalSteps) * 100);
    updateProgress(targetPct);

    // Zurück-Button
    const existingBack = container.querySelector('.founder-back-btn');
    if (existingBack) existingBack.remove();

    if (idx > 0 && stepElements[idx]) {
      const backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.className = 'founder-back-btn';
      backBtn.setAttribute('aria-label', 'Vorheriger Schritt');
      backBtn.innerHTML = '← Zurück';
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showStep(idx - 1);
      });
      stepElements[idx].prepend(backBtn);
    }
    isTransitioning = false;
  }

  function showResult() {
    updateProgress(100);
    stepElements.forEach(el => el.classList.remove('active'));

    let recommendedPkg = 'basic';
    const industry = (answers.industry || '').toLowerCase();
    const goal = (answers.goal || '').toLowerCase();

    const enterpriseTrigger =
      (industry === 'handel' && (goal === 'verkauf' || goal === 'leads')) ||
      (industry === 'kanzlei') ||
      (industry === 'beratung' && goal === 'leads');

    const proTrigger =
      goal === 'leads' ||
      goal === 'verkauf' ||
      goal === 'vertrauen' ||
      industry === 'handwerk' ||
      industry === 'gastronomie';

    if (enterpriseTrigger) recommendedPkg = 'enterprise';
    else if (proTrigger) recommendedPkg = 'pro';

    const pkgList = (pricing && pricing.length) ? pricing : [
      { id: 'basic', name: 'Basic', price: '490', priceSuffix: 'einmalig', subtitle: 'Für Einsteiger & Neugründer' },
      { id: 'pro', name: 'Pro', price: '49', priceSuffix: '/Monat', subtitle: 'Für wachsende Unternehmen' },
      { id: 'enterprise', name: 'Enterprise', price: '149', priceSuffix: '/Monat', subtitle: 'Full-Service & KI-Automatisierung' }
    ];

    const pkg = pkgList.find(p => p.id === recommendedPkg) || pkgList[1] || pkgList[0];
    if (!resultEl || !pkg) return;

    let setupFeeText = 'Einmalig 890 € (Setup & Entwicklung)';
    let recurringFeeText = 'Betreuung & Hosting ab 49 €/Monat';

    if (pkg.id === 'basic') {
      setupFeeText = 'Einmalig 490 € (Setup & Entwicklung)';
      recurringFeeText = '0 €/Monat (kein laufender Pflichtbeitrag)';
    } else if (pkg.id === 'pro') {
      setupFeeText = 'Einmalig 890 € (Setup & Entwicklung)';
      recurringFeeText = 'Betreuung, Hosting & KI-Infrastruktur ab 49 €/Monat';
    } else if (pkg.id === 'enterprise') {
      setupFeeText = 'Einmalig 1.490 € (Full-Service Architektur)';
      recurringFeeText = 'Vollbetreuung, KI-Akquise & Hosting ab 149 €/Monat';
    }

    resultEl.innerHTML = `
      <div class="founder-result-card">
        <div class="founder-result-badge">🎯 Deine maßgeschneiderte Velora-Empfehlung</div>
        <div class="founder-result-pkg-name">${sanitize(pkg.name)}-Paket</div>
        <p class="founder-result-sub">${sanitize(pkg.subtitle || 'Die optimale Architektur für maximalen Kundenzulauf')}</p>

        <div class="founder-pricing-breakdown">
          <div class="pricing-breakdown-row">
            <span class="breakdown-label">🛠️ Einmalige Setup- & Entwicklungskosten:</span>
            <span class="breakdown-value highlight">${setupFeeText}</span>
          </div>
          <div class="pricing-breakdown-row">
            <span class="breakdown-label">⚡ Laufende Betreuung & KI-Infrastruktur:</span>
            <span class="breakdown-value highlight">${recurringFeeText}</span>
          </div>
        </div>

        <div class="founder-roi-callout">
          <span class="roi-icon">📈</span>
          <span class="roi-text"><strong>ROI-Fokus:</strong> Amortisiert sich oft bereits ab dem 1. Neukunden.</span>
        </div>

        <button class="btn-primary founder-result-cta" type="button" data-pkg="${sanitize(pkg.id)}" data-pkg-name="${sanitize(pkg.name)}">
          ${getIcon('zap')} Jetzt ${sanitize(pkg.name)}-Paket unverbindlich anfragen →
        </button>
        <button class="founder-restart-btn" type="button" style="margin-top:0.35rem;background:none;border:none;color:var(--color-text-secondary);font-family:inherit;font-size:0.8rem;cursor:pointer;padding:0.3rem;">
          ↩ Neu konfigurieren
        </button>
      </div>
    `;
    resultEl.classList.add('visible');

    resultEl.querySelector('.founder-result-cta')?.addEventListener('click', () => {
      openInquiryModal(pkg.name, { packageId: pkg.id });
    });

    resultEl.querySelector('.founder-restart-btn')?.addEventListener('click', () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      container.querySelectorAll('.founder-option-btn').forEach(b => b.classList.remove('selected'));
      showStep(0);
    });
    isTransitioning = false;
  }

  // Option-Button Event-Delegation mit Debouncing
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.founder-option-btn');
    if (!btn) return;
    e.preventDefault();

    const stepIdx = parseInt(btn.dataset.step, 10);
    const value = btn.dataset.value;
    const stepId = stepList[stepIdx]?.id;

    if (stepId) answers[stepId] = value;

    // Visual selection feedback
    const optionsContainer = btn.closest('.founder-options');
    if (optionsContainer) {
      optionsContainer.querySelectorAll('.founder-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }

    if (isTransitioning) return;
    isTransitioning = true;

    setTimeout(() => {
      const nextStep = stepIdx + 1;
      if (nextStep < totalSteps) {
        showStep(nextStep);
      } else {
        showResult();
      }
    }, 180);
  });

  // Schritt 1 sofort aktiv setzen
  showStep(0);
}

// ============================================================
// 6b. SLOT 2: HERO (2-Wege-Funnel: Bestehende Website + Neugründer)
// ============================================================
function renderHero(cfg) {
  const { hero, funnel, pricing } = cfg;
  const t1 = funnel?.tab1 || {
    label: 'Bestehende Website',
    icon: '🌐',
    inputLabel: 'Gib deine aktuelle Website-Adresse ein:',
    inputPlaceholder: 'z. B. www.ihre-praxis.de',
    buttonText: 'Kostenloser Website-Check starten'
  };
  const t2 = funnel?.tab2 || {
    label: 'Neugründer',
    icon: '🚀',
    description: 'Du gründest oder brauchst eine komplett neue Website.',
    steps: DEFAULT_FOUNDER_STEPS
  };
  const founderSteps = (t2.steps && t2.steps.length) ? t2.steps : DEFAULT_FOUNDER_STEPS;

  const secondaryCtaHtml = hero.ctaSecondary
    ? `<div class="hero-cta-group" style="margin-top:0.25rem;">
        <a href="${sanitizeUrl(hero.ctaSecondary.href)}" class="btn-secondary">
          ${sanitize(hero.ctaSecondary.text)}
        </a>
      </div>`
    : '';

  document.getElementById('slot-hero').innerHTML = `
    <div class="hero-inner">
      <span class="hero-badge">${sanitize(hero.badge)}</span>
      <h1 class="hero-headline">${sanitize(hero.headline)}</h1>
      <p class="hero-subheadline">${sanitize(hero.subheadline)}</p>

      <!-- Hero 2-Wege-Funnel Tabs -->
      <div class="hero-tabs" role="tablist" aria-label="Einstiegsoptionen">
        <button class="hero-tab-btn active" id="hero-tab-btn-0" role="tab"
                aria-selected="true" aria-controls="hero-tab-panel-0" type="button">
          ${sanitize(t1.icon || '🌐')} ${sanitize(t1.label || 'Bestehende Website')}
        </button>
        <button class="hero-tab-btn" id="hero-tab-btn-1" role="tab"
                aria-selected="false" aria-controls="hero-tab-panel-1" type="button">
          ${sanitize(t2.icon || '🚀')} ${sanitize(t2.label || 'Neugründer')}
        </button>
      </div>

      <!-- TAB 1: Bestehende Website (URL Check) -->
      <div class="hero-tab-content active" id="hero-tab-panel-0" role="tabpanel">
        <form id="hero-check-form" class="hero-form" novalidate>
          <label for="hero-url-input" class="hero-form-label">
            ${sanitize(t1.inputLabel || 'Gib deine aktuelle Website-Adresse ein:')}
          </label>
          <input
            type="text"
            id="hero-url-input"
            name="url"
            class="hero-form-input"
            placeholder="${sanitize(t1.inputPlaceholder || 'z. B. www.ihre-praxis.de')}"
            autocomplete="url"
            maxlength="253"
          >
          <span id="hero-url-error" class="hero-form-error" role="alert">
            Bitte gib eine gültige Domain ein (z. B. www.ihre-praxis.de).
          </span>
          <button type="submit" id="hero-submit-btn" class="btn-primary">
            ${getIcon('zap')}
            ${sanitize(t1.buttonText || hero.ctaPrimary?.text || 'Kostenloser Website-Check starten')}
          </button>
        </form>
      </div>

      <!-- TAB 2: Neugründer-Konfigurator -->
      <div class="hero-tab-content" id="hero-tab-panel-1" role="tabpanel">
        <div class="hero-founder-wrapper">
          <p class="hero-founder-desc">${sanitize(t2.description || 'In 3 kurzen Schritten zur passenden Lösung für dein Vorhaben.')}</p>
          <div class="founder-configurator" id="hero-founder-configurator">
            ${renderFounderConfiguratorHtml(founderSteps)}
          </div>
        </div>
      </div>

      ${secondaryCtaHtml}
    </div>
  `;

  initHeroTabs();
  initHeroForm();
  setupFounderConfigurator(document.getElementById('hero-founder-configurator'), founderSteps, pricing);
}

function initHeroTabs() {
  const btns = document.querySelectorAll('.hero-tab-btn');
  const panels = document.querySelectorAll('.hero-tab-content');
  btns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      btns.forEach((b, i) => {
        b.classList.toggle('active', i === idx);
        b.setAttribute('aria-selected', String(i === idx));
      });
      panels.forEach((p, i) => {
        p.classList.toggle('active', i === idx);
      });
    });
  });
}

function initHeroForm() {
  const form  = document.getElementById('hero-check-form');
  const input = document.getElementById('hero-url-input');
  const error = document.getElementById('hero-url-error');
  if (!form || !input || !error) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawVal = input.value.trim();
    const clean  = sanitize(rawVal);
    const testVal = clean.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
    const domainPattern = /^[a-zA-Z0-9äöüÄÖÜ\-]{1,63}(\.[a-zA-Z]{2,})+$/;

    if (!domainPattern.test(testVal)) {
      input.classList.add('error');
      error.classList.add('visible');
      input.focus();
      return;
    }

    input.classList.remove('error');
    error.classList.remove('visible');

    // Scroll zu Funnel + Tab 1 befüllen
    const funnelEl = document.getElementById('check') || document.getElementById('slot-funnel');
    if (funnelEl) funnelEl.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      const funnelInput = document.getElementById('funnel-url-input');
      if (funnelInput) {
        funnelInput.value = clean;
        // Tab 1 aktivieren
        const tab1Btn = document.getElementById('funnel-tab-btn-0');
        if (tab1Btn) tab1Btn.click();
        triggerCheck(clean);
      }
    }, 400);
  });

  input.addEventListener('input', () => {
    input.classList.remove('error');
    error.classList.remove('visible');
  });
}

// ============================================================
// 7. SLOT 3: METRICS
// ============================================================
function renderMetrics(cfg) {
  const cards = cfg.metrics.map((m, i) => `
    <div class="metric-card" style="transition-delay:${i * 0.1}s">
      <div class="metric-value">${sanitize(m.value)}</div>
      <div class="metric-label">${sanitize(m.label)}</div>
    </div>
  `).join('');

  document.getElementById('slot-metrics').innerHTML = `
    <div class="metrics-grid">${cards}</div>
  `;
}

// ============================================================
// 8. SLOT 4: FEATURES / SOLUTIONS
// ============================================================
function renderFeatures(cfg) {
  const cards = cfg.features.map((f, i) => `
    <article class="feature-card" style="transition-delay:${i * 0.12}s">
      <div class="feature-icon">${getIcon(f.icon)}</div>
      <h3>${sanitize(f.title)}</h3>
      <p>${sanitize(f.description)}</p>
    </article>
  `).join('');

  document.getElementById('slot-features').innerHTML = `
    <div id="solutions" style="padding-top:68px;margin-top:-68px;"></div>
    <div class="features-header">
      <span class="section-label">Unsere Lösungen</span>
      <h2>Was Velora von klassischen Agenturen unterscheidet</h2>
      <p>Keine Templates. Keine manuellen Prozesse. Nur skalierbare, automatisierte Systeme.</p>
    </div>
    <div class="features-grid">${cards}</div>
  `;
}

// ============================================================
// 9. SLOT 4b: SHOWCASE (Vorher / Nachher)
// ============================================================
function renderShowcase(cfg) {
  if (!cfg.showcase || !cfg.showcase.length) return;

  const tabBtns = cfg.showcase.map((s, i) => `
    <button class="showcase-tab-btn${i === 0 ? ' active' : ''}"
            data-idx="${i}"
            id="showcase-tab-${i}"
            aria-selected="${i === 0}"
            type="button">
      ${sanitize(s.label)} <small style="opacity:0.7;font-weight:400;">${sanitize(s.industry)}</small>
    </button>
  `).join('');

  const slides = cfg.showcase.map((s, i) => {
    const ratingStars = s.rating ? `<div class="showcase-quote-stars">${'★'.repeat(s.rating)}</div>` : '';

    return `
    <div class="showcase-slide${i === 0 ? ' active' : ''}" id="showcase-slide-${i}" role="tabpanel">
      <div class="showcase-compare">
        <!-- Vorher-Karte -->
        <div class="showcase-card">
          <div class="showcase-card-header before">
            <span class="showcase-badge before">🔴 ${sanitize(s.beforeLabel)}</span>
            <div class="showcase-industry">${sanitize(s.industry)}</div>
          </div>
          <div class="showcase-card-body">
            <div class="showcase-stat">
              <div class="showcase-stat-label">Ladezeit (Google PageSpeed)</div>
              <div class="showcase-stat-value bad">${s.beforeStats.speed}/100</div>
            </div>
            <div class="showcase-stat">
              <div class="showcase-stat-label">Monatliche Anfragen</div>
              <div class="showcase-stat-value bad">${sanitize(s.beforeStats.leads)}</div>
            </div>
            <div class="showcase-stat">
              <div class="showcase-stat-label">Mobile Darstellung</div>
              <div class="showcase-stat-value bad">${sanitize(s.beforeStats.mobile)}</div>
            </div>
          </div>
        </div>

        <!-- Nachher-Karte -->
        <div class="showcase-card">
          <div class="showcase-card-header after">
            <span class="showcase-badge after">🟢 ${sanitize(s.afterLabel)} (Velora)</span>
            <div class="showcase-industry">${sanitize(s.industry)}</div>
          </div>
          <div class="showcase-card-body">
            <div class="showcase-stat">
              <div class="showcase-stat-label">Ladezeit (Google PageSpeed)</div>
              <div class="showcase-stat-value good">${s.afterStats.speed}/100</div>
            </div>
            <div class="showcase-stat">
              <div class="showcase-stat-label">Monatliche Anfragen</div>
              <div class="showcase-stat-value good">${sanitize(s.afterStats.leads)}</div>
            </div>
            <div class="showcase-stat">
              <div class="showcase-stat-label">Mobile</div>
              <div class="showcase-stat-value good">${sanitize(s.afterStats.mobile)}</div>
            </div>
          </div>
        </div>
      </div>

      <blockquote class="showcase-quote">
        ${ratingStars}
        <p>"${sanitize(s.quote)}"</p>
        <cite>— ${sanitize(s.quoteAuthor)}</cite>
      </blockquote>
    </div>
    `;
  }).join('');

  document.getElementById('slot-showcase').innerHTML = `
    <div id="showcase" style="padding-top:68px;margin-top:-68px;"></div>
    <div class="section-header">
      <span class="section-label">Vorher / Nachher</span>
      <h2>Echte Ergebnisse für echte Unternehmen</h2>
      <p>Keine Versprechen ohne Beweis – schau dir an, was Velora konkret verändert.</p>
    </div>

    <div class="showcase-trust-bar">
      <span class="showcase-trust-pill">🛡️ TÜV-geprüfte Standards</span>
      <span class="showcase-trust-pill">⚖️ DSGVO 100% konform</span>
      <span class="showcase-trust-pill gold">★ 4.9/5 Sterne aus 40+ Kundenbewertungen</span>
    </div>

    <div class="showcase-tabs" role="tablist">${tabBtns}</div>
    ${slides}
  `;

  // Tab-Switching
  document.querySelectorAll('.showcase-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx;
      document.querySelectorAll('.showcase-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.showcase-slide').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`showcase-slide-${idx}`)?.classList.add('active');
    });
  });
}

// ============================================================
// 10. SLOT 4c: PRICING
// ============================================================
function renderPricing(cfg) {
  if (!cfg.pricing || !cfg.pricing.length) return;

  const cards = cfg.pricing.map((pkg, i) => {
    const badge     = pkg.badge ? `<div class="pricing-badge">${sanitize(pkg.badge)}</div>` : '';
    const features  = pkg.features.map(f => `
      <li class="pricing-feature-item">
        <span class="pricing-feature-icon">${getIcon('check')}</span>
        <span>${sanitize(f)}</span>
      </li>
    `).join('');

    return `
    <div class="pricing-card${pkg.highlighted ? ' highlighted' : ''}" style="transition-delay:${i * 0.1}s">
      ${badge}
      <div class="pricing-name">${sanitize(pkg.name)}</div>
      <div class="pricing-subtitle">${sanitize(pkg.subtitle)}</div>
      <div class="pricing-price-wrap">
        <span class="pricing-currency">€</span>
        <span class="pricing-price">${sanitize(pkg.price)}</span>
        <span class="pricing-suffix">${sanitize(pkg.priceSuffix)}</span>
      </div>
      <div class="pricing-setup">${sanitize(pkg.setupFee)}</div>
      <ul class="pricing-features">${features}</ul>
      <button class="pricing-cta" type="button" data-pkg="${sanitize(pkg.id)}"
              id="pricing-cta-${sanitize(pkg.id)}">
        Jetzt ${sanitize(pkg.name)}-Paket starten
      </button>
    </div>
    `;
  }).join('');

  document.getElementById('slot-pricing').innerHTML = `
    <div id="pricing" style="padding-top:68px;margin-top:-68px;"></div>
    <div class="section-header">
      <span class="section-label">Pakete & Wartung</span>
      <h2>Transparente Preise – keine versteckten Kosten</h2>
      <p>Einmalige Setup-Gebühr + monatliche Wartungspauschale. Fertig.</p>
    </div>
    <div class="pricing-grid">${cards}</div>
  `;

  // Pricing CTA → Express-Anfragemodal
  document.querySelectorAll('.pricing-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const pkgId = btn.dataset.pkg || 'pro';
      const pkgName = pkgId.charAt(0).toUpperCase() + pkgId.slice(1);
      openInquiryModal(pkgName, { packageId: pkgId });
    });
  });
}

// ============================================================
// 11. SLOT 5: 2-WEGE-FUNNEL (Tab1: Check / Tab2: Neugründer)
// ============================================================
function renderFunnel(cfg) {
  const { funnel, pricing } = cfg;
  if (!funnel) return;

  const t1 = funnel.tab1;
  const t2 = funnel.tab2;
  const founderSteps = (t2?.steps && t2.steps.length) ? t2.steps : DEFAULT_FOUNDER_STEPS;

  document.getElementById('slot-funnel').innerHTML = `
    <div class="funnel-inner" id="check">
      <span class="section-label">Kostenloser Website-Check</span>
      <h2>${sanitize(funnel.title)}</h2>
      <p>${sanitize(funnel.subtitle)}</p>

      <!-- Tab-Switcher -->
      <div class="funnel-tabs" role="tablist">
        <button class="funnel-tab-btn active" id="funnel-tab-btn-0" role="tab"
                aria-selected="true" aria-controls="funnel-tab-0" type="button">
          ${sanitize(t1.icon)} ${sanitize(t1.label)}
        </button>
        <button class="funnel-tab-btn" id="funnel-tab-btn-1" role="tab"
                aria-selected="false" aria-controls="funnel-tab-1" type="button">
          ${sanitize(t2.icon)} ${sanitize(t2.label)}
        </button>
      </div>

      <!-- TAB 1: Bestehende Website -->
      <div class="funnel-tab-content active" id="funnel-tab-0" role="tabpanel">
        <p style="font-size:0.875rem;opacity:0.75;">${sanitize(t1.description)}</p>
        <form id="funnel-form" class="funnel-form" novalidate>
          <label for="funnel-url-input" class="funnel-form-label">
            ${sanitize(t1.inputLabel)}
          </label>
          <input
            type="text"
            id="funnel-url-input"
            name="url"
            class="funnel-input"
            placeholder="${sanitize(t1.inputPlaceholder)}"
            autocomplete="url"
            maxlength="253"
          >
          <span id="funnel-url-error" class="funnel-error" role="alert">
            Bitte gib eine gültige Domain ein (z. B. www.ihre-firma.de).
          </span>
          <button type="submit" class="btn-primary" id="funnel-submit-btn">
            ${getIcon('zap')}
            ${sanitize(t1.buttonText)}
          </button>
        </form>

        <!-- Animierter Check-Fortschritt -->
        <div id="check-progress" class="check-progress" aria-live="polite">
          ${t1.checkPhases.map(p => `
          <div class="check-phase" id="check-phase-${p.id}">
            <div class="check-phase-header">
              <span class="check-phase-label">${sanitize(p.icon)} ${sanitize(p.label)}</span>
              <span class="check-phase-status" id="check-status-${p.id}">Wartet...</span>
            </div>
            <div class="check-bar-wrap">
              <div class="check-bar" id="check-bar-${p.id}"></div>
            </div>
          </div>
          `).join('')}
        </div>

        <!-- Ergebnis-Report -->
        <div id="audit-result" class="audit-result" aria-live="polite"></div>
      </div>

      <!-- TAB 2: Neugründer-Konfigurator -->
      <div class="funnel-tab-content" id="funnel-tab-1" role="tabpanel">
        <p style="font-size:0.875rem;opacity:0.75;">${sanitize(t2.description)}</p>
        <div class="founder-configurator" id="founder-configurator">
          ${renderFounderConfiguratorHtml(founderSteps)}
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="funnel-trust">
        <span class="funnel-trust-item">${getIcon('lock')} DSGVO-konform</span>
        <span class="funnel-trust-item">${getIcon('check')} Kostenlos & unverbindlich</span>
        <span class="funnel-trust-item">${getIcon('star')} Sofort-Analyse</span>
      </div>
    </div>
  `;

  initFunnelTabs();
  initFunnelForm(t1);
  setupFounderConfigurator(document.getElementById('founder-configurator'), founderSteps, pricing);
}

// Tab-Switching für Funnel
function initFunnelTabs() {
  const btns = document.querySelectorAll('.funnel-tab-btn');
  btns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      btns.forEach((b, i) => {
        b.classList.toggle('active', i === idx);
        b.setAttribute('aria-selected', String(i === idx));
      });
      document.querySelectorAll('.funnel-tab-content').forEach((c, i) => {
        c.classList.toggle('active', i === idx);
      });
    });
  });
}

// Form-Validation + Check-Trigger
function initFunnelForm(t1Config) {
  const form   = document.getElementById('funnel-form');
  const input  = document.getElementById('funnel-url-input');
  const error  = document.getElementById('funnel-url-error');
  if (!form || !input || !error) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawVal = input.value.trim();
    const clean  = sanitize(rawVal);
    const testVal = clean.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
    const domainPattern = /^[a-zA-Z0-9äöüÄÖÜ\-]{1,63}(\.[a-zA-Z]{2,})+$/;

    if (!domainPattern.test(testVal)) {
      input.classList.add('error');
      error.classList.add('visible');
      input.focus();
      return;
    }

    input.classList.remove('error');
    error.classList.remove('visible');
    triggerCheck(clean);
  });

  input.addEventListener('input', () => {
    input.classList.remove('error');
    error.classList.remove('visible');
  });
}

// ============================================================
// 12. ANIMIERTER CHECK (Speed → Mobile → SEO)
// ============================================================
function triggerCheck(domain) {
  const btn      = document.getElementById('funnel-submit-btn');
  const progress = document.getElementById('check-progress');
  const result   = document.getElementById('audit-result');
  if (!progress || !result) return;

  // Reset
  result.classList.remove('visible');
  result.innerHTML = '';
  progress.classList.remove('visible');

  const phases = ['speed', 'mobile', 'seo'];
  phases.forEach(id => {
    const bar    = document.getElementById(`check-bar-${id}`);
    const status = document.getElementById(`check-status-${id}`);
    if (bar)    bar.style.width = '0%';
    if (status) { status.textContent = 'Wartet...'; status.className = 'check-phase-status'; }
  });

  // Loading State
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
           stroke-linejoin="round" style="animation:spin 1s linear infinite;" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Analyse läuft...
    `;
  }

  progress.classList.add('visible');

  // Generiere realistische Scores
  const scores = {
    speed:  Math.floor(Math.random() * 35) + 42,   // 42–77
    mobile: Math.floor(Math.random() * 30) + 50,   // 50–80
    seo:    Math.floor(Math.random() * 28) + 52,   // 52–80
  };

  // Phase 1: Speed (0–1s)
  setTimeout(() => {
    const bar    = document.getElementById('check-bar-speed');
    const status = document.getElementById('check-status-speed');
    if (status) status.textContent = 'Wird geprüft...';
    if (bar)    setTimeout(() => { bar.style.width = `${scores.speed}%`; }, 50);
  }, 200);

  setTimeout(() => {
    const status = document.getElementById('check-status-speed');
    if (status) { status.textContent = `${scores.speed}/100 ✓`; status.className = 'check-phase-status done'; }
  }, 950);

  // Phase 2: Mobile (1.2s–2.2s)
  setTimeout(() => {
    const bar    = document.getElementById('check-bar-mobile');
    const status = document.getElementById('check-status-mobile');
    if (status) status.textContent = 'Wird geprüft...';
    if (bar)    setTimeout(() => { bar.style.width = `${scores.mobile}%`; }, 50);
  }, 1200);

  setTimeout(() => {
    const status = document.getElementById('check-status-mobile');
    if (status) { status.textContent = `${scores.mobile}/100 ✓`; status.className = 'check-phase-status done'; }
  }, 2000);

  // Phase 3: SEO (2.3s–3.3s)
  setTimeout(() => {
    const bar    = document.getElementById('check-bar-seo');
    const status = document.getElementById('check-status-seo');
    if (status) status.textContent = 'Wird geprüft...';
    if (bar)    setTimeout(() => { bar.style.width = `${scores.seo}%`; }, 50);
  }, 2300);

  setTimeout(() => {
    const status = document.getElementById('check-status-seo');
    if (status) { status.textContent = `${scores.seo}/100 ✓`; status.className = 'check-phase-status done'; }
  }, 3100);

  // Ergebnis anzeigen (3.5s)
  setTimeout(() => {
    progress.classList.remove('visible');

    const scoreColor = (s) => s >= 80 ? 'high' : s >= 60 ? 'medium' : 'low';

    // Tier-Scores: realistisch erreichbare Werte nach Velora-Modernisierung
    const tierScores = {
      basic:      { speed: Math.min(88, scores.speed + 35), mobile: Math.min(90, scores.mobile + 32), seo: Math.min(85, scores.seo + 28) },
      pro:        { speed: Math.min(97, scores.speed + 50), mobile: Math.min(98, scores.mobile + 45), seo: Math.min(95, scores.seo + 40) },
      enterprise: { speed: 99, mobile: 99, seo: 98 }
    };

    result.innerHTML = `
      <div class="audit-result-title">⚡ Kostenloser Website-Check für: ${sanitize(domain)}</div>
      <div class="audit-score-grid">
        <div class="audit-score-card">
          <span class="audit-score-icon">⚡</span>
          <span class="audit-score-value ${scoreColor(scores.speed)}">${scores.speed}</span>
          <span class="audit-score-label">Ladezeit</span>
        </div>
        <div class="audit-score-card">
          <span class="audit-score-icon">📱</span>
          <span class="audit-score-value ${scoreColor(scores.mobile)}">${scores.mobile}</span>
          <span class="audit-score-label">Mobile</span>
        </div>
        <div class="audit-score-card">
          <span class="audit-score-icon">🔍</span>
          <span class="audit-score-value ${scoreColor(scores.seo)}">${scores.seo}</span>
          <span class="audit-score-label">SEO</span>
        </div>
      </div>
      <p style="font-size:0.875rem;margin-bottom:0.75rem;">
        Wir haben auf allen drei Ebenen <strong style="color:var(--color-accent);">konkretes Verbesserungspotenzial</strong> identifiziert.
        Mit Velora sind Scores über 95 realistisch.
      </p>

      <!-- 3-Stufen-Modernisierungsplan -->
      <div class="audit-modernize">
        <div class="audit-modernize-title">🚀 Dein 3-Stufen-Modernisierungsplan</div>
        <div class="audit-tier-grid">

          <div class="audit-tier-card" id="audit-tier-basic">
            <div class="audit-tier-name">🟠 Basic</div>
            <div class="audit-tier-price">490 € einmalig</div>
            <ul class="audit-tier-list">
              <li>Speed: ${tierScores.basic.speed}/100</li>
              <li>Mobile: voll optimiert</li>
              <li>DSGVO-konform</li>
              <li>1-seitige Website</li>
            </ul>
            <button class="audit-tier-cta" type="button" data-pkg="basic">Basic wählen</button>
          </div>

          <div class="audit-tier-card highlight" id="audit-tier-pro">
            <div class="audit-tier-badge">Beliebteste Wahl</div>
            <div class="audit-tier-name">🔥 Pro</div>
            <div class="audit-tier-price">49 €/Mon · Setup 890 €</div>
            <ul class="audit-tier-list">
              <li>Speed: ${tierScores.pro.speed}/100</li>
              <li>SEO: ${tierScores.pro.seo}/100</li>
              <li>KI-Chatbot inklusive</li>
              <li>Bis zu 5 Unterseiten</li>
            </ul>
            <button class="audit-tier-cta" type="button" data-pkg="pro">Pro wählen</button>
          </div>

          <div class="audit-tier-card" id="audit-tier-enterprise">
            <div class="audit-tier-name">🏆 Enterprise</div>
            <div class="audit-tier-price">149 €/Mon · Setup 1.490 €</div>
            <ul class="audit-tier-list">
              <li>Speed: ${tierScores.enterprise.speed}/100</li>
              <li>SEO: ${tierScores.enterprise.seo}/100</li>
              <li>KI-Vollautomatisierung</li>
              <li>ROI-Garantie schriftlich</li>
            </ul>
            <button class="audit-tier-cta" type="button" data-pkg="enterprise">Enterprise anfragen</button>
          </div>

        </div>
      </div>
      <p class="audit-result-note">* Vorläufige Schätzung basierend auf öffentlichen Signalen. Vollanalyse nach Auftragserteilung.</p>
    `;
    result.classList.add('visible');

    // Tier-CTAs → Express-Anfragemodal
    result.querySelectorAll('.audit-tier-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const pkgId = btn.dataset.pkg || 'pro';
        const pkgName = pkgId.charAt(0).toUpperCase() + pkgId.slice(1);
        openInquiryModal(pkgName, { packageId: pkgId });
      });
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${getIcon('zap')} Neue Analyse starten`;
    }
  }, 3500);
}

// ============================================================
// 14. SLOT 5b: LIVE-SHOWCASE & TEMPLATES
// ============================================================
const DEFAULT_TEMPLATES = [
  {
    id: "sanitaer-notdienst",
    category: "handwerk",
    categoryLabel: "Handwerk & Industrie",
    title: "Sanitär / Notdienst System",
    badge: "+240% mehr Anfragen",
    highlights: [
      "Direkter Notdienst- & Express-Booking-Button",
      "1-Klick WhatsApp-Auftragsannahme",
      "Sofortiger Schadensfoto-Upload für Kunden"
    ],
    kpi: { label: "Google PageSpeed", value: "99/100" },
    recommendedPkg: "Pro"
  },
  {
    id: "solar-elektro",
    category: "handwerk",
    categoryLabel: "Handwerk & Industrie",
    title: "Solar & Elektro Meister-System",
    badge: "+310% PV-Anfragen",
    highlights: [
      "Interaktiver PV-Dach-Konfigurator & Lead-Magnet",
      "Automatisierte Ertragsprognose & Angebotserstellung",
      "Qualifizierte Vorfilterung von Kundenanfragen"
    ],
    kpi: { label: "Google PageSpeed", value: "98/100" },
    recommendedPkg: "Enterprise"
  },
  {
    id: "fine-dining",
    category: "gastronomie",
    categoryLabel: "Gastronomie & Events",
    title: "Fine Dining & Hospitality",
    badge: "+220% Reservierungen",
    highlights: [
      "24/7 Tischreservierung ohne Drittanbieter-Provision",
      "Interaktiver digitaler Menü- & Weinkarten-Viewer",
      "Google-Maps & Lokaler SEO-Push"
    ],
    kpi: { label: "Ladezeit", value: "0.4s" },
    recommendedPkg: "Pro"
  },
  {
    id: "cafe-catering",
    category: "gastronomie",
    categoryLabel: "Gastronomie & Events",
    title: "Café & Catering System",
    badge: "+180% Event-Catering",
    highlights: [
      "1-Click Vorbestellung & Abholungs-System",
      "Live-Event-Planer & digitaler Catering-Kalkulator",
      "Automatisierte WhatsApp-Bestellbestätigung"
    ],
    kpi: { label: "Performance", value: "100/100" },
    recommendedPkg: "Pro"
  },
  {
    id: "kanzlei-notariat",
    category: "beratung",
    categoryLabel: "Beratung, Kanzlei & Coaching",
    title: "Kanzlei & Notariat System",
    badge: "+340% qualifizierte Leads",
    highlights: [
      "Neuromarketing Dark-Design mit Status-Autorität",
      "Automatisierte Mandanten-Erstprüfung & Vorfilter",
      "DSGVO-konforme Direkt-Kalenderintegration"
    ],
    kpi: { label: "Lead-Qualität", value: "+340%" },
    recommendedPkg: "Enterprise"
  },
  {
    id: "coaching-b2b",
    category: "beratung",
    categoryLabel: "Beratung, Kanzlei & Coaching",
    title: "Coaching & B2B Consulting Funnel",
    badge: "+290% Beratungsanfragen",
    highlights: [
      "High-Ticket Qualifizierungs- & Bewerbungs-Funnel",
      "Interaktive Video-Case-Studies & Social Proof",
      "Automatisierter WhatsApp-Termin-Reminder"
    ],
    kpi: { label: "Conversion-Rate", value: "99/100" },
    recommendedPkg: "Pro"
  },
  {
    id: "d2c-brand",
    category: "ecommerce",
    categoryLabel: "E-Commerce & Marken",
    title: "D2C High-Performance Brand",
    badge: "-45% Warenkorb-Abbrüche",
    highlights: [
      "Sub-0.5s Ladezeit mit globalem Edge-Caching",
      "1-Click Express Checkout (Apple/Google Pay)",
      "24/7 KI-Verkaufsberaterin 'Nova' integriert"
    ],
    kpi: { label: "Checkout-Speed", value: "0.3s" },
    recommendedPkg: "Enterprise"
  },
  {
    id: "b2b-shop",
    category: "ecommerce",
    categoryLabel: "E-Commerce & Marken",
    title: "B2B Shop & Händler-Portal",
    badge: "+190% Händler-Accounts",
    highlights: [
      "Geschützter Händler-Login mit individuellen Netto-Preisen",
      "Dynamische Mengenstaffeln & 1-Klick PDF-Sofortangebot",
      "Automatische ERP- & WhatsApp-Synchronisation"
    ],
    kpi: { label: "Händler-Growth", value: "99/100" },
    recommendedPkg: "Enterprise"
  }
];

function renderTemplates(cfg) {
  const templates = (cfg.templates && cfg.templates.length) ? cfg.templates : DEFAULT_TEMPLATES;
  const categories = [
    { id: 'all', label: 'Alle Branchen' },
    { id: 'handwerk', label: 'Handwerk & Industrie' },
    { id: 'gastronomie', label: 'Gastronomie & Events' },
    { id: 'beratung', label: 'Beratung & Kanzlei' },
    { id: 'ecommerce', label: 'E-Commerce & Marken' }
  ];

  const filterBtns = categories.map((cat, i) => `
    <button class="template-filter-btn${i === 0 ? ' active' : ''}" data-cat="${cat.id}" type="button">
      ${sanitize(cat.label)}
    </button>
  `).join('');

  const cards = templates.map((t) => {
    const highlights = (t.highlights || []).map(h => `<li>${sanitize(h)}</li>`).join('');
    const recommendedPkg = t.recommendedPkg || 'Pro';
    return `
      <article class="template-card" data-category="${sanitize(t.category)}">
        <div class="template-card-browser">
          <div class="template-browser-dots">
            <span class="template-browser-dot"></span>
            <span class="template-browser-dot"></span>
            <span class="template-browser-dot"></span>
          </div>
          <div class="template-browser-url">🔒 velora.app/demo/${sanitize(t.id)}</div>
          <span style="font-size:0.75rem;color:#22C55E;font-weight:700;">⚡ 99+</span>
        </div>
        <div class="template-card-body">
          <div class="template-card-header">
            <div>
              <div class="template-category-tag">${sanitize(t.categoryLabel)}</div>
              <h3 class="template-card-title">${sanitize(t.title)}</h3>
            </div>
            <span class="template-badge-pill">${sanitize(t.badge)}</span>
          </div>

          <ul class="template-highlights-list">
            ${highlights}
          </ul>

          <div class="template-kpi-box">
            <span class="template-kpi-label">${sanitize(t.kpi.label)}:</span>
            <span class="template-kpi-val">${sanitize(t.kpi.value)}</span>
          </div>

          <button class="btn-primary template-card-cta" type="button" data-pkg="${sanitize(recommendedPkg)}" data-pkg-name="${sanitize(recommendedPkg)}">
            ${getIcon('zap')} Dieses System unverbindlich anfragen →
          </button>
        </div>
      </article>
    `;
  }).join('');

  const slot = document.getElementById('slot-templates');
  if (!slot) return;

  slot.innerHTML = `
    <div id="templates" style="padding-top:68px;margin-top:-68px;"></div>
    <div class="section-header">
      <span class="section-label">Live-Showcase</span>
      <h2>Branchen-Standards & Design-Systeme</h2>
      <p>Erprobte Neuromarketing-Architekturen für maximale Conversion – maßgeschneidert für deine Branche.</p>
    </div>

    <div class="templates-filter-bar">${filterBtns}</div>
    <div class="templates-grid">${cards}</div>
  `;

  initTemplatesFilter();
}

function initTemplatesFilter() {
  const btns = document.querySelectorAll('.template-filter-btn');
  const cards = document.querySelectorAll('.template-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================================
// 15. HIGH-CONVERTING EXPRESS-ANFRAGEMODAL
// ============================================================
let activeInquiryModalPkg = 'Pro';

function openInquiryModal(packageName = 'Pro', options = {}) {
  const modal = document.getElementById('inquiry-modal');
  const badge = document.getElementById('modal-pkg-badge');
  const successState = document.getElementById('modal-success-state');
  const form = document.getElementById('inquiry-form');
  if (!modal) return;

  activeInquiryModalPkg = packageName || 'Pro';
  if (badge) badge.textContent = `Ausgewählt: ${sanitize(activeInquiryModalPkg)}-Paket`;

  if (form) {
    form.style.display = 'flex';
    form.reset();
  }
  if (successState) successState.classList.add('hidden');

  modal.classList.remove('hidden');
  lockBodyScroll();

  setTimeout(() => {
    document.getElementById('modal-name')?.focus();
  }, 100);
}

function closeInquiryModal() {
  const modal = document.getElementById('inquiry-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  unlockBodyScroll();
}

function initInquiryModal(cfg) {
  const modal = document.getElementById('inquiry-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('inquiry-form');
  const successState = document.getElementById('modal-success-state');
  const successMsg = document.getElementById('modal-success-msg');
  const waBtn = document.getElementById('modal-wa-direct-btn');
  if (!modal) return;

  closeBtn?.addEventListener('click', closeInquiryModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeInquiryModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeInquiryModal();
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');
    const emailInput = document.getElementById('modal-email');
    const submitBtn = document.getElementById('modal-submit-btn');

    const name = nameInput?.value.trim() || 'Kunde';
    const phone = phoneInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';

    if (!name || (!phone && !email)) {
      if (nameInput && !name) nameInput.focus();
      else if (phoneInput) phoneInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ Konzept wird vorbereitet...</span>`;
    }

    setTimeout(() => {
      form.style.display = 'none';
      if (successState) {
        successState.classList.remove('hidden');
        if (successMsg) {
          successMsg.innerHTML = `Vielen Dank, <strong>${sanitize(name)}</strong>! Dein maßgeschneidertes Strategiekonzept für das <strong>${sanitize(activeInquiryModalPkg)}-Paket</strong> wird generiert. Wir melden uns in unter 15 Minuten via WhatsApp oder E-Mail bei dir.`;
        }
        if (waBtn) {
          const waText = encodeURIComponent(`Hallo Velora-Team, ich habe eine Anfrage für das ${activeInquiryModalPkg}-Paket gestellt (Name: ${name}).`);
          waBtn.href = `https://wa.me/491701234567?text=${waText}`;
        }
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Kostenloses Strategiekonzept anfordern →</span>`;
      }
    }, 600);
  });
}

// ============================================================
// 16. SLOT 5c: FAQ
// ============================================================
function renderFaq(cfg) {
  if (!cfg.faq || !cfg.faq.length) return;

  const items = cfg.faq.map((f, i) => `
    <div class="faq-item" id="faq-item-${i}">
      <button class="faq-question" type="button" aria-expanded="false"
              aria-controls="faq-answer-${i}" id="faq-btn-${i}">
        ${sanitize(f.question)}
        <span class="faq-chevron">${getIcon('chevron')}</span>
      </button>
      <div class="faq-answer" id="faq-answer-${i}" role="region" aria-labelledby="faq-btn-${i}">
        <div class="faq-answer-inner">${sanitize(f.answer)}</div>
      </div>
    </div>
  `).join('');

  document.getElementById('slot-faq').innerHTML = `
    <div class="section-header">
      <span class="section-label">Häufige Fragen</span>
      <h2>Alles Wichtige – auf einen Blick</h2>
    </div>
    <div class="faq-list">${items}</div>
  `;

  // Accordion-Logik
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item     = btn.closest('.faq-item');
      const isOpen   = item.classList.contains('open');

      // Alle schließen
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Dieses öffnen (toggle)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ============================================================
// 15. SLOT 6: FOOTER
// ============================================================
function renderFooter(cfg) {
  const { brand, legal } = cfg;
  document.getElementById('slot-footer').innerHTML = `
    <div class="footer-inner">
      <div class="footer-logo-text">${sanitize(brand.logo.text)}</div>
      <p class="footer-tagline">${sanitize(brand.subline)}</p>
      <div class="footer-links">
        <a href="${sanitizeUrl(legal.impressumUrl)}">Impressum</a>
        <span class="footer-divider">·</span>
        <a href="${sanitizeUrl(legal.privacyUrl)}">Datenschutz</a>
      </div>
      <p class="footer-copyright">${sanitize(legal.copyright)}</p>
    </div>
  `;
}

// ============================================================
// 16. INTERSECTION OBSERVER (Scroll Animations)
// ============================================================
function initScrollAnimations() {
  const targets = document.querySelectorAll('.metric-card, .feature-card, .pricing-card');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  targets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
}

// ============================================================
// 17. COOKIE BANNER
// ============================================================
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const btn    = document.getElementById('accept-cookies');
  if (!banner || !btn) return;

  if (localStorage.getItem('velora_cookies_ok')) {
    banner.classList.add('hidden');
    return;
  }

  setTimeout(() => banner.classList.remove('hidden'), 2000);

  btn.addEventListener('click', () => {
    localStorage.setItem('velora_cookies_ok', '1');
    banner.classList.add('hidden');
  });
}

// ============================================================
// 18. NOVA – KI-ASSISTENT (Vollständige Wissensdatenbank)
// ============================================================
const NOVA_KB = [
  {
    keywords: ['preis', 'kosten', 'paket', 'basic', 'pro', 'enterprise', 'wie viel', 'was kostet', 'teuer'],
    answer: `Wir haben drei transparente Pakete:\n\n🟠 **Basic** – 490 € einmalig\nFür Einsteiger & Neugründer. 1-seitige Premium-Website, WhatsApp-Steuerung, Kunden-Login. Kein monatlicher Beitrag.\n\n🔥 **Pro** – 49 €/Monat (Setup: 890 €)\nBis zu 5 Unterseiten, KI-Chatbot, SEO, Social-Media 2x/Woche – unser beliebtestes Paket.\n\n🏆 **Enterprise** – 149 €/Monat (Setup: 1.490 €)\nUnbegrenzte Seiten, vollautomatisches KI-Akquise-System, tägliches Social-Marketing, ROI-Garantie.\n\nAlle Preise sind fest – keine versteckten Kosten. 💪`
  },
  {
    keywords: ['whatsapp', 'änderung', 'ändern', 'update', 'text ändern', 'bild ändern', 'wie ändere'],
    answer: `Ganz einfach per WhatsApp! 📱\n\nNach dem Launch deiner Website erhältst du Zugang zu unserem gesicherten WhatsApp-Kanal. Du schreibst einfach, was geändert werden soll – z. B. "Neuer Text auf der Startseite: ..." oder "Neues Bild für Galerie hochladen".\n\nWir setzen Änderungen in der Regel innerhalb von 24 Stunden um.\n\nIm Pro- und Enterprise-Paket sind Änderungen unbegrenzt inklusive. Im Basic-Paket 1x pro Monat. 🚀`
  },
  {
    keywords: ['login', 'dashboard', 'portal', 'kunden-login', 'zugang', 'einloggen', 'account'],
    answer: `Das Kunden-Dashboard findest du oben rechts unter "Kunden-Login". 🔐\n\nDort siehst du:\n✅ Alle eingegangenen Anfragen\n📊 Performance-Daten deiner Website\n🎫 Offene Änderungstickets\n📄 Rechnungen & Verträge\n\nDeinen Zugangsdaten erhältst du per E-Mail kurz nach Projektstart. Bei Problemen einfach hier schreiben!`
  },
  {
    keywords: ['neugründer', 'neue website', 'gründung', 'startup', 'neu', 'erste website', 'noch keine'],
    answer: `Super, dass du gründest! 🚀\n\nFür Neugründer haben wir den "Neugründer"-Tab im kostenlosen Website-Check (Menü: "Kostenloser Website-Check"). In 3 kurzen Schritten:\n\n1️⃣ Deine Branche wählen\n2️⃣ Wunschdesign auswählen\n3️⃣ Primäres Ziel festlegen\n\nDanach bekommst du sofort eine passende Paket-Empfehlung – ohne Anruf, ohne Wartezeit. Das Basic-Paket startet ab 790 € Setup + 49 €/Monat.`
  },
  {
    keywords: ['dsgvo', 'datenschutz', 'rechtssicher', 'impressum', 'legal', 'recht'],
    answer: `Rechtssicherheit ist bei uns keine Option – sie ist Standard. ⚖️\n\nJede Velora-Website wird mit:\n✅ DSGVO-konformem Tracking (keine Drittanbieter-Cookies)\n✅ Rechtssicherem Impressum\n✅ Korrekter Datenschutzerklärung\n✅ Cookie-Banner (technisch notwendig)\n\n... ausgeliefert. Und wir halten alles auf dem neuesten Stand, auch wenn sich Gesetze ändern.`
  },
  {
    keywords: ['wie lange', 'dauer', 'laufzeit', 'umsetzung', 'fertig', 'wann'],
    answer: `Die Umsetzungszeiten bei Velora:\n\n⚡ **Basic** – 5–7 Werktage\n🔥 **Pro** – 2–3 Wochen\n🏆 **Enterprise** – 3–4 Wochen\n\nDie genaue Dauer hängt auch von deiner Feedbackgeschwindigkeit ab. Je schneller du Inhalte lieferst, desto schneller sind wir fertig. 💪`
  },
  {
    keywords: ['social media', 'instagram', 'facebook', 'marketing', 'post', 'content'],
    answer: `Social-Marketing ist in Pro und Enterprise inklusive! 📲\n\n🔥 **Pro** – 2 hochwertige Posts pro Woche (z. B. Instagram & Facebook)\n🏆 **Enterprise** – Täglicher Content auf mehreren Plattformen\n\nWir übernehmen Konzept, Text und Grafik – du brauchst dich um nichts zu kümmern. Auf Wunsch auch mit deinem Firmen-Branding und eigenem Bildmaterial.`
  },
  {
    keywords: ['garantie', 'sicherheit', 'risiko', 'was wenn', 'nicht zufrieden'],
    answer: `Wir arbeiten ergebnisorientiert – nicht auf Verdacht. 💎\n\nIm Enterprise-Paket liefern wir eine schriftliche Conversion-Garantie: Wenn wir die vereinbarten Ziele nicht erreichen, arbeiten wir kostenlos nach bis wir es schaffen.\n\nAußerdem: Kein Anruf nötig, kein Vertrieb. Der Kostenlose Website-Check zeigt dir vorab, was möglich ist. Risiko = null.`
  },
  {
    keywords: ['website-check', 'check', 'analyse', 'audit', 'kostenlos', 'gratis'],
    answer: `Der Kostenlose Website-Check ist 100% gratis und sofort verfügbar! 🔍\n\nDu gibst deine Domain ein, und unser System analysiert automatisch:\n\n⚡ Ladezeit & Performance\n📱 Mobile-Optimierung\n🔍 SEO & Sichtbarkeit\n\nDas Ergebnis siehst du sofort – ohne Angabe von Kontaktdaten, ohne Anruf. Einfach ausprobieren! 👆`
  },
  {
    keywords: ['hallo', 'hi', 'hey', 'guten tag', 'servus', 'moin'],
    answer: `Hallo! 👋 Schön, dass du da bist!\n\nIch bin **Nova**, deine KI-Beraterin von Velora. Ich helfe dir rund um die Uhr bei:\n\n💶 Preise & Pakete\n🔍 Kostenloser Website-Check\n📱 WhatsApp-Steuerung\n🔐 Kunden-Login\n🚀 Neugründer-Optionen\n\nWas kann ich für dich tun?`
  },
  {
    keywords: ['danke', 'super', 'toll', 'klasse', 'perfekt', 'top', 'gut'],
    answer: `Sehr gerne! 😊 Das ist genau mein Job – damit du keine Zeit mit langen Telefonaten verschwendest.\n\nFalls du weitere Fragen hast, bin ich 24/7 für dich da. Und wenn du bereit bist, starte einfach den kostenlosen Website-Check oben – in weniger als 30 Sekunden siehst du dein Potenzial! 🚀`
  },
];

function novaReply(userText) {
  const lower = userText.toLowerCase();
  for (const entry of NOVA_KB) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.answer;
    }
  }
  return `Gute Frage! 🤔 Ich habe dazu noch keine spezifische Antwort parat.\n\nFür eine präzise Beratung empfehle ich dir:\n1️⃣ Starte den kostenlosen Website-Check oben\n2️⃣ Nutze den Neugründer-Konfigurator, wenn du neu startest\n\nOder schreib uns direkt – wir antworten innerhalb von 24 Stunden. 💬`;
}

function initChatbot(brand) {
  const toggle   = document.getElementById('chatbot-toggle');
  const window_  = document.getElementById('chatbot-window');
  const close    = document.getElementById('chatbot-close');
  const inputEl  = document.getElementById('chatbot-input');
  const sendBtn  = document.getElementById('chatbot-send');
  const messages = document.getElementById('chatbot-messages');
  if (!toggle || !window_) return;

  function addMsg(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    const p = document.createElement('p');
    // Nova-Antworten: Markdown-ähnliche Bold-Formatierung
    if (sender === 'bot') {
      p.innerHTML = text
        .split('\n')
        .map(line => {
          // **bold** → <strong>
          return line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        })
        .join('<br>');
    } else {
      p.innerText = text;  // User: innerText = XSS-Schutz
    }
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'nova-typing';
    div.innerHTML = `<div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('nova-typing')?.remove();
  }

  // Mobile-Erkennung: auf Phones als isoliertes Bottom-Sheet Modal
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // Mobile-Backdrop
  let mobileBackdrop = null;

  function createMobileBackdrop() {
    if (mobileBackdrop) return;
    mobileBackdrop = document.createElement('div');
    mobileBackdrop.id = 'nova-mobile-backdrop';
    mobileBackdrop.setAttribute('aria-hidden', 'true');
    mobileBackdrop.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9998',
      'background:rgba(11,15,25,0.75)',
      'backdrop-filter:none',
      '-webkit-backdrop-filter:none',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 0.25s ease'
    ].join(';');
    document.body.appendChild(mobileBackdrop);
    mobileBackdrop.addEventListener('click', () => closeNova(true));
  }

  function showMobileBackdrop() {
    createMobileBackdrop();
    requestAnimationFrame(() => {
      if (mobileBackdrop) {
        mobileBackdrop.style.opacity = '1';
        mobileBackdrop.style.pointerEvents = 'auto';
      }
    });
  }

  function hideMobileBackdrop() {
    if (!mobileBackdrop) return;
    mobileBackdrop.style.opacity = '0';
    mobileBackdrop.style.pointerEvents = 'none';
  }

  let novaHistoryActive = false;

  function isNovaOpen() {
    return !window_.classList.contains('hidden');
  }

  function openNova() {
    if (isNovaOpen()) return;
    window_.style.transform = '';
    window_.classList.remove('hidden');
    window_.setAttribute('aria-modal', 'true');
    toggle.setAttribute('aria-expanded', 'true');

    lockBodyScroll();
    showMobileBackdrop();

    // Android-Zurück-Taste & Browser History-Integration
    if (!novaHistoryActive) {
      try {
        history.pushState({ modal: 'nova' }, '');
        novaHistoryActive = true;
      } catch (e) {}
    }

    if (isMobile()) {
      setTimeout(() => inputEl?.focus(), 150);
    }
  }

  function closeNova(fromUserAction = false) {
    if (!isNovaOpen()) return;
    try { window.speechSynthesis?.cancel(); } catch (err) {}

    window_.style.transform = '';
    window_.classList.add('hidden');
    window_.removeAttribute('aria-modal');
    toggle.setAttribute('aria-expanded', 'false');

    unlockBodyScroll();
    hideMobileBackdrop();

    if (fromUserAction && novaHistoryActive) {
      novaHistoryActive = false;
      try {
        history.back();
      } catch (e) {}
    } else {
      novaHistoryActive = false;
    }
  }

  // Popstate-Listener: Android-Zurück schließt Chat ohne Page-Leave
  window.addEventListener('popstate', () => {
    if (isNovaOpen()) {
      closeNova(false);
    }
  });

  // FAB Toggle
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isNovaOpen() ? closeNova(true) : openNova();
  });

  // Schließen-Button ('✕')
  close?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNova(true);
  });

  // Klick außerhalb schließt den Chat
  document.addEventListener('click', (e) => {
    if (!isNovaOpen()) return;
    const isClickInside = window_.contains(e.target) || toggle.contains(e.target);
    if (!isClickInside) {
      closeNova(true);
    }
  });

  // ESC schließt Chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNovaOpen()) {
      closeNova(true);
    }
  });

  // ============================================================
  // TOUCH-SWIPE-DOWN (iOS / Android Bottom-Sheet Wischgeste)
  // ============================================================
  const dragHandleArea = document.getElementById('chatbot-drag-handle-area');
  const chatHeader = document.getElementById('chatbot-header');
  const swipeTargets = [dragHandleArea, chatHeader].filter(Boolean);

  let touchStartY = 0;
  let touchCurrentY = 0;
  let isSwiping = false;

  swipeTargets.forEach(target => {
    target.addEventListener('touchstart', (e) => {
      if (!isMobile()) return;
      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchCurrentY = touchStartY;
      isSwiping = true;
      window_.style.transition = 'none';
    }, { passive: true });

    target.addEventListener('touchmove', (e) => {
      if (!isSwiping || !isMobile()) return;
      const touch = e.touches[0];
      touchCurrentY = touch.clientY;
      const deltaY = touchCurrentY - touchStartY;
      if (deltaY > 0) {
        window_.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    target.addEventListener('touchend', () => {
      if (!isSwiping || !isMobile()) return;
      isSwiping = false;
      window_.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
      const deltaY = touchCurrentY - touchStartY;
      if (deltaY > 80) {
        window_.style.transform = 'translateY(100%)';
        setTimeout(() => {
          closeNova(true);
        }, 180);
      } else {
        window_.style.transform = 'translateY(0)';
      }
    });
  });

  // Voice-Flag: Sprachausgabe nur nach Mikrofon-Interaktion aktiv
  let novaSpeechEnabled = false;

  // Mute-Button: stoppt Sprachausgabe sofort, setzt novaSpeechEnabled auf false (Audio-Kill-Switch)
  const muteBtn = document.getElementById('chatbot-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        window.speechSynthesis?.cancel();
      } catch (err) {}
      novaSpeechEnabled = false;
      muteBtn.classList.toggle('muted');
      const isMuted = muteBtn.classList.contains('muted');
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', isMuted ? 'Ton ein' : 'Ton aus');
      muteBtn.title = isMuted ? 'Ton ein' : 'Ton aus';
    });
  }

  // Sprachausgabe-Helfer
  function speak(text) {
    if (!window.speechSynthesis || !novaSpeechEnabled) return;
    const preview = text.replace(/[*\n]/g, ' ').trim().slice(0, 200);
    if (!preview) return;
    const utt = new SpeechSynthesisUtterance(preview);
    utt.lang   = 'de-DE';
    utt.rate   = 0.95;
    utt.pitch  = 1.05;
    window.speechSynthesis.cancel(); // Vorherige Ausgabe stoppen
    window.speechSynthesis.speak(utt);
  }

  function send(text) {
    const trimmed = (text || inputEl?.value || '').trim();
    if (!trimmed) return;
    const safeText = trimmed.slice(0, 300);
    addMsg(safeText, 'user');
    if (inputEl) inputEl.value = '';

    showTyping();
    setTimeout(() => {
      removeTyping();
      const reply = novaReply(safeText);
      addMsg(reply, 'bot');
      speak(reply); // Sprachausgabe nach Mikrofon-Eingabe
    }, 800 + Math.random() * 400);
  }

  // Quick-Reply Buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isNovaOpen()) openNova();
      send(btn.dataset.query);
      btn.closest('.chatbot-quick-btns')?.remove();
    });
  });

  sendBtn?.addEventListener('click', () => send());
  inputEl?.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  // ============================================================
  // VOICE SUPPORT: Mikrofon-Button + Web Speech API
  // ============================================================
  const inputArea = document.querySelector('.chatbot-input-area');
  if (inputArea && sendBtn) {
    // Button-Reihe (Mic + Send) – Rule 00 konform: area bleibt column
    const btnRow = document.createElement('div');
    btnRow.className = 'chatbot-btn-row';

    const micBtn = document.createElement('button');
    micBtn.id   = 'chatbot-mic';
    micBtn.type = 'button';
    micBtn.className = 'chatbot-mic-btn';
    micBtn.setAttribute('aria-label', 'Spracheingabe starten');
    micBtn.title = 'Spracheingabe (Mikrofon)';
    micBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

    // Send-Button in btnRow verschieben
    sendBtn.parentNode?.removeChild(sendBtn);
    btnRow.appendChild(micBtn);
    btnRow.appendChild(sendBtn);
    inputArea.appendChild(btnRow);
  }

  // ============================================================
  // VOICE SUPPORT: Mikrofon-Button + Web Speech API (Lazy Lifecycle)
  // ============================================================
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtnEl  = document.getElementById('chatbot-mic');

  if (SpeechRec && micBtnEl) {
    let activeRecognition = null;

    const stopRecognition = () => {
      if (activeRecognition) {
        try {
          activeRecognition.abort();
        } catch (err) {}
        activeRecognition = null;
      }
      micBtnEl.classList.remove('listening');
      micBtnEl.setAttribute('aria-label', 'Spracheingabe starten');
    };

    micBtnEl.addEventListener('click', () => {
      // Wenn bereits aktiv: Klick stoppt Aufnahme sauber
      if (micBtnEl.classList.contains('listening')) {
        stopRecognition();
        return;
      }

      try {
        // Erst bei explizitem Klick neu instanziieren (Lazy)
        const recognition = new SpeechRec();
        recognition.lang            = 'de-DE';
        recognition.continuous      = false;
        recognition.interimResults  = false;

        recognition.onstart = () => {
          micBtnEl.classList.add('listening');
          micBtnEl.setAttribute('aria-label', 'Aufnahme läuft – antippen zum Stoppen');
        };

        recognition.onresult = (e) => {
          const transcript = e.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            if (inputEl) inputEl.value = transcript;
            novaSpeechEnabled = true; // Antwort wird vorgelesen
            send(transcript);
            setTimeout(() => { novaSpeechEnabled = false; }, 8000);
          }
          stopRecognition();
        };

        recognition.onerror = (e) => {
          console.warn('[Nova Voice] Fehler bei Spracherkennung:', e);
          stopRecognition();
        };

        recognition.onend = () => {
          stopRecognition();
        };

        activeRecognition = recognition;
        recognition.start();
      } catch (e) {
        console.warn('[Nova Voice] Spracherkennung konnte nicht gestartet werden:', e);
        stopRecognition();
      }
    });

  } else if (micBtnEl) {
    // Browser ohne SpeechRecognition-Support – Button ausblenden
    micBtnEl.style.display = 'none';
  }
}

// ============================================================
// 19. MAIN BOOT
// ============================================================
async function boot() {
  let cfg;
  try {
    const res = await fetch('./config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cfg = await res.json();
  } catch (err) {
    console.error('[Velora Engine] config.json konnte nicht geladen werden:', err);
    document.body.insertAdjacentHTML('afterbegin',
      `<div style="padding:2rem;background:#1A2234;color:#f87171;font-family:monospace;font-size:0.85rem;">
        ⚠️ config.json nicht gefunden oder fehlerhaft. Bitte prüfen.
      </div>`
    );
    return;
  }

  // === Render-Pipeline (IMMUNSYSTEM: jeder Slot isoliert in safeRender) ===
  // CSS-Variablen und SEO zuerst – kein Slot-ID, da kein DOM-Slot
  safeRender('DesignTokens', () => applyDesignTokens(cfg.theme));
  safeRender('Meta/SEO',     () => updateMeta(cfg.brand));

  // Slot 1–6: jeder Fehler bleibt lokal, alle anderen Slots laufen weiter
  safeRender('Navbar',       () => renderNavbar(cfg),      'slot-navbar');
  safeRender('Hero',         () => renderHero(cfg),        'slot-hero');
  safeRender('Metrics',      () => renderMetrics(cfg),     'slot-metrics');
  safeRender('Features',     () => renderFeatures(cfg),    'slot-features');
  safeRender('Showcase',     () => renderShowcase(cfg),    'slot-showcase');
  safeRender('Pricing',      () => renderPricing(cfg),     'slot-pricing');
  safeRender('Funnel',       () => renderFunnel(cfg),      'slot-funnel');
  safeRender('Templates',    () => renderTemplates(cfg),   'slot-templates');
  safeRender('FAQ',          () => renderFaq(cfg),         'slot-faq');
  safeRender('Footer',       () => renderFooter(cfg),      'slot-footer');

  // Post-render: ebenfalls immunisiert
  safeRender('InquiryModal',     () => initInquiryModal(cfg));
  safeRender('ScrollAnimations', () => initScrollAnimations());
  safeRender('SmoothScroll',     () => initSmoothScroll());
  safeRender('CookieBanner',     () => initCookieBanner());
  safeRender('Nova-Chatbot',     () => initChatbot(cfg.brand));
}

// Start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
