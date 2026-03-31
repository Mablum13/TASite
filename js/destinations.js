/* ========================================
   DESTINATIONS PAGE — Interactive Logic
   ======================================== */

// ---- State ----
let activeRegion = 'all';
let searchQuery  = '';
let searchTimer  = null;

// ---- DOM refs ----
const grid        = document.getElementById('portsGrid');
const emptyState  = document.getElementById('emptyState');
const resultsEl   = document.getElementById('resultsCount');
const searchInput = document.getElementById('portSearch');
const searchClear = document.getElementById('searchClear');
const modal       = document.getElementById('portModal');
const modalBody   = document.getElementById('modalBody');
const modalCta    = document.getElementById('modalCta');
const modalClose  = document.getElementById('modalClose');
const backdrop    = document.getElementById('modalBackdrop');
const floatingCta = document.getElementById('floatingCta');
const emptyReset  = document.getElementById('emptyReset');

// ---- Filter pills ----
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeRegion = pill.dataset.region;
    renderView();
  });
});

// ---- Search ----
searchInput.addEventListener('input', () => {
  const val = searchInput.value.trim();
  searchClear.classList.toggle('visible', val.length > 0);
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = val.toLowerCase();
    renderView();
  }, 200);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.classList.remove('visible');
  renderView();
  searchInput.focus();
});

emptyReset?.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.classList.remove('visible');
  activeRegion = 'all';
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.pill[data-region="all"]').classList.add('active');
  renderView();
});

// ---- Floating CTA visibility ----
window.addEventListener('scroll', () => {
  floatingCta.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });

// ---- Mobile nav ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

// ---- Filter & search logic ----
function getFilteredPorts() {
  return PORTS_DATA.filter(port => {
    const regionMatch = activeRegion === 'all' || port.region === activeRegion;
    if (!searchQuery) return regionMatch;
    const haystack = [port.name, port.country, port.region, port.description_short]
      .filter(Boolean).join(' ').toLowerCase();
    return regionMatch && haystack.includes(searchQuery);
  });
}

// ---- Render ----
function renderView() {
  const ports = getFilteredPorts();
  const isFiltered = activeRegion !== 'all' || searchQuery;

  grid.innerHTML = '';
  emptyState.hidden = ports.length > 0;
  grid.hidden = ports.length === 0;

  if (ports.length === 0) {
    resultsEl.textContent = 'No ports found.';
    return;
  }

  resultsEl.textContent = isFiltered
    ? `${ports.length} port${ports.length !== 1 ? 's' : ''} found`
    : '';

  if (isFiltered) {
    renderFlat(ports);
  } else {
    renderGrouped();
  }
}

function renderGrouped() {
  const regionOrder = Object.keys(REGIONS_META);
  const byRegion = {};
  PORTS_DATA.forEach(p => {
    if (!p.region) return;
    (byRegion[p.region] = byRegion[p.region] || []).push(p);
  });

  // Sort regions by defined order, then alphabetically
  const regions = regionOrder.filter(r => byRegion[r])
    .concat(Object.keys(byRegion).filter(r => !regionOrder.includes(r)).sort());

  regions.forEach(region => {
    const ports = byRegion[region];
    if (!ports) return;
    const meta = REGIONS_META[region] || { color: '#8ba0b4', emoji: '🌍' };

    const group = document.createElement('div');
    group.className = 'region-group';
    group.innerHTML = `
      <div class="region-heading">
        <span class="region-dot" style="background:${meta.color}"></span>
        <span class="region-heading-text">${meta.emoji} ${region}</span>
        <span class="region-heading-count">${ports.length} ports</span>
      </div>
      <div class="ports-grid-inner"></div>
    `;

    const innerGrid = group.querySelector('.ports-grid-inner');
    ports.forEach(port => innerGrid.appendChild(createCard(port, meta)));
    grid.appendChild(group);
  });
}

function renderFlat(ports) {
  const innerGrid = document.createElement('div');
  innerGrid.className = 'ports-grid-inner';
  ports.forEach(port => {
    const meta = REGIONS_META[port.region] || { color: '#8ba0b4', emoji: '🌍' };
    innerGrid.appendChild(createCard(port, meta));
  });
  grid.appendChild(innerGrid);
}

function createCard(port, meta) {
  const card = document.createElement('div');
  card.className = 'port-card';

  const badges = [
    port.is_gateway ? '<span class="badge badge-gateway">Embarkation</span>' : '',
    port.is_tender  ? '<span class="badge badge-tender">Tender</span>'       : '',
  ].filter(Boolean).join('');

  const desc = port.description_short || '';

  card.innerHTML = `
    <div class="card-color-bar" style="background:${meta.color}"></div>
    <div class="card-body">
      <div class="card-name">${escHtml(port.name)}</div>
      <div class="card-country">${escHtml(port.country)}</div>
      ${desc ? `<div class="card-desc">${escHtml(desc)}</div>` : ''}
    </div>
    <div class="card-footer">
      <div class="card-badges">${badges}</div>
      <span class="card-more">Learn more →</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(port, meta));
  return card;
}

// ---- Modal ----
function openModal(port, meta) {
  const typePill = port.is_gateway
    ? '<span class="modal-pill">✈ Embarkation Port</span>'
    : '<span class="modal-pill">⚓ Port Stop</span>';
  const tenderPill = port.is_tender
    ? '<span class="modal-pill">🚤 Tender Required</span>'
    : '<span class="modal-pill">🛳 Docks at Pier</span>';

  const desc = port.description_raw || port.description_short || 'No description available.';

  modalBody.innerHTML = `
    <div class="modal-region-badge" style="background:${meta.color}">
      ${meta.emoji} ${escHtml(port.region || '')}
    </div>
    <div class="modal-port-name">${escHtml(port.name)}</div>
    <div class="modal-country">${escHtml(port.country)}</div>
    <div class="modal-pills">
      ${typePill}
      ${tenderPill}
    </div>
    <hr class="modal-divider" />
    <div class="modal-section-label">About this destination</div>
    <div class="modal-description">${escHtml(desc)}</div>
  `;

  const encoded = encodeURIComponent(port.name);
  modalCta.href = `contact.html?port=${encoded}`;
  modalCta.textContent = `Plan a Cruise to ${port.name} →`;

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus trap
  setTimeout(() => modalClose.focus(), 50);
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

// ---- Utility ----
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Init ----
// Pre-select region from query param (?region=Caribbean)
(function () {
  const params = new URLSearchParams(window.location.search);
  const region = params.get('region');
  if (!region) return;
  const pill = document.querySelector(`.pill[data-region="${region}"]`);
  if (!pill) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeRegion = region;
  pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
})();

renderView();
