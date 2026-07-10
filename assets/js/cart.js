/* ============================================================
   SHOPKYLUXURY — BAG + CURRENCY ENGINE
   - Persistent bag (localStorage, in-memory fallback).
   - Slide-in drawer, injected once, shared by every page.
   - Global currency: drives every [data-price] element and
     every .cur-toggle, persisted and synced across pages.
   - Checkout hands off to the WhatsApp concierge with a
     formatted order — no payment gateway required for v1.
   Depends on products.js (window.KY).
   ============================================================ */
(function () {
  var KY = window.KY;
  if (!KY) return; // products.js must load first

  var BAG_KEY = 'ky-bag';
  var CUR_KEY = 'ky-cur';
  var mem = {};

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v == null ? fallback : v; }
    catch (e) { return key in mem ? mem[key] : fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { mem[key] = val; }
  }

  /* ---------- state ---------- */
  function getBag() {
    try { return JSON.parse(read(BAG_KEY, '[]')) || []; }
    catch (e) { return []; }
  }
  function setBag(bag) {
    write(BAG_KEY, JSON.stringify(bag));
    render();
  }
  KY.getCurrency = function () { return read(CUR_KEY, 'usd'); };

  KY.bagCount = function () {
    return getBag().reduce(function (n, i) { return n + i.qty; }, 0);
  };
  KY.bagTotal = function () {
    return getBag().reduce(function (sum, i) {
      var p = KY.byId(i.id); return sum + (p ? p.price * i.qty : 0);
    }, 0);
  };

  /* ---------- mutations ---------- */
  function sameLine(i, id, size, color) {
    return i.id === id && (i.size || '') === (size || '') && (i.color || '') === (color || '');
  }
  KY.addToBag = function (id, size, qty, color) {
    qty = qty || 1;
    var bag = getBag();
    var line = bag.find(function (i) { return sameLine(i, id, size, color); });
    if (line) line.qty += qty; else bag.push({ id: id, size: size, color: color || '', qty: qty });
    setBag(bag);
    KY.openBag();
  };
  function changeQty(id, size, color, delta) {
    var bag = getBag();
    var line = bag.find(function (i) { return sameLine(i, id, size, color); });
    if (!line) return;
    line.qty += delta;
    if (line.qty < 1) bag = bag.filter(function (i) { return i !== line; });
    setBag(bag);
  }
  function removeLine(id, size, color) {
    setBag(getBag().filter(function (i) { return !sameLine(i, id, size, color); }));
  }

  /* ---------- currency ---------- */
  KY.setCurrency = function (cur) {
    write(CUR_KEY, cur);
    paintPrices();
    document.querySelectorAll('.cur-toggle button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.cur === cur);
    });
    render();
    document.dispatchEvent(new CustomEvent('ky:currency', { detail: cur }));
  };
  // Any element with data-price="250" renders in the active currency.
  function paintPrices() {
    var cur = KY.getCurrency();
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var n = parseFloat(el.getAttribute('data-price'));
      if (!isNaN(n)) el.textContent = KY.money(n, cur);
    });
  }
  KY.paintPrices = paintPrices;

  /* ---------- delivery details (persisted, worldwide) ---------- */
  var SHIP_KEY = 'ky-ship';
  var REQUIRED = [['name', 'Full name'], ['phone', 'Phone'], ['country', 'Country'], ['city', 'City'], ['address', 'Delivery address']];
  var FIELDS = ['name', 'phone', 'email', 'country', 'state', 'city', 'zip', 'address', 'notes'];

  function loadShip() { try { return JSON.parse(read(SHIP_KEY, '{}')) || {}; } catch (e) { return {}; } }
  function saveShip(s) { write(SHIP_KEY, JSON.stringify(s)); }
  function gatherShip() {
    var o = {};
    FIELDS.forEach(function (k) { var el = document.getElementById('ship-' + k); if (el) o[k] = el.value.trim(); });
    return o;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shipFieldsHTML() {
    var s = loadShip();
    var def = s.country || 'Nigeria';
    var opts = (KY.COUNTRIES || ['Nigeria']).map(function (c) {
      return '<option' + (c === def ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    function f(label, control) { return '<label class="bag-field"><span>' + label + '</span>' + control + '</label>'; }
    function row(a, b) { return '<div class="bag-2col">' + a + b + '</div>'; }
    var v = function (k) { return esc(s[k]); };
    return '' +
      f('Full name', '<input id="ship-name" type="text" autocomplete="name" value="' + v('name') + '" required>') +
      f('Phone (with country code)', '<input id="ship-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+234 801 234 5678" value="' + v('phone') + '" required>') +
      f('Email (optional)', '<input id="ship-email" type="email" autocomplete="email" placeholder="you@email.com" value="' + v('email') + '">') +
      row(
        f('Country', '<select id="ship-country" autocomplete="country-name" required>' + opts + '</select>'),
        f('State / Province', '<input id="ship-state" type="text" autocomplete="address-level1" value="' + v('state') + '">')
      ) +
      row(
        f('City / Town', '<input id="ship-city" type="text" autocomplete="address-level2" value="' + v('city') + '" required>'),
        f('Postal / ZIP', '<input id="ship-zip" type="text" autocomplete="postal-code" value="' + v('zip') + '">')
      ) +
      f('Delivery address', '<textarea id="ship-address" rows="2" autocomplete="street-address" placeholder="Street, building, area, landmark" required>' + v('address') + '</textarea>') +
      f('Order notes (optional)', '<textarea id="ship-notes" rows="2" placeholder="Anything we should know?">' + v('notes') + '</textarea>');
  }

  /* ---------- drawer markup ---------- */
  function mountDrawer() {
    if (document.querySelector('.bag-drawer')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="bag-overlay" hidden></div>' +
      '<aside class="bag-drawer" hidden role="dialog" aria-modal="true" aria-label="Your shopping bag">' +
        '<header class="bag-head"><span class="bag-title">Your Bag</span>' +
          '<button class="bag-x" aria-label="Close bag">Close</button></header>' +
        '<div class="bag-scroll">' +
          '<div class="bag-items"></div>' +
          '<form class="bag-details" novalidate>' +
            '<button type="button" class="bag-details-toggle" aria-expanded="true"><span>Delivery details</span><i>▾</i></button>' +
            '<div class="bag-fields">' + shipFieldsHTML() + '</div>' +
          '</form>' +
        '</div>' +
        '<footer class="bag-foot">' +
          '<div class="bag-row"><span>Subtotal</span><b class="bag-sum"></b></div>' +
          '<p class="bag-fine">No payment here. Checkout sends your order <b>and</b> delivery address to our WhatsApp concierge to confirm.</p>' +
          '<p class="bag-err" hidden></p>' +
          '<a class="btn solid wide bag-checkout" href="#">Checkout on WhatsApp</a>' +
          '<button class="btn wide bag-keep">Keep shopping</button>' +
        '</footer>' +
      '</aside>';
    document.body.appendChild(wrap);

    wrap.querySelector('.bag-overlay').addEventListener('click', KY.closeBag);
    wrap.querySelector('.bag-x').addEventListener('click', KY.closeBag);
    wrap.querySelector('.bag-keep').addEventListener('click', KY.closeBag);
    wrap.querySelector('.bag-checkout').addEventListener('click', checkout);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') KY.closeBag();
    });

    // persist details as they type; clear validation state on edit
    var form = wrap.querySelector('.bag-details');
    form.addEventListener('input', function (e) {
      saveShip(gatherShip());
      var field = e.target.closest('.bag-field');
      if (field && e.target.value.trim()) field.classList.remove('invalid');
      var err = document.querySelector('.bag-err');
      if (err && !err.hidden && gatherShip()) {
        // hide the error once all required are filled
        var s = gatherShip();
        if (REQUIRED.every(function (r) { return s[r[0]]; })) err.hidden = true;
      }
    });
    // collapse / expand the details panel
    var toggle = wrap.querySelector('.bag-details-toggle');
    toggle.addEventListener('click', function () {
      var collapsed = form.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }
  function openDetails() {
    var form = document.querySelector('.bag-details');
    if (form) { form.classList.remove('collapsed'); form.querySelector('.bag-details-toggle').setAttribute('aria-expanded', 'true'); }
  }

  KY.openBag = function () {
    mountDrawer();
    render();
    document.querySelector('.bag-overlay').hidden = false;
    var d = document.querySelector('.bag-drawer');
    d.hidden = false;
    requestAnimationFrame(function () {
      document.querySelector('.bag-overlay').classList.add('show');
      d.classList.add('show');
    });
    document.body.style.overflow = 'hidden';
  };
  KY.closeBag = function () {
    var ov = document.querySelector('.bag-overlay');
    var d = document.querySelector('.bag-drawer');
    if (!d) return;
    ov.classList.remove('show'); d.classList.remove('show');
    setTimeout(function () { ov.hidden = true; d.hidden = true; }, 350);
    document.body.style.overflow = '';
  };

  /* ---------- render ---------- */
  function render() {
    // bag count badges everywhere
    var n = KY.bagCount();
    document.querySelectorAll('[data-bag-count]').forEach(function (el) { el.textContent = n; });
    document.querySelectorAll('.bag').forEach(function (el) {
      // keep the word "Bag" prefix if present
      var label = el.getAttribute('data-bag-label') || 'Bag';
      var span = el.querySelector('[data-bag-count]');
      if (!span) el.textContent = label + ' · ' + n;
    });

    var box = document.querySelector('.bag-items');
    if (!box) return;
    var bag = getBag();
    var cur = KY.getCurrency();
    if (!bag.length) {
      box.innerHTML = '<p class="bag-empty">Your bag is quiet. For now.</p>';
    } else {
      box.innerHTML = bag.map(function (i) {
        var p = KY.byId(i.id); if (!p) return '';
        var img = KY.card(p.images[0]);
        var meta = 'Size ' + (i.size || 'One size') + (i.color ? ' · ' + i.color : '');
        var d = 'data-id="' + p.id + '" data-sz="' + (i.size || '') + '" data-co="' + (i.color || '') + '"';
        return '' +
          '<div class="bag-item">' +
            '<img class="bag-thumb" src="' + img + '" alt="' + p.name + '" loading="lazy">' +
            '<div class="bag-info">' +
              '<a class="bag-nm" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
              '<span class="bag-sz">' + meta + '</span>' +
              '<div class="bag-qty">' +
                '<button class="qd" ' + d + ' aria-label="Decrease quantity">−</button>' +
                '<span>' + i.qty + '</span>' +
                '<button class="qi" ' + d + ' aria-label="Increase quantity">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="bag-end">' +
              '<span class="bag-pr">' + KY.money(p.price * i.qty, cur) + '</span>' +
              '<button class="bag-rm" ' + d + '>Remove</button>' +
            '</div>' +
          '</div>';
      }).join('');
      box.querySelectorAll('.qd').forEach(function (b) {
        b.addEventListener('click', function () { changeQty(b.dataset.id, b.dataset.sz, b.dataset.co, -1); });
      });
      box.querySelectorAll('.qi').forEach(function (b) {
        b.addEventListener('click', function () { changeQty(b.dataset.id, b.dataset.sz, b.dataset.co, 1); });
      });
      box.querySelectorAll('.bag-rm').forEach(function (b) {
        b.addEventListener('click', function () { removeLine(b.dataset.id, b.dataset.sz, b.dataset.co); });
      });
    }
    var sum = document.querySelector('.bag-sum');
    if (sum) sum.textContent = KY.money(KY.bagTotal(), cur);
    var co = document.querySelector('.bag-checkout');
    if (co) co.classList.toggle('is-disabled', !bag.length);
  }

  /* ---------- whatsapp checkout ---------- */
  function showErr(text) {
    var err = document.querySelector('.bag-err');
    if (err) { err.textContent = text; err.hidden = false; }
  }
  function checkout(e) {
    e && e.preventDefault();
    var bag = getBag();
    if (!bag.length) return;

    // require the essentials so the concierge can actually deliver
    var ship = gatherShip();
    var missing = REQUIRED.filter(function (r) { return !ship[r[0]]; });
    if (missing.length) {
      openDetails();
      REQUIRED.forEach(function (r) {
        var el = document.getElementById('ship-' + r[0]);
        if (el) el.closest('.bag-field').classList.toggle('invalid', !ship[r[0]]);
      });
      showErr('Please add your ' + missing.map(function (m) { return m[1].toLowerCase(); }).join(', ') + ' so we can deliver to you.');
      var first = document.getElementById('ship-' + missing[0][0]);
      if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus(); }
      return;
    }

    var cur = KY.getCurrency();
    var lines = bag.map(function (i) {
      var p = KY.byId(i.id); if (!p) return '';
      var opt = 'Size ' + (i.size || 'One size') + (i.color ? ', ' + i.color : '');
      return '• ' + p.name + ' (' + opt + ') ×' + i.qty +
        ' · ' + KY.money(p.price * i.qty, cur);
    }).filter(Boolean);

    var msg = "Hello SHOPKYLUXURY, I'd like to place an order:\n\n" +
      lines.join('\n') +
      '\n\nSubtotal: ' + KY.money(KY.bagTotal(), cur) +
      '\n\nDelivery details:' +
      '\nName: ' + ship.name +
      '\nPhone: ' + ship.phone +
      (ship.email ? '\nEmail: ' + ship.email : '') +
      '\nCountry: ' + ship.country +
      (ship.state ? '\nState/Province: ' + ship.state : '') +
      '\nCity: ' + ship.city +
      '\nAddress: ' + ship.address +
      (ship.zip ? '\nPostal/ZIP: ' + ship.zip : '') +
      (ship.notes ? '\nNotes: ' + ship.notes : '');

    window.open('https://wa.me/' + KY.WA + '?text=' + encodeURIComponent(msg), '_blank');
  }
  KY.checkout = checkout;

  /* ---------- live FX (USD → NGN) ---------- */
  // Keeps Naira current. Cached 12h; falls back silently to KY.RATE offline.
  function refreshRate() {
    var TTL = 12 * 60 * 60 * 1000;
    function apply(rate) {
      rate = parseFloat(rate);
      if (!rate || rate < 100) return;            // sanity guard
      KY.RATE = rate;
      paintPrices();
      render();
    }
    try {
      var cached = parseFloat(read('ky-rate', ''));
      var ts = parseInt(read('ky-rate-ts', '0'), 10);
      if (cached && (Date.now() - ts) < TTL) { apply(cached); return; }
    } catch (e) {}
    if (typeof fetch !== 'function') return;
    function cache(rate) {
      write('ky-rate', String(rate));
      write('ky-rate-ts', String(Date.now()));
    }
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var rate = d && d.rates && d.rates.NGN;
        if (rate) { apply(rate); cache(rate); } else { throw new Error('no rate'); }
      })
      .catch(function () {
        fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var rate = d && d.usd && d.usd.ngn;
            if (rate) { apply(rate); cache(rate); }
          })
          .catch(function () { /* offline — keep KY.RATE fallback */ });
      });
  }

  /* ---------- boot ---------- */
  function boot() {
    paintPrices();
    render();
    refreshRate();
    // wire any nav bag triggers
    document.querySelectorAll('[data-open-bag]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); KY.openBag(); });
    });
    // wire currency toggles (mark active)
    var cur = KY.getCurrency();
    document.querySelectorAll('.cur-toggle button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.cur === cur);
      b.addEventListener('click', function () { KY.setCurrency(b.dataset.cur); });
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
