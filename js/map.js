/* ========================================
   PORT MAP — Leaflet + MarkerCluster
   ======================================== */

(function () {
  'use strict';

  const mapEl      = document.getElementById('portMap');
  const mapLoading = document.getElementById('mapLoading');
  const mapWrap    = document.getElementById('mapWrap');
  const toggleBtn  = document.getElementById('mapToggleBtn');
  const subtitle   = document.getElementById('mapSubtitle');

  if (!mapEl) return;
  if (typeof L === 'undefined') {
    if (mapLoading) mapLoading.textContent = 'Map could not load — check your connection.';
    return;
  }

  const coords = (typeof PORTS_COORDS !== 'undefined') ? PORTS_COORDS : {};

  // --- Init map ---
  const map = L.map('portMap', {
    center: [20, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 14,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  // MapTiler Ocean tiles — beautiful for a cruise site
  var MT_KEY = 'OrcSz4pPmgruW0vaOZWV';
  L.tileLayer('https://api.maptiler.com/maps/ocean/{z}/{x}/{y}.png?key=' + MT_KEY, {
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 18,
    tileSize: 256,
    crossOrigin: true,
  }).addTo(map);

  // --- Region colors ---
  const regionColors = {
    'Caribbean':                '#0099cc',
    'Mediterranean':            '#e67e22',
    'Northern Europe & Baltic': '#3498db',
    'Alaska':                   '#1abc9c',
    'South Pacific':            '#9b59b6',
    'Asia':                     '#e74c3c',
    'North America':            '#2ecc71',
    'South America':            '#f39c12',
    'Australia & New Zealand':  '#16a085',
    'Africa & Indian Ocean':    '#d35400',
    'Arctic & Greenland':       '#7f8c8d',
    'Antarctica':               '#95a5a6',
    'Pacific Coast':            '#27ae60',
    'Middle East':              '#c0392b',
    'Panama Canal':             '#8e44ad',
  };

  function markerColor(region) {
    return regionColors[region] || '#00a8cc';
  }

  function createIcon(color) {
    return L.divIcon({
      className: '',
      html: '<div class="map-pin" style="background:' + color + '; box-shadow: 0 0 0 3px ' + color + '44;"></div>',
      iconSize:  [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -10],
    });
  }

  function buildPopupHtml(port, color) {
    return '<div class="map-popup">' +
      '<div class="map-popup-region" style="background:' + color + '">' + port.region + '</div>' +
      '<div class="map-popup-name">' + port.display_name + '</div>' +
      (port.description_short ? '<p class="map-popup-desc">' + port.description_short + '</p>' : '') +
      '<button class="map-popup-btn" data-display="' + encodeURIComponent(port.display_name) + '">View Details →</button>' +
      '</div>';
  }

  function buildMarker(port) {
    const latLng = coords[port.display_name];
    if (!latLng) return null;
    const color  = markerColor(port.region);
    const marker = L.marker(latLng, { icon: createIcon(color) });
    marker.bindPopup(buildPopupHtml(port, color), { maxWidth: 260, className: 'map-popup-wrap' });
    marker.on('popupopen', function () {
      setTimeout(function () {
        const btn = document.querySelector('.map-popup-btn[data-display="' + encodeURIComponent(port.display_name) + '"]');
        if (!btn) return;
        btn.addEventListener('click', function () {
          map.closePopup();
          if (typeof openModal === 'function') {
            var meta = (typeof REGIONS_META !== 'undefined' && REGIONS_META[port.region]) ? REGIONS_META[port.region] : {};
            openModal(port, meta);
          }
        });
      }, 80);
    });
    return marker;
  }

  // --- Cluster group ---
  const cluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true,
    iconCreateFunction: function (c) {
      const n = c.getChildCount();
      const size = n < 10 ? 30 : n < 50 ? 36 : 42;
      return L.divIcon({
        html: '<div class="map-cluster" style="width:' + size + 'px;height:' + size + 'px;line-height:' + size + 'px;">' + n + '</div>',
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    },
  });

  // --- Add all pins ---
  let placed = 0;
  PORTS_DATA.forEach(function (port) {
    const m = buildMarker(port);
    if (m) { cluster.addLayer(m); placed++; }
  });

  map.addLayer(cluster);
  if (mapLoading) mapLoading.style.display = 'none';
  if (subtitle)   subtitle.textContent = placed + ' ports mapped worldwide';

  // --- Filter sync ---
  window.updateMapFilter = function (region) {
    cluster.clearLayers();
    const list = (region === 'all') ? PORTS_DATA : PORTS_DATA.filter(function (p) { return p.region === region; });
    let count = 0;
    list.forEach(function (port) {
      const m = buildMarker(port);
      if (m) { cluster.addLayer(m); count++; }
    });
    if (subtitle) {
      subtitle.textContent = (region === 'all')
        ? placed + ' ports mapped worldwide'
        : count + ' ports · ' + region;
    }
    if (cluster.getLayers().length > 0) {
      try { map.fitBounds(cluster.getBounds().pad(0.1), { maxZoom: 7, animate: true }); } catch (e) {}
    }
  };

  // --- Toggle ---
  if (toggleBtn) {
    var mapVisible = true;
    toggleBtn.addEventListener('click', function () {
      mapVisible = !mapVisible;
      mapWrap.style.display = mapVisible ? '' : 'none';
      toggleBtn.innerHTML = mapVisible
        ? 'Hide Map <span class="map-toggle-caret">▴</span>'
        : 'Show Map <span class="map-toggle-caret">▾</span>';
      toggleBtn.setAttribute('aria-expanded', String(mapVisible));
      if (mapVisible) { setTimeout(function () { map.invalidateSize(); }, 50); }
    });
  }

  window._portMap = map;
})();
