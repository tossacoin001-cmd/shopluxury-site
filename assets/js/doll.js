/* ============================================================
   ASK DOLL — the SHOPKYLUXURY concierge (client widget)
   - Floating launcher + chat panel, injected on every page.
   - Talks to /api/doll (Claude). If that's unavailable — no key,
     out of credits, offline, or a static host with no function —
     it silently falls back to a local brand brain so the customer
     never sees a failure. WhatsApp handoff is always one tap away.
   Depends on products.js (window.KY).
   ============================================================ */
(function () {
  var KY = window.KY || {};
  var WA = KY.WA || '2348180305391';
  var mem = {};
  function read(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return k in mem ? mem[k] : d; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }

  var messages = [];   // {role, content} — plain text, sent to the API
  var greeted = false;
  var busy = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function money(n) { return KY.money ? KY.money(n, KY.getCurrency ? KY.getCurrency() : 'usd') : ('$' + n); }
  function plink(p) { return '<a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>'; }
  function waLink(text) {
    return 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function waBtn(label) {
    return '<a class="doll-wa" href="' + waLink('') + '" target="_blank" rel="noopener">' + (label || 'Chat on WhatsApp') + ' →</a>';
  }

  /* ---------- catalog snapshot for the AI ---------- */
  function catalogText() {
    if (!KY.PRODUCTS) return '';
    return KY.PRODUCTS.map(function (p) {
      var bits = [p.name, KY.usd ? KY.usd(p.price) : ('$' + p.price), (p.cats || []).join('/')];
      if (p.sizes && p.sizes.length) bits.push('sizes ' + p.sizes.join(','));
      if (p.colors && p.colors.length) bits.push('colours ' + p.colors.join(','));
      if (p.occasions && p.occasions.length) bits.push('for ' + p.occasions.join('/'));
      return '• ' + bits.join(' — ');
    }).join('\n');
  }

  /* ---------- mount ---------- */
  function mount() {
    if (document.querySelector('.doll-launch')) return;
    var w = document.createElement('div');
    w.innerHTML =
      '<button class="doll-launch" aria-label="Ask Doll, your stylist">' +
        '<span class="doll-ava">KY</span><span class="doll-launch-tx">Ask <b>Doll</b></span></button>' +
      '<section class="doll-panel" hidden role="dialog" aria-label="Chat with Doll, your stylist">' +
        '<header class="doll-head">' +
          '<div class="doll-id"><span class="doll-ava sm">KY</span><div><b>Doll</b><span class="doll-status">Your SHOPKYLUXURY stylist</span></div></div>' +
          '<button class="doll-x" aria-label="Close chat">Close</button>' +
        '</header>' +
        '<div class="doll-log" aria-live="polite"></div>' +
        '<div class="doll-chips"></div>' +
        '<form class="doll-form">' +
          '<input class="doll-in" type="text" autocomplete="off" placeholder="Ask Doll anything…" aria-label="Message Doll">' +
          '<button class="doll-send" type="submit" aria-label="Send">→</button>' +
        '</form>' +
      '</section>';
    document.body.appendChild(w);

    w.querySelector('.doll-launch').addEventListener('click', open);
    w.querySelector('.doll-x').addEventListener('click', close);
    w.querySelector('.doll-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = w.querySelector('.doll-in');
      var t = input.value.trim();
      if (t) { input.value = ''; ask(t); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function open() {
    mount();
    var panel = document.querySelector('.doll-panel');
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('show'); document.body.classList.add('doll-open'); });
    if (!greeted) {
      greeted = true;
      greet();
    }
    setTimeout(function () { var i = document.querySelector('.doll-in'); if (i) i.focus(); }, 300);
  }
  function close() {
    var panel = document.querySelector('.doll-panel');
    if (!panel) return;
    panel.classList.remove('show');
    document.body.classList.remove('doll-open');
    setTimeout(function () { panel.hidden = true; }, 300);
  }

  /* ---------- rendering ---------- */
  function add(role, html, isHtml) {
    var log = document.querySelector('.doll-log');
    var row = document.createElement('div');
    row.className = 'doll-msg ' + (role === 'user' ? 'me' : 'doll');
    row.innerHTML = isHtml ? html : esc(html).replace(/\n/g, '<br>');
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }
  function typing(on) {
    var log = document.querySelector('.doll-log');
    var t = log.querySelector('.doll-typing');
    if (on) {
      if (!t) {
        t = document.createElement('div');
        t.className = 'doll-msg doll doll-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        log.appendChild(t);
      }
    } else if (t) { t.remove(); }
    log.scrollTop = log.scrollHeight;
  }
  function chips(list) {
    var box = document.querySelector('.doll-chips');
    box.innerHTML = '';
    (list || []).forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'doll-chip';
      b.textContent = c;
      b.addEventListener('click', function () { ask(c); });
      box.appendChild(b);
    });
  }

  function greet() {
    add('doll', "Hey doll, I'm <b>Doll</b>, your SHOPKYLUXURY stylist. Tell me the occasion (owambe, dinner, vacation, the boardroom) or a piece you have your eye on, and I'll sort you out.", true);
    chips(['Owambe looks', 'Under $150', 'Shipping & returns', 'Talk to a human']);
  }

  /* ---------- ask: AI first, local brain on any failure ---------- */
  function ask(text) {
    if (busy) return;
    busy = true;
    chips([]);
    add('user', text);
    messages.push({ role: 'user', content: text });
    typing(true);

    tryServer(text).then(function (reply) {
      typing(false);
      add('doll', reply);
      messages.push({ role: 'assistant', content: reply });
    }).catch(function () {
      typing(false);
      var local = localBrain(text);
      add('doll', local.html, true);
      messages.push({ role: 'assistant', content: local.text });
    }).then(function () { busy = false; });
  }

  function tryServer(text) {
    return new Promise(function (resolve, reject) {
      if (typeof fetch !== 'function') return reject();
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 22000);
      fetch('/api/doll', {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-16),
          catalog: catalogText(),
          currency: KY.getCurrency ? KY.getCurrency() : 'usd'
        })
      }).then(function (r) {
        clearTimeout(timer);
        if (!r.ok) return reject();
        return r.json().then(function (d) {
          if (d && d.reply) resolve(d.reply); else reject();
        }, reject);
      }, function () { clearTimeout(timer); reject(); });
    });
  }

  /* ---------- local brain (graceful fallback) ---------- */
  function recommend(occasion, max) {
    if (!KY.PRODUCTS) return [];
    var list = KY.PRODUCTS.filter(function (p) {
      return (p.occasions || []).indexOf(occasion) > -1;
    });
    return list.slice(0, max || 3);
  }
  function recHtml(list, lead) {
    if (!list.length) return '';
    return lead + '<ul class="doll-recs">' + list.map(function (p) {
      return '<li>' + plink(p) + ' <span class="doll-pr">' + money(p.price) + '</span></li>';
    }).join('') + '</ul>';
  }
  function findProduct(t) {
    if (!KY.PRODUCTS) return null;
    var low = t.toLowerCase();
    return KY.PRODUCTS.find(function (p) {
      var n = p.name.toLowerCase().replace(/^the /, '');
      return low.indexOf(n) > -1;
    });
  }

  function localBrain(text) {
    var t = (text || '').toLowerCase();
    var has = function () { for (var i = 0; i < arguments.length; i++) if (t.indexOf(arguments[i]) > -1) return true; return false; };
    var H = function (html) { return { html: html, text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }; };

    // human / order / complaint → WhatsApp
    if (has('human', 'agent', 'someone', 'person', 'representative', 'complain', 'complaint', 'wrong', 'refund my', 'speak to', 'talk to', 'call')) {
      return H("Of course, doll. Let me put you with a stylist who'll take care of it personally. " + waBtn('Chat on WhatsApp'));
    }
    if (has('buy', 'order', 'purchase', 'checkout', 'pay', 'payment', 'how do i get', 'how can i get')) {
      return H("Easy. Add your piece to the bag and checkout opens a WhatsApp chat with your order ready to send. You can pay by transfer, card, or on delivery in Lagos. Want to do it now? " + waBtn('Order on WhatsApp'));
    }
    // shipping
    if (has('ship', 'deliver', 'delivery', 'how long', 'when will', 'arrive', 'worldwide', 'international', 'abroad')) {
      return H("We deliver worldwide, doll. Lagos is same-day if you order before 2pm; the rest of Nigeria is 1–3 days; and international is 5–9 days, fully tracked with duties included to most places. Where are we sending her?");
    }
    // returns
    if (has('return', 'exchange', 'refund', 'swap', 'send back')) {
      return H("Exchanges are within 7 days, unworn with tags on. Bottoms and bodysuits are final for hygiene. Anything off with an order, tell us within 48 hours and we'll fix it fast. " + waBtn('Message the concierge'));
    }
    // sizing
    if (has('size', 'fit', 'measurement', 'measure', 'true to size', 'what size', 'bust', 'waist', 'hip')) {
      return H("Our pieces run <b>true to size</b>. Between two? Size up for comfort, or share your bust/waist/hip and I'll tell you exactly which. Full chart here: <a href=\"care.html#sizing\">size guide</a>.");
    }
    // store / visit
    if (has('store', 'shop location', 'address', 'visit', 'where are you', 'location', 'open', 'hour', 'boutique', 'appointment')) {
      return H("Come see us at <b>30B Admiralty Way, Lekki Phase 1, Lagos</b>, open daily, 10am–8pm. Private appointments are a thing (champagne optional, encouraged). Book one through the concierge. " + waBtn('Book an appointment'));
    }
    // occasion recs
    if (has('owambe', 'aso ebi', 'aso-ebi', 'party', 'wedding', 'event')) {
      var r = recommend('owambe', 3);
      if (r.length) return H(recHtml(r, "For an owambe, you want to <i>arrive</i>. A few that turn heads:") + '<p>Want me to narrow it by budget or size?</p>');
    }
    if (has('dinner', 'date', 'restaurant')) {
      var r2 = recommend('dinner', 3);
      if (r2.length) return H(recHtml(r2, "For dinner, elegant and a little dangerous:") + '<p>Shall I check your size on any of these?</p>');
    }
    if (has('vacation', 'beach', 'holiday', 'resort', 'soft life', 'travel')) {
      var r3 = recommend('vacation', 3);
      if (r3.length) return H(recHtml(r3, "Soft-life season. These move beautifully:"));
    }
    if (has('boardroom', 'work', 'office', 'corporate', 'business')) {
      var r4 = recommend('boardroom', 3);
      if (r4.length) return H(recHtml(r4, "The boardroom, but make it fashion:"));
    }
    // a specific named piece wins over a generic category
    var prod = findProduct(t);
    if (prod) {
      var sizes = prod.sizes && prod.sizes.length ? ' She comes in ' + prod.sizes.join(', ') + '.' : '';
      return H("<b>" + esc(prod.name) + "</b> · " + money(prod.price) + "." + sizes + " " + esc(prod.blurb || '') + ' ' + plink(prod) + ' · <a href="product.html?id=' + prod.id + '">view &amp; add to bag</a>');
    }
    if (has('kaftan', 'abaya')) {
      var rk = (KY.PRODUCTS || []).filter(function (p) { return p.cats.indexOf('kaftans') > -1; }).slice(0, 3);
      if (rk.length) return H(recHtml(rk, "Our kaftans &amp; abayas, in Dubai silk, feathers, and beadwork:"));
    }
    // budget
    var mUnder = t.match(/under\s*\$?\s*(\d+)/) || t.match(/below\s*\$?\s*(\d+)/) || t.match(/less than\s*\$?\s*(\d+)/);
    if (mUnder) {
      var cap = parseInt(mUnder[1], 10);
      var rb = (KY.PRODUCTS || []).filter(function (p) { return p.price <= cap; }).sort(function (a, b) { return b.price - a.price; }).slice(0, 4);
      if (rb.length) return H(recHtml(rb, "Under $" + cap + ", and still a moment:"));
      return H("Tell me a little more about the occasion and I'll find the right piece in budget, doll.");
    }
    // dresses / shop general
    if (has('dress', 'gown', 'outfit', 'something', 'recommend', 'suggest', 'show me', 'looking for', 'new')) {
      var rd = (KY.PRODUCTS || []).slice(0, 3);
      return H(recHtml(rd, "A few of the pieces women keep coming back for:") + '<p>Or tell me the occasion and I\'ll style you properly. <a href="shop.html">See everything</a>.</p>');
    }
    // greeting / thanks
    if (has('hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you')) {
      return H("Hey doll. What are we dressing for today: an occasion, or a piece you've seen?");
    }
    if (has('thank', 'thanks', 'thank you', 'love it', 'perfect')) {
      return H("Anytime, doll. I'm right here when you're ready.");
    }
    // fallback
    return H("I want to get this exactly right for you, doll. Tell me the occasion or the piece, or I'll connect you to a stylist who can help with anything. <a href=\"shop.html\">Browse the collection</a> or " + waBtn('chat on WhatsApp'));
  }

  /* ---------- boot ---------- */
  function boot() {
    mount();
    document.querySelectorAll('[data-open-doll]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.KY = window.KY || {};
  window.KY.openDoll = open;
})();
