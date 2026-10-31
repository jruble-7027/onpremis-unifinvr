// UniFi NVR Portal Logic

(function() {
  'use strict';

  const config = window.PORTAL_CONFIG || {
    districtName: "Campus Video Surveillance",
    portalTitle: "UniFi Protect Portal",
    portalSubtitle: "Direct Internal Network Streaming",
    nvrs: []
  };

  // State
  let currentTheme = localStorage.getItem('portal_theme') || 'dark';

  // Apply Initial Theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // SVG Icons helper
  const ICONS = {
    camera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    mapPin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    network: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    externalLink: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    shieldCheck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
    helpCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
  };

  // Helper: Construct full URL for an NVR link
  function buildNvrUrl(ip, port, path) {
    const isHttps = true;
    const protocol = isHttps ? 'https://' : 'http://';
    const portPart = (port && port !== 443 && port !== 80) ? `:${port}` : '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}${ip}${portPart}${cleanPath}`;
  }

  // Toast notification
  function showToast(message) {
    const toast = document.getElementById('toastNotice');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Copy to clipboard
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied to clipboard: ${text}`);
      }).catch(() => {
        promptFallback(text);
      });
    } else {
      promptFallback(text);
    }
  }

  function promptFallback(text) {
    window.prompt("Press Ctrl+C to copy:", text);
  }

  // Render Page Metadata
  function renderHeaderAndMetadata() {
    document.title = `${config.portalTitle} - ${config.districtName}`;
    
    const districtElem = document.getElementById('districtName');
    if (districtElem) districtElem.textContent = config.districtName;
    
    const titleElem = document.getElementById('portalTitle');
    if (titleElem) titleElem.textContent = config.portalTitle;
    
    const subElem = document.getElementById('portalSubtitle');
    if (subElem) subElem.textContent = config.portalSubtitle;

    // Notice banner
    const banner = document.getElementById('noticeBanner');
    if (banner && config.noticeBanner && config.noticeBanner.enabled) {
      banner.style.display = 'block';
      const badge = document.getElementById('bannerBadge');
      const msg = document.getElementById('bannerMessage');
      if (badge) badge.textContent = config.noticeBanner.badge;
      if (msg) msg.textContent = config.noticeBanner.message;
    } else if (banner) {
      banner.style.display = 'none';
    }

    // Support footer
    const itDept = document.getElementById('itSupportDept');
    if (itDept && config.itSupport) {
      itDept.innerHTML = `<strong>IT Support:</strong> ${config.itSupport.department} • Phone: ${config.itSupport.phone} • Email: <a href="mailto:${config.itSupport.email}" style="color:var(--accent-blue)">${config.itSupport.email}</a>`;
    }

    // Cloud Portal Banner
    const cloudCard = document.getElementById('cloudPortalCard');
    if (cloudCard) {
      if (config.cloudPortal && config.cloudPortal.enabled === false) {
        cloudCard.style.display = 'none';
      } else if (config.cloudPortal) {
        cloudCard.style.display = 'flex';
        const title = document.getElementById('cloudPortalTitle');
        const desc = document.getElementById('cloudPortalDesc');
        const btn = document.getElementById('cloudPortalBtn');
        if (title && config.cloudPortal.title) title.textContent = config.cloudPortal.title;
        if (desc && config.cloudPortal.description) desc.textContent = config.cloudPortal.description;
        if (btn) {
          if (config.cloudPortal.url) btn.href = config.cloudPortal.url;
          if (config.cloudPortal.buttonText) {
            btn.querySelector('span').textContent = config.cloudPortal.buttonText;
          }
        }
      }
    }
  }

  // Render NVR Cards
  function renderNvrCards(filterQuery = '') {
    const grid = document.getElementById('nvrGrid');
    if (!grid) return;

    const query = filterQuery.toLowerCase().trim();
    const nvrs = config.nvrs || [];

    const filtered = nvrs.filter(nvr => {
      if (!query) return true;
      return (
        nvr.name.toLowerCase().includes(query) ||
        nvr.model.toLowerCase().includes(query) ||
        nvr.location.toLowerCase().includes(query) ||
        nvr.ip.toLowerCase().includes(query) ||
        (nvr.coverageSummary && nvr.coverageSummary.toLowerCase().includes(query))
      );
    });

    // Update count stat
    const countBadge = document.getElementById('nvrCountStat');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${nvrs.length} NVRs Available`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No NVRs found matching "${query}"</p>
          <p style="font-size: 0.85rem;">Try searching for a different building name, IP address, or camera zone.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(nvr => {
      const colorClass = `color-${nvr.badgeColor || 'blue'}`;
      const mainProtectUrl = buildNvrUrl(nvr.ip, nvr.port, nvr.defaultView || '/protect');
      
      const targetWindow = `nvr_${nvr.id}`;
      
      const quickLinksHtml = (nvr.quickLinks || []).map(link => {
        const url = buildNvrUrl(nvr.ip, nvr.port, link.path);
        return `<a href="${url}" target="${targetWindow}" rel="noopener noreferrer" class="btn-quick-link">${link.label}</a>`;
      }).join('');

      return `
        <div class="nvr-card ${colorClass}" data-id="${nvr.id}">
          <div class="card-top">
            <div class="card-header-left">
              <h3 class="nvr-title">${nvr.name}</h3>
              <div class="nvr-model">${nvr.model}</div>
            </div>
            <div class="status-badge">
              <span class="stat-dot"></span>
              ${nvr.status === 'online' ? 'Online' : 'Standby'}
            </div>
          </div>

          <div class="card-details">
            <div class="detail-row">
              ${ICONS.mapPin}
              <span>${nvr.location}</span>
            </div>

            <div class="detail-row">
              ${ICONS.network}
              <span class="ip-badge">
                ${nvr.ip}
                <button class="copy-btn" title="Copy IP address" onclick="window.PortalApp.copyText('${nvr.ip}')">
                  ${ICONS.copy}
                </button>
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Port ${nvr.port || 443}</span>
            </div>

            ${nvr.cameraCount ? `
              <div class="detail-row">
                ${ICONS.camera}
                <span><strong>${nvr.cameraCount}</strong> Active Cameras</span>
              </div>
            ` : ''}

            ${nvr.coverageSummary ? `
              <div class="coverage-box">
                <strong>Coverage:</strong> ${nvr.coverageSummary}
              </div>
            ` : ''}
          </div>

          <div class="card-actions">
            <a href="${mainProtectUrl}" target="${targetWindow}" rel="noopener noreferrer" class="btn-launch">
              <span>Launch UniFi Protect</span>
              ${ICONS.externalLink}
            </a>

            ${quickLinksHtml ? `
              <div class="quick-links-row">
                ${quickLinksHtml}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render FAQs
  function renderFaqs() {
    const container = document.getElementById('faqContainer');
    if (!container || !config.faqs) return;

    container.innerHTML = config.faqs.map(faq => `
      <div class="faq-card">
        <h4>${ICONS.helpCircle} ${faq.question}</h4>
        <p>${faq.answer}</p>
      </div>
    `).join('');
  }

  // Setup Event Listeners
  function setupListeners() {
    // Search input
    const searchInput = document.getElementById('nvrSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNvrCards(e.target.value);
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('portal_theme', currentTheme);
        updateThemeIcon();
      });
      updateThemeIcon();
    }

    // SSL Help Modal
    const sslModal = document.getElementById('sslHelpModal');
    const sslTriggerBtn = document.getElementById('sslHelpBtn');
    const sslCloseBtn = document.getElementById('sslModalClose');

    if (sslTriggerBtn && sslModal) {
      sslTriggerBtn.addEventListener('click', () => {
        sslModal.classList.add('active');
      });
    }
    if (sslCloseBtn && sslModal) {
      sslCloseBtn.addEventListener('click', () => {
        sslModal.classList.remove('active');
      });
    }
    if (sslModal) {
      sslModal.addEventListener('click', (e) => {
        if (e.target === sslModal) sslModal.classList.remove('active');
      });
    }
  }

  function updateThemeIcon() {
    const iconContainer = document.getElementById('themeIcon');
    if (!iconContainer) return;
    iconContainer.innerHTML = currentTheme === 'dark' ? ICONS.sun : ICONS.moon;
  }

  // Initialize
  function init() {
    renderHeaderAndMetadata();
    renderNvrCards();
    renderFaqs();
    setupListeners();
  }

  // Expose global methods
  window.PortalApp = {
    copyText: copyText
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
