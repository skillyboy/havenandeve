/* Haven & Eve — interactions */
(function () {
  /* ---------- Nav shadow on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  const toggleMenu = (open) => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Day / Candlelit toggle (on-page + persisted) ---------- */
  const root = document.documentElement;
  const atmosBtn = document.getElementById('atmosToggle');
  const KEY = 'he-atmos';
  const applyAtmos = (mode) => root.setAttribute('data-atmos', mode);
  // Honour a stored choice; otherwise default to daylight.
  const stored = localStorage.getItem(KEY);
  if (stored) applyAtmos(stored);
  if (atmosBtn) {
    atmosBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-atmos') === 'candlelit' ? 'day' : 'candlelit';
      applyAtmos(next);
      localStorage.setItem(KEY, next);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- Hero carousel (shuffled) ---------- */
  const SLIDES = [
    {
      img: 'images/interior.jpg',
      eyebrow: 'Premium Coffee &amp; More · Lagos',
      title: 'The best coffee<br />on the <span class="serif-italic clay">mainland</span>.',
      lead: 'A warm little corner built to be a <em>playground in your mouth</em> — premium coffee, fresh-pressed juices, and burgers worth crossing the bridge for.',
      tag: 'Hand-poured daily',
    },
    {
      img: 'images/burger.jpeg',
      eyebrow: 'Best Seller · The Kitchen',
      title: 'A playground in<br />your <span class="serif-italic clay">mouth</span>.',
      lead: 'Our legendary beef burger — toasted brioche, melted cheese, house sauce. The one everybody crosses the bridge for.',
      tag: 'Best-seller burger',
    },
    {
      img: 'images/juice-hand.jpeg',
      eyebrow: 'Fresh-Pressed · Daily',
      title: 'Cold, bright<br />&amp; <span class="serif-italic clay">fresh</span>.',
      lead: 'Juices pressed to order, smoothies, and iced everything — bright Lagos mornings in a glass.',
      tag: 'Pressed to order',
    },
    {
      img: 'images/focus-desk.jpeg',
      eyebrow: 'A Hidden Gem · Ketu',
      title: 'Your quiet corner<br />of <span class="serif-italic clay">haven</span>.',
      lead: 'Tucked away in Alapere — warm wood, soft light, and a seat that says slow down for ten quiet minutes.',
      tag: 'Find your seat',
    },
    {
      img: 'images/iced-coffee.jpeg',
      eyebrow: 'Iced &amp; Hot · Lagos',
      title: 'Slow down,<br /><span class="serif-italic clay">sip</span>, stay.',
      lead: 'However you take it — a velvety flat white, a 12-hour cold brew, an affogato for the road.',
      tag: 'Iced or hot',
    },
  ];

  const stack = document.getElementById('heroStack');
  const dotsWrap = document.getElementById('heroDots');
  const elEyebrow = document.getElementById('heroEyebrow');
  const elTitle = document.getElementById('heroTitle');
  const elLead = document.getElementById('heroLead');
  const elTag = document.getElementById('heroTag');
  const heroArt = stack ? stack.closest('.hero-art') : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stack) {
    // Shuffle so the order feels different every visit
    const order = SLIDES.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const slides = order.map((idx) => SLIDES[idx]);

    // Build image layers + dots
    slides.forEach((s, i) => {
      const layer = document.createElement('div');
      layer.className = 'hero-slide' + (i === 0 ? ' is-active' : '');
      layer.style.backgroundImage = `url("${s.img}")`;
      stack.appendChild(layer);
      // preload
      const im = new Image(); im.src = s.img;

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = i === 0 ? 'on' : '';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(dot);
    });

    const layers = [...stack.querySelectorAll('.hero-slide')];
    const dots = [...dotsWrap.querySelectorAll('button')];
    let current = 0;
    let timer = null;

    const setCopy = (s) => {
      elEyebrow.innerHTML = s.eyebrow;
      elTitle.innerHTML = s.title;
      elLead.innerHTML = s.lead;
      if (elTag) elTag.textContent = s.tag;
    };

    function go(next, manual) {
      if (next === current) return;
      layers[current].classList.remove('is-active');
      layers[next].classList.add('is-active');
      dots[current].classList.remove('on');
      dots[next].classList.add('on');

      // crossfade the copy
      if (heroArt && !reduceMotion) {
        document.querySelector('.hero').classList.add('hero-fading');
        setTimeout(() => {
          setCopy(slides[next]);
          document.querySelector('.hero').classList.remove('hero-fading');
        }, 320);
      } else {
        setCopy(slides[next]);
      }
      current = next;
      if (manual) restart();
    }

    function advance() { go((current + 1) % slides.length); }
    function restart() { if (timer) clearInterval(timer); if (!reduceMotion) timer = setInterval(advance, 5200); }

    setCopy(slides[0]);
    restart();

    // Pause on hover (desktop)
    heroArt.addEventListener('mouseenter', () => timer && clearInterval(timer));
    heroArt.addEventListener('mouseleave', restart);
  }
})();
