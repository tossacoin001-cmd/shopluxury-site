/* ============================================================
   SHOPKYLUXURY — HOMEPAGE RENDERER
   Fills the "Just Landed" rail and The Edit category counts
   from KY.PRODUCTS so the homepage and shop never drift apart.
   ============================================================ */
(function () {
  var KY = window.KY;
  if (!KY) return;

  var cur = KY.getCurrency();

  // ---- Just Landed rail (first 8 by catalog/merch order) ----
  var rail = document.getElementById('newRail');
  if (rail) {
    rail.innerHTML = KY.PRODUCTS.slice(0, 8).map(function (p) {
      var v = p.images[0];
      return '<a class="card" href="product.html?id=' + p.id + '">' +
        '<div class="ph">' + (p.badge ? '<span class="tag">' + p.badge + '</span>' : '') +
          '<img loading="lazy" src="' + KY.card(v) + '" srcset="' + KY.srcset(v) +
          '" sizes="(max-width:560px) 72vw, 280px" alt="' + p.name + '"></div>' +
        '<div class="meta"><span class="nm">' + p.name + '</span>' +
          '<span class="pr" data-price="' + p.price + '">' + KY.money(p.price, cur) + '</span></div></a>';
    }).join('');
  }

  // ---- The Edit category counts ----
  document.querySelectorAll('[data-cat-count]').forEach(function (el) {
    var c = el.getAttribute('data-cat-count');
    var n = KY.PRODUCTS.filter(function (p) { return p.cats.indexOf(c) > -1; }).length;
    el.textContent = n + (n === 1 ? ' style' : ' styles');
  });

  KY.paintPrices();
})();
