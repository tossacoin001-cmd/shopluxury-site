/* ============================================================
   SHOPKYLUXURY — PRODUCT (PDP) RENDERER
   Reads ?id= from the URL, hydrates the page from KY.PRODUCTS:
   gallery, sizes, colours, price, add-to-bag, related rail,
   and Product JSON-LD for search. One template, every product.
   ============================================================ */
(function () {
  var KY = window.KY;
  var root = document.getElementById('pdp');
  if (!KY || !root) return;

  var id = new URLSearchParams(location.search).get('id');
  var p = KY.byId(id) || KY.PRODUCTS[0];
  var cur = KY.getCurrency();
  var catLabel = (KY.CATEGORIES.find(function (c) { return c.id === p.cats[0]; }) || {}).label || 'The Collection';
  var fullSrc = KY.src(p.images[0]);

  /* ---------- <head> + SEO ---------- */
  document.title = p.name + ' | SHOPKYLUXURY';
  setMeta('description', p.blurb + ' ' + KY.usd(p.price) + '. Worldwide delivery from Lagos.');
  setProp('og:title', p.name + ' | SHOPKYLUXURY');
  setProp('og:description', p.blurb);
  setProp('og:image', fullSrc);
  setLink('canonical', 'https://shopkyluxury.com/product.html?id=' + p.id);

  function setMeta(name, val) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function setProp(prop, val) {
    var m = document.querySelector('meta[property="' + prop + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('property', prop); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function setLink(rel, href) {
    var l = document.querySelector('link[rel="' + rel + '"]');
    if (!l) { l = document.createElement('link'); l.setAttribute('rel', rel); document.head.appendChild(l); }
    l.setAttribute('href', href);
  }

  /* ---------- breadcrumb ---------- */
  var crumb = document.getElementById('crumb');
  if (crumb) crumb.innerHTML =
    '<a href="index.html">Home</a><i>/</i>' +
    '<a href="shop.html?cat=' + p.cats[0] + '">' + catLabel + '</a><i>/</i>' +
    '<span class="here">' + p.name + '</span>';

  /* ---------- gallery ---------- */
  var multi = p.images.length > 1;
  var thumbs;
  if (multi) {
    thumbs = p.images.map(function (img, idx) {
      return '<button class="' + (idx === 0 ? 'on' : '') + '" data-src="' + KY.src(img) +
        '" data-srcset="' + KY.srcset(img) + '" aria-label="View ' + (idx + 1) + '">' +
        '<img src="' + KY.card(img) + '" alt=""></button>';
    }).join('');
  } else {
    // single image — offer framed/detail/hem crops via object-position
    var v = p.images[0];
    var crops = [['center 12%', '1', 'Full'], ['center 42%', '1.5', 'Detail'], ['center 85%', '1.25', 'Hem']];
    thumbs = crops.map(function (c, idx) {
      return '<button class="' + (idx === 0 ? 'on' : '') + '" data-pos="' + c[0] + '" data-zoom="' + c[1] +
        '" aria-label="' + c[2] + ' view"><img src="' + KY.card(v) + '" alt="" style="object-position:' + c[0] + ';transform:scale(' + c[1] + ')"></button>';
    }).join('');
  }

  /* ---------- options ---------- */
  var sizes = (p.sizes && p.sizes.length) ? p.sizes : ['S', 'M', 'L', 'XL'];
  var defaultSize = sizes.indexOf('M') > -1 ? 'M' : sizes[0];
  var sizeHTML = sizes.map(function (s) {
    return '<button class="' + (s === defaultSize ? 'on' : '') + '" data-size="' + s + '">' + s + '</button>';
  }).join('');

  var colorBlock = '';
  if (p.colors && p.colors.length) {
    colorBlock =
      '<div class="opt-label"><span>Colour: <i class="opt-val" id="colorVal">' + p.colors[0] + '</i></span></div>' +
      '<div class="colors" id="colors">' +
        p.colors.map(function (c, idx) {
          return '<button class="' + (idx === 0 ? 'on' : '') + '" data-color="' + c + '" title="' + c + '"><span class="sw" data-c="' + c.toLowerCase().replace(/\s+/g, '') + '"></span>' + c + '</button>';
        }).join('') +
      '</div>';
  }

  /* ---------- related ---------- */
  var related = KY.PRODUCTS.filter(function (x) {
    return x.id !== p.id && x.cats.some(function (c) { return p.cats.indexOf(c) > -1; });
  }).slice(0, 4);
  if (related.length < 4) {
    KY.PRODUCTS.forEach(function (x) {
      if (related.length < 4 && x.id !== p.id && related.indexOf(x) === -1) related.push(x);
    });
  }
  var relHTML = related.map(function (x) {
    var v = x.images[0];
    return '<a class="card" href="product.html?id=' + x.id + '">' +
      '<div class="ph"><img loading="lazy" src="' + KY.card(v) + '" srcset="' + KY.srcset(v) +
      '" sizes="(max-width:560px) 50vw, 280px" alt="' + x.name + '"></div>' +
      '<div class="meta"><span class="nm">' + x.name + '</span>' +
      '<span class="pr" data-price="' + x.price + '">' + KY.money(x.price, cur) + '</span></div></a>';
  }).join('');

  /* ---------- assemble ---------- */
  root.innerHTML =
    '<div class="gallery reveal in">' +
      '<div class="main-ph">' +
        '<span class="badge">' + (p.badge || 'SHOPKYLUXURY') + '</span>' +
        '<img id="mainImg" src="' + fullSrc + '" srcset="' + KY.srcset(p.images[0]) +
          '" sizes="(max-width:920px) 100vw, 600px" alt="' + p.name + ', front view">' +
      '</div>' +
      '<div class="thumbs">' + thumbs + '</div>' +
    '</div>' +
    '<div class="pdp-info reveal in">' +
      '<p class="kicker">' + catLabel + '</p>' +
      '<h1>' + emphasise(p.name) + '</h1>' +
      '<div class="price-row">' +
        '<span class="price" data-price="' + p.price + '">' + KY.money(p.price, cur) + '</span>' +
        '<small class="duties">Duties included</small>' +
      '</div>' +
      '<p class="desc">' + p.blurb + '</p>' +
      '<div class="opt-label"><span>Select size</span><a href="care.html#sizing">Size guide</a></div>' +
      '<div class="sizes" id="sizes">' + sizeHTML + '</div>' +
      '<p class="fit-note"><i>True to size.</i> Between sizes? Your stylist will advise on WhatsApp.</p>' +
      colorBlock +
      '<div class="ctas">' +
        '<button class="btn solid wide" id="addBtn">Add to bag · <span data-price="' + p.price + '">' + KY.money(p.price, cur) + '</span></button>' +
        '<a class="btn wide" id="waOrder" href="#">Order via WhatsApp Concierge</a>' +
      '</div>' +
      '<div class="promise"><span>Same-day Lagos</span><span>Worldwide shipping</span><span>Easy exchanges</span></div>' +
      '<div class="acc">' +
        '<details open><summary>The details</summary><div class="body">' + p.blurb + ' Designed in <b>Lagos</b>. Each piece is a limited run. When she\'s gone, she\'s gone.</div></details>' +
        '<details><summary>Fit &amp; care</summary><div class="body">True to size with a sculpting line. Dry clean only. <b>She\'s worth it</b>. Steam, never iron, any embellishment.</div></details>' +
        '<details><summary>Delivery &amp; returns</summary><div class="body">Lagos: same-day before 2 PM. Nigeria: 1–3 days. Worldwide: 5–9 days, tracked. Exchanges within <b>7 days</b>, unworn with tags. <a href="care.html#returns">Full policy</a>.</div></details>' +
      '</div>' +
    '</div>';

  // related rail
  var relMount = document.getElementById('relatedRail');
  if (relMount) relMount.innerHTML = relHTML;

  /* ---------- interactions ---------- */
  var mainImg = document.getElementById('mainImg');
  document.querySelectorAll('.thumbs button').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.thumbs button').forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      if (multi) {
        mainImg.style.objectPosition = 'center 15%';
        mainImg.style.transform = 'none';
        mainImg.src = t.dataset.src;
        mainImg.srcset = t.dataset.srcset;
      } else {
        mainImg.style.objectPosition = t.dataset.pos;
        mainImg.style.transform = 'scale(' + t.dataset.zoom + ')';
      }
    });
  });

  var selSize = defaultSize, selColor = (p.colors && p.colors[0]) || '';
  var sizesEl = document.getElementById('sizes');
  sizesEl.addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') return;
    sizesEl.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
    e.target.classList.add('on');
    selSize = e.target.dataset.size;
  });
  var colorsEl = document.getElementById('colors');
  if (colorsEl) colorsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    colorsEl.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    selColor = b.dataset.color;
    var cv = document.getElementById('colorVal'); if (cv) cv.textContent = selColor;
  });

  var addBtn = document.getElementById('addBtn');
  addBtn.addEventListener('click', function () {
    KY.addToBag(p.id, selSize, 1, selColor);
  });

  document.getElementById('waOrder').addEventListener('click', function (e) {
    e.preventDefault();
    var opt = 'Size ' + selSize + (selColor ? ', ' + selColor : '');
    var msg = "Hello SHOPKYLUXURY, I'm interested in the " + p.name + ' (' + opt + '), ' +
      KY.money(p.price, KY.getCurrency()) + '.\n\nIs she available?';
    window.open('https://wa.me/' + KY.WA + '?text=' + encodeURIComponent(msg), '_blank');
  });

  // repaint dynamic prices to active currency
  KY.paintPrices();

  /* ---------- JSON-LD ---------- */
  var ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, image: p.images.map(function (im) { return KY.src(im); }),
    description: p.blurb, brand: { '@type': 'Brand', name: 'SHOPKYLUXURY' },
    sku: p.id,
    offers: {
      '@type': 'Offer', priceCurrency: 'USD', price: p.price,
      availability: 'https://schema.org/InStock',
      url: 'https://shopkyluxury.com/product.html?id=' + p.id
    }
  };
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  /* ---------- helpers ---------- */
  function emphasise(name) {
    var parts = name.split(' ');
    if (parts.length === 1) return '<em>' + name + '</em>';
    var last = parts.pop();
    return parts.join(' ') + ' <em>' + last + '</em>';
  }
})();
