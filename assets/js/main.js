/* =============================================================================
   Makgoba & Sons Plumbing — interaction layer
   One consistent motion language: reveal upward, mask open, pipe fills.
   Everything degrades safely without JS and respects prefers-reduced-motion.
   ============================================================================= */
(function () {
  'use strict';

  var WHATSAPP = '27794134042';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  }
  function prefersReduced() { return reduceMotion.matches; }

  /* ---------------------------------------------------------------------------
     Current year
     --------------------------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------------
     Page loader — shown once per browsing session only
     --------------------------------------------------------------------------- */
  var loader = $('#loader');
  var hero = $('.hero');

  function startHero() {
    if (hero) hero.classList.add('is-ready');
  }

  function dismissLoader(delay) {
    if (!loader) { startHero(); return; }
    window.setTimeout(function () {
      loader.classList.add('is-done');
      startHero();
      window.setTimeout(function () { loader.hidden = true; }, 600);
    }, delay);
  }

  var seenLoader = false;
  try { seenLoader = window.sessionStorage.getItem('mgs-loaded') === '1'; } catch (e) {}

  if (loader && (seenLoader || prefersReduced())) {
    loader.hidden = true;
    startHero();
  } else {
    try { window.sessionStorage.setItem('mgs-loaded', '1'); } catch (e) {}
    if (document.readyState === 'complete') dismissLoader(1200);
    else window.addEventListener('load', function () { dismissLoader(1200); });
    // Never trap the visitor behind the loader
    window.setTimeout(function () {
      if (loader && !loader.hidden && !loader.classList.contains('is-done')) dismissLoader(0);
    }, 2600);
  }

  /* ---------------------------------------------------------------------------
     Header: scrolled state, active section, mobile drawer
     --------------------------------------------------------------------------- */
  var header = $('#header');
  var navToggle = $('#navToggle');
  var mobileMenu = $('#mobileMenu');
  var navLinks = $$('.header__link');

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  setHeaderState();

  var menuOpen = false;

  function openMenu() {
    if (!mobileMenu || !navToggle) return;
    menuOpen = true;
    mobileMenu.hidden = false;
    // Force reflow so the transition runs from the hidden state
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    header.classList.add('is-menu-open');
    document.body.classList.add('is-locked');
    $$('.mobile-menu__list li', mobileMenu).forEach(function (li, i) {
      li.style.animationDelay = (80 + i * 45) + 'ms';
    });
    var first = $('.mobile-menu__link', mobileMenu);
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!mobileMenu || !navToggle || !menuOpen) return;
    menuOpen = false;
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    header.classList.remove('is-menu-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () { if (!menuOpen) mobileMenu.hidden = true; }, 340);
    if (returnFocus) navToggle.focus({ preventScroll: true });
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (menuOpen) closeMenu(true); else openMenu();
    });
  }

  if (mobileMenu) {
    $$('.mobile-menu__link, .mobile-menu__actions a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });
    // Keep tab focus inside the drawer while it is open
    mobileMenu.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !menuOpen) return;
      var focusables = $$('a[href], button:not([disabled])', mobileMenu);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (menuOpen) closeMenu(true);
    else if (lightbox && lightbox.classList.contains('is-open')) closeLightbox();
  });

  // Close the drawer if the viewport grows into the desktop nav
  window.addEventListener('resize', function () {
    if (menuOpen && window.innerWidth >= 960) closeMenu(false);
  });

  /* Active navigation link */
  var sectionsForNav = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.getElementById(id.slice(1)) : null;
    })
    .filter(Boolean);

  function setActiveNav() {
    var probe = window.scrollY + window.innerHeight * 0.3;
    var activeId = null;
    sectionsForNav.forEach(function (section) {
      if (section.offsetTop <= probe) activeId = section.id;
    });
    navLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + activeId;
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  /* ---------------------------------------------------------------------------
     Scroll progress: the riser fill, the top bar and the back-to-top ring
     --------------------------------------------------------------------------- */
  var railFill = $('#railFill');
  var railDrop = $('#railDrop');
  var rail = $('#rail');
  var progressBar = $('#progressBar');
  var scrollTopBtn = $('#scrollTop');
  var scrollTopBar = $('#scrollTopBar');
  var mobileBar = $('#mobileBar');

  var RING = 2 * Math.PI * 22;
  if (scrollTopBar) {
    scrollTopBar.style.strokeDasharray = RING + ' ' + RING;
    scrollTopBar.style.strokeDashoffset = String(RING);
  }

  function setProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    if (railFill) railFill.style.transform = 'scaleY(' + p + ')';
    if (railDrop) railDrop.style.top = (p * 100) + '%';
    if (rail) rail.classList.toggle('is-active', p > 0.01 && p < 0.995);
    if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';
    if (scrollTopBar) scrollTopBar.style.strokeDashoffset = String(RING * (1 - p));
    if (scrollTopBtn) scrollTopBtn.classList.toggle('is-shown', p > 0.4);
    if (mobileBar) mobileBar.classList.toggle('is-shown', window.scrollY > 320);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced() ? 'auto' : 'smooth'
      });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setHeaderState();
      setProgress();
      setActiveNav();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  setProgress();
  setActiveNav();

  /* ---------------------------------------------------------------------------
     Scroll reveals — one shared observer, staggered children
     --------------------------------------------------------------------------- */
  var revealSelector = [
    '[data-reveal]',
    '[data-stagger]',
    '[data-reveal-self]',
    '.section',
    '.final-cta',
    '.contact__row'
  ].join(',');

  // Assign stagger delays up front so grids cascade rather than pop
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      var step = window.innerWidth < 640 ? 55 : 90;
      child.style.transitionDelay = (i * step) + 'ms';
    });
  });

  var targets = $$(revealSelector);

  if (!('IntersectionObserver' in window) || prefersReduced()) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------------
     Statistic counters — real figures only, counted once
     --------------------------------------------------------------------------- */
  $$('[data-count-to]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    if (isNaN(target)) return;

    if (prefersReduced() || !('IntersectionObserver' in window)) {
      el.textContent = String(target);
      return;
    }

    el.textContent = '0';
    var counted = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted) return;
        counted = true;
        io.disconnect();
        var start = performance.now();
        var duration = 900;
        (function step(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) window.requestAnimationFrame(step);
          else el.textContent = String(target);
        })(start);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------------------------------------------------------------------------
     Cursor-following highlight inside cards
     --------------------------------------------------------------------------- */
  if (finePointer.matches && !prefersReduced()) {
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Button ripple from the click point
     --------------------------------------------------------------------------- */
  $$('.button').forEach(function (button) {
    button.addEventListener('pointerdown', function (event) {
      if (prefersReduced()) return;
      var rect = button.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2.2;
      var ripple = document.createElement('span');
      ripple.className = 'button__ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (event.clientX - rect.left) + 'px';
      ripple.style.top = (event.clientY - rect.top) + 'px';
      button.appendChild(ripple);
      window.setTimeout(function () { ripple.remove(); }, 560);
    });
  });

  /* ---------------------------------------------------------------------------
     Magnetic pull on the final call-to-action buttons
     --------------------------------------------------------------------------- */
  if (finePointer.matches && !prefersReduced()) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) * 0.14;
        var dy = (event.clientY - (rect.top + rect.height / 2)) * 0.18;
        el.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + (dy - 2).toFixed(2) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------------------
     FAQ accordion — one panel open at a time
     --------------------------------------------------------------------------- */
  var faqTriggers = $$('.faq-item__trigger');
  faqTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.faq-item');
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      faqTriggers.forEach(function (other) {
        if (other === trigger) return;
        other.setAttribute('aria-expanded', 'false');
        var otherItem = other.closest('.faq-item');
        if (otherItem) otherItem.classList.remove('is-open');
      });

      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (item) item.classList.toggle('is-open', !isOpen);
    });
  });

  /* ---------------------------------------------------------------------------
     Reviews slider — arrows, dots, drag, autoplay that yields to the user
     --------------------------------------------------------------------------- */
  (function initSlider() {
    var slider = $('#reviewSlider');
    var track = $('#reviewTrack');
    var dotsWrap = $('#reviewDots');
    if (!slider || !track) return;

    var slides = $$('.slider__slide', track);
    if (slides.length < 2) return;

    var index = 0;
    var userEngaged = false;
    var timer = null;

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Review ' + (i + 1));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () { engage(); go(i); });
      if (dotsWrap) dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap ? $$('.slider__dot', dotsWrap) : [];

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
    }

    function engage() {
      userEngaged = true;
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    $$('[data-slide]', slider).forEach(function (button) {
      button.addEventListener('click', function () {
        engage();
        go(index + (button.getAttribute('data-slide') === 'next' ? 1 : -1));
      });
    });

    // Pointer drag
    var startX = null;
    track.addEventListener('pointerdown', function (event) {
      startX = event.clientX;
    });
    track.addEventListener('pointerup', function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 40) return;
      engage();
      go(index + (dx < 0 ? 1 : -1));
    });
    track.addEventListener('pointercancel', function () { startX = null; });

    slider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { engage(); go(index + 1); }
      else if (event.key === 'ArrowLeft') { engage(); go(index - 1); }
    });

    var interval = parseInt(slider.getAttribute('data-autoplay'), 10);
    if (interval && !prefersReduced()) {
      timer = window.setInterval(function () {
        if (!userEngaged && !document.hidden) go(index + 1);
      }, interval);
      slider.addEventListener('pointerenter', function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      });
    }

    go(0);
  })();

  /* ---------------------------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------------------------- */
  var lightbox = $('#lightbox');
  var lightboxImage = $('#lightboxImage');
  var lightboxCaption = $('#lightboxCaption');
  var lightboxCounter = $('#lightboxCounter');
  var galleryButtons = $$('.gallery__button');
  var lightboxIndex = 0;
  var lastFocused = null;

  var gallery = galleryButtons.map(function (button) {
    var img = $('img', button);
    var figure = button.closest('.gallery__item');
    var category = figure ? $('.gallery__category', figure) : null;
    var title = figure ? $('.gallery__title', figure) : null;
    return {
      src: img ? img.currentSrc || img.src : '',
      alt: img ? img.alt : '',
      label: [
        category ? category.textContent.trim() : '',
        title ? title.textContent.trim() : ''
      ].filter(Boolean).join(' — ')
    };
  });

  function showLightbox(i) {
    if (!gallery.length) return;
    lightboxIndex = (i + gallery.length) % gallery.length;
    var item = gallery[lightboxIndex];
    if (lightboxImage) {
      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = item.label;
    if (lightboxCounter) {
      lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + gallery.length;
    }
  }

  function openLightbox(i) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    void lightbox.offsetWidth;
    showLightbox(i);
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
    var close = $('#lightboxClose');
    if (close) close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () {
      if (!lightbox.classList.contains('is-open')) lightbox.hidden = true;
    }, 300);
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  galleryButtons.forEach(function (button, i) {
    button.addEventListener('click', function () { openLightbox(i); });
  });

  var lightboxClose = $('#lightboxClose');
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  $$('[data-lightbox-nav]').forEach(function (button) {
    button.addEventListener('click', function () {
      showLightbox(lightboxIndex + (button.getAttribute('data-lightbox-nav') === 'next' ? 1 : -1));
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
      else if (event.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
      else if (event.key === 'Tab') {
        var focusables = $$('button', lightbox);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ---------------------------------------------------------------------------
     Soft cursor follower — desktop pointers only, never replaces the cursor
     --------------------------------------------------------------------------- */
  (function initCursor() {
    var cursor = $('#cursor');
    var label = $('#cursorLabel');
    if (!cursor || !finePointer.matches || prefersReduced()) {
      if (cursor) cursor.remove();
      return;
    }

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var cx = x;
    var cy = y;

    window.addEventListener('pointermove', function (event) {
      x = event.clientX;
      y = event.clientY;
    }, { passive: true });

    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      window.requestAnimationFrame(loop);
    })();

    document.addEventListener('pointerover', function (event) {
      var labelled = event.target.closest('[data-cursor]');
      if (labelled) {
        cursor.classList.add('is-label');
        cursor.classList.remove('is-hover');
        if (label) label.textContent = labelled.getAttribute('data-cursor');
        return;
      }
      cursor.classList.remove('is-label');
      if (label) label.textContent = '';
      cursor.classList.toggle(
        'is-hover',
        Boolean(event.target.closest('a, button, input, select, textarea, [role="tab"]'))
      );
    });
  })();

  /* ---------------------------------------------------------------------------
     Quote form — validate, then hand the request to WhatsApp
     --------------------------------------------------------------------------- */
  (function initForm() {
    var form = $('#quoteForm');
    if (!form) return;

    var submit = $('#quoteSubmit');
    var formError = $('#formError');
    var formErrorText = $('#formErrorText');
    var formOk = $('#formOk');

    var rules = {
      qName: {
        test: function (v) { return v.trim().length >= 2; },
        required: true
      },
      qPhone: {
        test: function (v) {
          var digits = v.replace(/[\s()-]/g, '');
          return /^(\+?27\d{9}|0\d{9})$/.test(digits);
        },
        required: true
      },
      qEmail: {
        test: function (v) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
        required: false
      },
      qService: {
        test: function (v) { return v !== ''; },
        required: true
      },
      qAddress: {
        test: function (v) { return v.trim().length >= 5; },
        required: true
      },
      qMessage: {
        test: function (v) { return v.trim().length >= 10; },
        required: true
      }
    };

    function fieldWrap(input) { return input.closest('.field'); }

    function validateField(input, showEmpty) {
      var rule = rules[input.id];
      if (!rule) return true;
      var wrap = fieldWrap(input);
      var value = input.value || '';
      var empty = value.trim() === '';
      var ok = rule.test(value);

      if (!wrap) return ok;
      wrap.classList.remove('is-valid', 'is-invalid');

      if (empty && !rule.required) return true;
      if (empty && !showEmpty) return false;

      if (ok) {
        wrap.classList.add('is-valid');
        input.removeAttribute('aria-invalid');
      } else {
        wrap.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        var err = document.getElementById(input.id + 'Error');
        if (err) input.setAttribute('aria-describedby', err.id);
      }
      return ok;
    }

    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      // Validate on blur and on change, never on every keystroke
      input.addEventListener('blur', function () { validateField(input, true); });
      input.addEventListener('change', function () { validateField(input, true); });
      input.addEventListener('input', function () {
        var wrap = fieldWrap(input);
        if (wrap && wrap.classList.contains('is-invalid') && rules[id].test(input.value)) {
          validateField(input, true);
        }
      });
    });

    function buildMessage(data) {
      var lines = [
        'New quote request from the website',
        '',
        'Name: ' + data.name,
        'Phone: ' + data.phone
      ];
      if (data.email) lines.push('Email: ' + data.email);
      lines.push('Service: ' + data.service);
      lines.push('Address: ' + data.address);
      lines.push('');
      lines.push('Problem:');
      lines.push(data.message);
      return lines.join('\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (formOk) formOk.classList.remove('is-shown');
      if (formError) formError.classList.remove('is-shown');

      var invalid = [];
      Object.keys(rules).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && !validateField(input, true)) invalid.push(input);
      });

      if (invalid.length) {
        if (formError && formErrorText) {
          formErrorText.textContent = invalid.length === 1
            ? 'One field still needs attention. It is highlighted above.'
            : invalid.length + ' fields still need attention. The first one is highlighted above.';
          formError.classList.add('is-shown');
        }
        invalid[0].focus({ preventScroll: false });
        return;
      }

      var data = {
        name: $('#qName').value.trim(),
        phone: $('#qPhone').value.trim(),
        email: $('#qEmail').value.trim(),
        service: $('#qService').value,
        address: $('#qAddress').value.trim(),
        message: $('#qMessage').value.trim()
      };

      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(buildMessage(data));

      if (submit) submit.classList.add('is-loading');

      window.setTimeout(function () {
        window.open(url, '_blank', 'noopener');
        if (submit) submit.classList.remove('is-loading');
        if (formOk) formOk.classList.add('is-shown');
      }, 420);
    });
  })();

}());
