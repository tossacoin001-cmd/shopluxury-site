/* ============================================================
   SHOPKYLUXURY — SHOP (PLP) RENDERER
   Reads filters from the URL (?cat= / ?occasion= / ?sort=),
   renders the product grid from KY.PRODUCTS, keeps the URL
   shareable, and re-paints on currency change.
   ============================================================ */
(function () {
  var KY = window.KY;
  var grid = document.getElementById('shopGrid');
  if (!KY || !grid) return;

  var qs = new URLSearchParams(location.search);
  var state = {
    cat: qs.get('cat') || 'all',
    occasion: qs.get('occasion') || 'all',
    sort: qs.get('sort') || 'featured'
  };

  function matches(p) {
    if (state.cat !== 'all' && p.cats.indexOf(state.cat) === -1) return false;
    if (state.occasion !== 'all' && (p.occasions || []).indexOf(state.occasion) === -1) return false;
    return true;
  }

  function sorted(list) {
    var l = list.slice();
    if (state.sort === 'low') l.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'high') l.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'az') l.sort(function (a, b) { return a.name.localeCompare(b.name); });
    // 'featured' keeps catalog order
    return l;
  }

  function card(p) {
    var v = p.images[0];
    var cur = KY.getCurrency();
    return '' +
      '<a class="card reveal in" href="product.html?id=' + p.id + '">' +
        '<div class="ph">' +
          (p.badge ? '<span class="tag">' + p.badge + '</span>' : '') +
          '<img loading="lazy" src="' + KY.card(v) + '" srcset="' + KY.srcset(v) + '" ' +
            'sizes="(max-width:560px) 50vw, (max-width:900px) 33vw, 300px" alt="' + p.name + '">' +
        '</div>' +
        '<div class="meta"><span class="nm">' + p.name + '</span>' +
          '<span class="pr" data-price="' + p.price + '">' + KY.money(p.price, cur) + '</span></div>' +
      '</a>';
  }

  function render() {
    var list = sorted(KY.PRODUCTS.filter(matches));
    document.getElementById('shopCount').textContent =
      list.length + (list.length === 1 ? ' piece' : ' pieces');
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<p class="shop-empty">Nothing in this edit yet. Try another filter.</p>';

    // active pills
    document.querySelectorAll('[data-filter-cat]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.filterCat === state.cat);
    });
    document.querySelectorAll('[data-filter-occ]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.filterOcc === state.occasion);
    });
    var sortSel = document.getElementById('shopSort');
    if (sortSel) sortSel.value = state.sort;
  }

  function pushUrl() {
    var q = new URLSearchParams();
    if (state.cat !== 'all') q.set('cat', state.cat);
    if (state.occasion !== 'all') q.set('occasion', state.occasion);
    if (state.sort !== 'featured') q.set('sort', state.sort);
    var s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  // wire filters
  document.querySelectorAll('[data-filter-cat]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.cat = b.dataset.filterCat; pushUrl(); render();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('[data-filter-occ]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.occasion = b.dataset.filterOcc; pushUrl(); render();
    });
  });
  var sortSel = document.getElementById('shopSort');
  if (sortSel) sortSel.addEventListener('change', function () {
    state.sort = sortSel.value; pushUrl(); render();
  });

  document.addEventListener('ky:currency', render);

  // title reflects an incoming category/occasion deep link
  var heading = document.getElementById('shopHeading');
  if (heading) {
    var c = KY.CATEGORIES.find(function (x) { return x.id === state.cat; });
    var o = KY.OCCASIONS.find(function (x) { return x.id === state.occasion; });
    if (o) heading.innerHTML = 'Dressed for <em>' + o.label.replace(/^The /, '') + '</em>';
    else if (c) heading.innerHTML = c.label.replace('&', '&amp;') + ', <em>curated.</em>';
  }

  render();
})();
