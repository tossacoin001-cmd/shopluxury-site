/* ============================================================
   SHOPKYLUXURY — PRODUCT CATALOG (data layer)
   Single source of truth for shop, product, and home rails.
   Prices in USD; NGN derived at KY.RATE. Images are responsive
   variants hosted on the brand CDN. See CLAUDE.md §4 for the
   local-asset migration step before final launch.
   ============================================================ */
var KY = window.KY = window.KY || {};
KY.RATE = 1360;            // USD → NGN fallback; refreshed live by cart.js on load
KY.WA = '2348180305391';   // WhatsApp concierge
KY.IMG = 'https://shopkyluxury.com/wp-content/uploads/';

KY.CATEGORIES = [
  { id:'dresses', label:'Dresses' },
  { id:'kaftans', label:'Kaftans & Abayas' },
  { id:'sets',    label:'Two-Piece Sets' },
  { id:'evening', label:'Evening' },
  { id:'bottoms', label:'Bottoms' }
];

KY.OCCASIONS = [
  { id:'owambe',    label:'The Owambe',  note:'Aso-ebi adjacent · steal the aux' },
  { id:'dinner',    label:'Dinner Date', note:'Make him forget the menu' },
  { id:'vacation',  label:'Vacation Mode', note:'Zanzibar, Santorini, soft life' },
  { id:'boardroom', label:'The Boardroom', note:'But make it fashion' }
];

// Worldwide delivery — full country list (key markets pinned first).
KY.COUNTRIES = ['Nigeria','United States','United Kingdom','Canada','Ghana','South Africa','United Arab Emirates','Kenya',
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cambodia','Cameroon','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czechia',
  'Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan',
  'Kazakhstan','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','North Macedonia','Norway','Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Rwanda','Russia','Saint Lucia','Samoa','San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
  'Other'];

KY.PRODUCTS = [
  {
    id:"ostrich-abaya", name:"Ostrich Abaya", price:690,
    cats:["kaftans"], occasions:["owambe", "vacation"], badge:"Icon",
    sizes:["S", "M", "L", "XL", "XXL", "XXXL"], colors:["Blue", "Burnt Orange", "White"],
    blurb:"Feathers that move with grace and command the room. For the woman who dresses like the moment already belongs to her.",
    images:[[[300, "2026/05/1000608596-300x450.jpg"], [600, "2026/05/1000608596-600x900.jpg"], [683, "2026/05/1000608596-683x1024.jpg"], [768, "2026/05/1000608596-768x1152.jpg"], [1024, "2026/05/1000608596.jpg"]], [[300, "2026/05/1000608590-300x450.jpg"], [600, "2026/05/1000608590-600x900.jpg"], [683, "2026/05/1000608590-683x1024.jpg"], [768, "2026/05/1000608590-768x1152.jpg"], [1024, "2026/05/1000608590.jpg"]], [[300, "2026/05/1000608593-300x450.jpg"], [600, "2026/05/1000608593-600x900.jpg"], [683, "2026/05/1000608593-683x1024.jpg"], [768, "2026/05/1000608593-768x1152.jpg"], [1024, "2026/05/1000608593.jpg"]]]
  },
  {
    id:"pillastro-dress", name:"Pillastro", price:290,
    cats:["dresses", "evening"], occasions:["owambe", "dinner"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"Sequinned feathers and a beaded neckline that does the talking. She takes the spotlight and forgets to give it back.",
    images:[[[300, "2026/05/IMG-20260530-WA0026-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0026-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0026-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0026-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0026.jpg"]]]
  },
  {
    id:"aminat-knosh-dress", name:"Aminat Knosh", price:285,
    cats:["dresses"], occasions:["owambe", "dinner"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL", "XXXL"], colors:[],
    blurb:"Floor-sweeping drama, quietly. She never asks for the room — the room turns.",
    images:[[[300, "2026/05/1000608587-300x450.jpg"], [600, "2026/05/1000608587-600x900.jpg"], [683, "2026/05/1000608587-683x1024.jpg"], [768, "2026/05/1000608587-768x1152.jpg"], [1024, "2026/05/1000608587.jpg"]]]
  },
  {
    id:"ciara-dress", name:"Ciara", price:250,
    cats:["dresses", "evening"], occasions:["owambe", "dinner"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"A dress that enters before you do. Fully embellished mesh, cut for presence, not permission. When she's gone, she's gone.",
    images:[[[300, "2026/05/IMG-20260530-WA0016-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0016-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0016-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0016-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0016.jpg"]]]
  },
  {
    id:"rukky-dress", name:"Rukky", price:220,
    cats:["dresses"], occasions:["owambe", "dinner"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"Embellished mesh that moves like water. Floor-length, fully lit, impossible to talk over.",
    images:[[[300, "2026/05/IMG-20260530-WA0025-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0025-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0025-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0025-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0025.jpg"]]]
  },
  {
    id:"cardi-b-dress", name:"Cardi B", price:175,
    cats:["dresses", "evening"], occasions:["dinner", "owambe"], badge:"New",
    sizes:["XS", "S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"Mini, sequinned, embellished at the neck. Made for the spotlight and short on patience.",
    images:[[[300, "2026/05/IMG-20260530-WA0017-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0017-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0017-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0017-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0017.jpg"]]]
  },
  {
    id:"zooki-kaftan", name:"Zooki Kaftan", price:140,
    cats:["kaftans"], occasions:["owambe", "vacation"], badge:"New",
    sizes:["S", "M", "L", "XL"], colors:["Cream", "Green", "Pink"],
    blurb:"Ostrich feather details, a fully beaded neckline. Pure main character. No extra styling required.",
    images:[[[300, "2026/05/1000865587-300x411.jpg"], [600, "2026/05/1000865587-600x823.jpg"], [747, "2026/05/1000865587-747x1024.jpg"], [768, "2026/05/1000865587-768x1053.jpg"], [1071, "2026/05/1000865587.jpg"]], [[300, "2026/05/1000865584-300x436.jpg"], [600, "2026/05/1000865584-600x873.jpg"], [704, "2026/05/1000865584-704x1024.jpg"], [768, "2026/05/1000865584-768x1117.jpg"], [1040, "2026/05/1000865584.jpg"]], [[300, "2026/05/1000865590-1-300x400.jpg"], [600, "2026/05/1000865590-1-600x800.jpg"], [768, "2026/05/1000865590-1-768x1024.jpg"], [1086, "2026/05/1000865590-1.jpg"]]]
  },
  {
    id:"maple-kaftan", name:"Maple Kaftan", price:140,
    cats:["kaftans"], occasions:["vacation", "owambe"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:["Black", "Cream", "Green", "Pink"],
    blurb:"Dubai silk finished in lacey mesh. Soft, classy, built to stand out without trying.",
    images:[[[300, "2026/05/IMG-20260531-WA0098-300x533.jpg"], [576, "2026/05/IMG-20260531-WA0098-576x1024.jpg"], [600, "2026/05/IMG-20260531-WA0098-600x1066.jpg"], [768, "2026/05/IMG-20260531-WA0098-768x1365.jpg"], [941, "2026/05/IMG-20260531-WA0098.jpg"]], [[300, "2026/05/IMG-20260531-WA0099-300x489.jpg"], [600, "2026/05/IMG-20260531-WA0099-600x979.jpg"], [628, "2026/05/IMG-20260531-WA0099-628x1024.jpg"], [768, "2026/05/IMG-20260531-WA0099-768x1253.jpg"], [982, "2026/05/IMG-20260531-WA0099.jpg"]], [[300, "2026/05/IMG-20260531-WA0097-300x597.jpg"], [600, "2026/05/IMG-20260531-WA0097-600x1195.jpg"], [768, "2026/05/IMG-20260531-WA0097-768x1529.jpg"], [771, "2026/05/IMG-20260531-WA0097-771x1536.jpg"], [889, "2026/05/IMG-20260531-WA0097.jpg"]], [[300, "2026/05/IMG-20260531-WA0100-300x534.jpg"], [576, "2026/05/IMG-20260531-WA0100-576x1024.jpg"], [600, "2026/05/IMG-20260531-WA0100-600x1067.jpg"], [768, "2026/05/IMG-20260531-WA0100-768x1366.jpg"], [940, "2026/05/IMG-20260531-WA0100.jpg"]]]
  },
  {
    id:"miwa-corset-set", name:"Miwa Corset Set", price:140,
    cats:["sets"], occasions:["dinner", "boardroom"], badge:"Best Seller",
    sizes:["S", "M", "L", "XL", "XXL", "XXXL"], colors:["Blue", "Gold", "Multi-color"],
    blurb:"A corset bodice that cinches, a mesh midi that hugs. Structured. Feminine. Effortless.",
    images:[[[300, "2026/05/1000669112-300x300.jpg"], [600, "2026/05/1000669112-600x600.jpg"], [768, "2026/05/1000669112-768x768.jpg"], [1024, "2026/05/1000669112.jpg"]], [[300, "2026/05/1000669115-300x468.jpg"], [600, "2026/05/1000669115-600x937.jpg"], [656, "2026/05/1000669115-656x1024.jpg"], [768, "2026/05/1000669115-768x1199.jpg"], [1312, "2026/05/1000669115.jpg"]], [[300, "2026/05/1000669302-scaled-1-300x225.jpg"], [600, "2026/05/1000669302-scaled-1-600x450.jpg"], [768, "2026/05/1000669302-scaled-1-768x576.jpg"], [2560, "2026/05/1000669302-scaled-1.jpg"]], [[300, "2026/05/1000669301-scaled-1-300x400.jpg"], [600, "2026/05/1000669301-scaled-1-600x800.jpg"], [768, "2026/05/1000669301-scaled-1-768x1024.jpg"], [1920, "2026/05/1000669301-scaled-1.jpg"]]]
  },
  {
    id:"milan-dress", name:"Milan", price:95,
    cats:["dresses"], occasions:["dinner", "boardroom"], badge:"New",
    sizes:["S", "M", "L", "XL"], colors:[],
    blurb:"Velvet, a slit, embellishment where it counts. For dinners that turn into stories.",
    images:[[[300, "2026/05/IMG-20260530-WA0028-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0028-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0028-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0028-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0028.jpg"]]]
  },
  {
    id:"kayla-halter-neck", name:"Kayla Halter Neck", price:95,
    cats:["dresses"], occasions:["dinner", "owambe"], badge:"New",
    sizes:["S", "M", "L", "XL"], colors:[],
    blurb:"Halter neck, tassel detail, a bodycon line. Elegant and engineered to turn heads.",
    images:[[[300, "2026/05/IMG-20260530-WA0030-300x400.jpg"], [600, "2026/05/IMG-20260530-WA0030-600x800.jpg"], [768, "2026/05/IMG-20260530-WA0030-768x1024.jpg"], [1086, "2026/05/IMG-20260530-WA0030.jpg"]]]
  },
  {
    id:"neinay-dress", name:"Neinay", price:95,
    cats:["dresses", "evening"], occasions:["dinner", "owambe"], badge:"New",
    sizes:["S", "M", "L", "XL"], colors:[],
    blurb:"Black, embellished, bodycon. Rich and certain — for the night that's about her.",
    images:[[[300, "2026/05/IMG-20260530-WA0031-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0031-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0031-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0031-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0031.jpg"]]]
  },
  {
    id:"kbs-dress", name:"Kbs", price:85,
    cats:["dresses"], occasions:["dinner"], badge:"New",
    sizes:["S", "M", "L", "XL"], colors:[],
    blurb:"Bandage that sculpts and holds. The statement piece for a classy night out.",
    images:[[[300, "2026/05/IMG-20260530-WA0035-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0035-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0035-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0035-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0035.jpg"]]]
  },
  {
    id:"nola-dress", name:"Nola", price:85,
    cats:["dresses", "evening"], occasions:["dinner", "owambe"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"Sheer mesh over bandage. A red-carpet moment, within reach.",
    images:[[[300, "2026/05/IMG-20260530-WA0037-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0037-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0037-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0037-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0037.jpg"]]]
  },
  {
    id:"kanyin-dress", name:"Kanyin", price:85,
    cats:["dresses"], occasions:["owambe", "dinner"], badge:"New",
    sizes:["S", "M", "L"], colors:[],
    blurb:"Party red, formal, unafraid. Made to turn heads at every entrance.",
    images:[[[300, "2026/05/IMG-20260530-WA0036-300x451.jpg"], [600, "2026/05/IMG-20260530-WA0036-600x901.jpg"], [682, "2026/05/IMG-20260530-WA0036-682x1024.jpg"], [768, "2026/05/IMG-20260530-WA0036-768x1154.jpg"], [1023, "2026/05/IMG-20260530-WA0036.jpg"]]]
  },
  {
    id:"abebi-tassel-dress", name:"Abebi Tassel", price:80,
    cats:["kaftans"], occasions:["vacation", "owambe"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:[],
    blurb:"Dubai silk in blue and red tassel fringe. Soft, classy, made to be seen.",
    images:[[[300, "2026/05/IMG-20260531-WA0007-300x451.jpg"], [600, "2026/05/IMG-20260531-WA0007-600x901.jpg"], [682, "2026/05/IMG-20260531-WA0007-682x1024.jpg"], [768, "2026/05/IMG-20260531-WA0007-768x1154.jpg"], [1023, "2026/05/IMG-20260531-WA0007.jpg"]], [[300, "2026/05/IMG-20260531-WA0102-300x521.jpg"], [589, "2026/05/IMG-20260531-WA0102-589x1024.jpg"], [600, "2026/05/IMG-20260531-WA0102-600x1043.jpg"], [768, "2026/05/IMG-20260531-WA0102-768x1335.jpg"], [951, "2026/05/IMG-20260531-WA0102.jpg"]], [[300, "2026/05/IMG-20260531-WA0101-300x527.jpg"], [583, "2026/05/IMG-20260531-WA0101-583x1024.jpg"], [600, "2026/05/IMG-20260531-WA0101-600x1054.jpg"], [768, "2026/05/IMG-20260531-WA0101-768x1349.jpg"], [946, "2026/05/IMG-20260531-WA0101.jpg"]]]
  },
  {
    id:"abeke-tassel-kaftan", name:"Abeke Tassel Kaftan", price:80,
    cats:["kaftans"], occasions:["vacation"], badge:"New",
    sizes:["S", "M", "L", "XL", "XXL"], colors:["Blue", "Cream"],
    blurb:"Tassel-fringed Dubai silk. Easy elegance that moves when she does.",
    images:[[[300, "2026/05/IMG-20260531-WA0002-300x504.jpg"], [600, "2026/05/IMG-20260531-WA0002-600x1007.jpg"], [610, "2026/05/IMG-20260531-WA0002-610x1024.jpg"], [768, "2026/05/IMG-20260531-WA0002-768x1289.jpg"], [968, "2026/05/IMG-20260531-WA0002.jpg"]], [[300, "2026/05/IMG-20260531-WA0003-300x451.jpg"], [600, "2026/05/IMG-20260531-WA0003-600x901.jpg"], [682, "2026/05/IMG-20260531-WA0003-682x1024.jpg"], [768, "2026/05/IMG-20260531-WA0003-768x1154.jpg"], [1023, "2026/05/IMG-20260531-WA0003.jpg"]], [[300, "2026/05/IMG-20260531-WA0104-300x528.jpg"], [582, "2026/05/IMG-20260531-WA0104-582x1024.jpg"], [600, "2026/05/IMG-20260531-WA0104-600x1056.jpg"], [768, "2026/05/IMG-20260531-WA0104-768x1352.jpg"], [945, "2026/05/IMG-20260531-WA0104.jpg"]], [[300, "2026/05/IMG-20260531-WA0105-300x511.jpg"], [600, "2026/05/IMG-20260531-WA0105-600x1022.jpg"], [601, "2026/05/IMG-20260531-WA0105-601x1024.jpg"], [768, "2026/05/IMG-20260531-WA0105-768x1308.jpg"], [961, "2026/05/IMG-20260531-WA0105.jpg"]]]
  },
  {
    id:"body-sculpt-line-legis", name:"Body Sculpt Legis", price:45,
    cats:["bottoms"], occasions:["boardroom"], badge:"Essential",
    sizes:[], colors:[],
    blurb:"A sculpting line that holds everything in place. The base layer that does the quiet work.",
    images:[[[300, "2026/05/IMG-20260408-WA0001-300x450.jpg"], [600, "2026/05/IMG-20260408-WA0001-600x900.jpg"], [683, "2026/05/IMG-20260408-WA0001-683x1024.jpg"], [768, "2026/05/IMG-20260408-WA0001-768x1152.jpg"], [1024, "2026/05/IMG-20260408-WA0001.jpg"]]]
  },
];

/* ---------- helpers ---------- */
KY.byId = function(id){ return KY.PRODUCTS.find(function(p){ return p.id===id; }); };
KY.usd = function(n){ return '$' + n.toLocaleString('en-US'); };
KY.ngn = function(n){ return '₦' + Math.round(n*KY.RATE).toLocaleString('en-US'); };
KY.money = function(n, cur){ return cur==='ngn' ? KY.ngn(n) : KY.usd(n); };
// Build a srcset string from an image's [w,path] variants.
KY.srcset = function(variants){ return variants.map(function(v){ return KY.IMG+v[1]+' '+v[0]+'w'; }).join(', '); };
// Largest variant = main src fallback.
KY.src = function(variants){ return KY.IMG + variants[variants.length-1][1]; };
// A mid variant (~600w) for cards.
KY.card = function(variants){ var m=variants.find(function(v){return v[0]>=600;})||variants[variants.length-1]; return KY.IMG+m[1]; };
