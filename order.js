/* Heaven & Eve — order flow
   Add-to-cart from the menu, a slide-in drawer, and a WhatsApp checkout. */
(function () {
  const PHONE = '2347033637329';
  const KEY = 'he-cart';

  /* ---------- State ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
  const naira = (n) => '₦' + Number(n).toLocaleString('en-NG');

  /* ---------- Elements ---------- */
  const fab = document.getElementById('cartFab');
  const fabCount = document.getElementById('fabCount');
  const scrim = document.getElementById('cartScrim');
  const drawer = document.getElementById('cartDrawer');
  const closeBtn = document.getElementById('cartClose');
  const body = document.getElementById('cartBody');
  const totalEl = document.getElementById('cartTotal');
  const sendBtn = document.getElementById('cartSend');
  const noteEl = document.getElementById('cartNote');
  const navOrder = document.getElementById('navOrder');
  if (!fab || !drawer) return;

  /* ---------- Inject "add" buttons into menu rows ---------- */
  document.querySelectorAll('.menu-item').forEach((row) => {
    const nameEl = row.querySelector('.mi-name');
    const priceEl = row.querySelector('.mi-price');
    if (!nameEl || !priceEl) return;
    const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10);
    if (!price) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-btn';
    btn.setAttribute('aria-label', 'Add ' + nameEl.textContent + ' to order');
    btn.textContent = '+';
    btn.addEventListener('click', () => add(nameEl.textContent.trim(), price, btn));
    row.appendChild(btn);
  });

  /* feature burger + any explicit add buttons */
  document.querySelectorAll('.mf-add, [data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      add(btn.dataset.name, parseInt(btn.dataset.price, 10), btn);
    });
  });

  /* ---------- Cart ops ---------- */
  function id(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  function add(name, price, btn) {
    const key = id(name);
    if (cart[key]) cart[key].qty += 1;
    else cart[key] = { name, price, qty: 1 };
    save();
    render();
    bumpFab();
    if (btn && btn.classList.contains('add-btn')) {
      btn.classList.add('added');
      btn.textContent = '✓';
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 900);
    }
  }

  function setQty(key, delta) {
    if (!cart[key]) return;
    cart[key].qty += delta;
    if (cart[key].qty <= 0) delete cart[key];
    save();
    render();
  }

  function count() { return Object.values(cart).reduce((s, i) => s + i.qty, 0); }
  function total() { return Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0); }

  /* ---------- Render ---------- */
  function render() {
    const n = count();
    fabCount.textContent = n;
    fab.classList.toggle('show', n > 0);

    const items = Object.entries(cart);
    if (!items.length) {
      body.innerHTML = '<div class="cart-empty"><div class="big">Nothing here yet</div>Browse the menu and tap <strong>+</strong> to start your order.</div>';
      sendBtn.disabled = true;
    } else {
      body.innerHTML = '';
      items.forEach(([key, it]) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML =
          '<div class="cl-main"><div class="cl-name"></div><div class="cl-unit"></div></div>' +
          '<div class="stepper"><button type="button" class="minus" aria-label="Remove one">−</button>' +
          '<span class="qty"></span>' +
          '<button type="button" class="plus" aria-label="Add one">+</button></div>' +
          '<span class="cl-price"></span>';
        line.querySelector('.cl-name').textContent = it.name;
        line.querySelector('.cl-unit').textContent = naira(it.price) + ' each';
        line.querySelector('.qty').textContent = it.qty;
        line.querySelector('.cl-price').textContent = naira(it.price * it.qty);
        line.querySelector('.minus').addEventListener('click', () => setQty(key, -1));
        line.querySelector('.plus').addEventListener('click', () => setQty(key, +1));
        body.appendChild(line);
      });
      sendBtn.disabled = false;
    }
    totalEl.textContent = naira(total());
  }

  /* ---------- Open / close ---------- */
  function open() {
    drawer.classList.add('open');
    scrim.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  if (navOrder) {
    navOrder.addEventListener('click', (e) => { e.preventDefault(); open(); });
  }

  let bumpT = null;
  function bumpFab() {
    fab.classList.add('bump');
    clearTimeout(bumpT);
    bumpT = setTimeout(() => fab.classList.remove('bump'), 460);
  }

  /* ---------- Checkout → WhatsApp ---------- */
  sendBtn.addEventListener('click', () => {
    const items = Object.values(cart);
    if (!items.length) return;
    let msg = 'Hi Heaven & Eve, I’d like to order:\n';
    items.forEach((it) => {
      msg += `• ${it.qty}× ${it.name} — ${naira(it.price * it.qty)}\n`;
    });
    msg += `\nSubtotal: ${naira(total())}`;
    const note = noteEl.value.trim();
    if (note) msg += `\n\n${note}`;
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });

  render();
})();
