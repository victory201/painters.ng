const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');

const closeMenu = () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const open = !navigation.classList.contains('open');
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const serviceItems = [...document.querySelectorAll('.service-item')];
const mobileServices = window.matchMedia('(max-width: 900px)');
serviceItems.forEach((item, index) => {
  const description = item.querySelector('p');
  description.id = `service-description-${index + 1}`;
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-controls', description.id);
  item.setAttribute('aria-expanded', 'false');

  const toggle = () => {
    if (!mobileServices.matches) return;
    const opening = item.getAttribute('aria-expanded') !== 'true';
    serviceItems.forEach((service) => service.setAttribute('aria-expanded', 'false'));
    item.setAttribute('aria-expanded', String(opening));
  };

  item.addEventListener('click', toggle);
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});

const syncServiceMode = () => {
  serviceItems.forEach((item) => {
    if (mobileServices.matches) {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-controls', item.querySelector('p').id);
      if (!item.hasAttribute('aria-expanded')) item.setAttribute('aria-expanded', 'false');
    } else {
      item.removeAttribute('role');
      item.removeAttribute('tabindex');
      item.removeAttribute('aria-controls');
      item.removeAttribute('aria-expanded');
    }
  });
};
mobileServices.addEventListener('change', syncServiceMode);
syncServiceMode();

const workGallery = document.querySelector('[data-work-gallery]');
if (workGallery) {
  const galleries = {
    exterior: { label: 'Exterior Paintings', count: 10, title: 'Built to make an entrance.' },
    'rock-finish': { label: 'Rock Finish', count: 7, title: 'Texture with natural character.' },
    'savannah-plaster': { label: 'Savannah Plaster', count: 10, title: 'Soft movement, warm depth.' },
    'travertino-moderno': { label: 'Travertino Moderno', count: 9, title: 'Old-world texture, modern restraint.' },
    'venetian-plaster': { label: 'Venetian Plaster', count: 10, title: 'Polished by hand, alive with light.' },
  };
  const tabs = [...workGallery.querySelectorAll('[data-gallery-tab]')];
  const panel = workGallery.querySelector('[role="tabpanel"]');
  const frame = workGallery.querySelector('[data-gallery-frame]');
  const image = workGallery.querySelector('[data-gallery-image]');
  const category = workGallery.querySelector('[data-gallery-category]');
  const heading = workGallery.querySelector('.gallery-caption h3');
  const current = workGallery.querySelector('[data-gallery-current]');
  const total = workGallery.querySelector('[data-gallery-total]');
  const progress = workGallery.querySelector('[data-gallery-progress]');
  const dots = workGallery.querySelector('[data-gallery-dots]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeCategory = 'exterior';
  let activeIndex = 0;
  let timer;
  let pointerStart = null;
  let inView = true;
  let interacting = false;

  const imageUrl = (slug, index) => `Media/gallery/${slug}/${String(index + 1).padStart(2, '0')}.webp`;

  const startAutoplay = () => {
    window.clearInterval(timer);
    if (reducedMotion.matches || interacting || !inView || document.hidden) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 2000);
  };

  const renderDots = () => {
    dots.replaceChildren();
    for (let index = 0; index < galleries[activeCategory].count; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show image ${index + 1}`);
      dot.setAttribute('aria-current', String(index === activeIndex));
      dot.addEventListener('click', () => {
        showSlide(index);
        startAutoplay();
      });
      dots.append(dot);
    }
  };

  const showSlide = (requestedIndex) => {
    const gallery = galleries[activeCategory];
    activeIndex = (requestedIndex + gallery.count) % gallery.count;
    image.classList.add('changing');
    image.src = imageUrl(activeCategory, activeIndex);
    image.alt = `${gallery.label} project by Painters.ng, image ${activeIndex + 1} of ${gallery.count}`;
    current.textContent = String(activeIndex + 1).padStart(2, '0');
    progress.style.width = `${((activeIndex + 1) / gallery.count) * 100}%`;
    [...dots.children].forEach((dot, index) => dot.setAttribute('aria-current', String(index === activeIndex)));
    image.addEventListener('load', () => image.classList.remove('changing'), { once: true });
    const next = new Image();
    next.src = imageUrl(activeCategory, (activeIndex + 1) % gallery.count);
  };

  const selectCategory = (slug, focusTab = false) => {
    activeCategory = slug;
    activeIndex = 0;
    const gallery = galleries[slug];
    tabs.forEach((tab) => {
      const selected = tab.dataset.galleryTab === slug;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) {
        panel.setAttribute('aria-labelledby', tab.id);
        if (focusTab) tab.focus();
      }
    });
    category.textContent = gallery.label;
    heading.textContent = gallery.title;
    total.textContent = String(gallery.count).padStart(2, '0');
    renderDots();
    showSlide(0);
    startAutoplay();
  };

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => selectCategory(tab.dataset.galleryTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : tabIndex + (event.key === 'ArrowRight' ? 1 : -1);
      nextIndex = (nextIndex + tabs.length) % tabs.length;
      selectCategory(tabs[nextIndex].dataset.galleryTab, true);
    });
  });

  workGallery.querySelector('[data-gallery-prev]').addEventListener('click', () => { showSlide(activeIndex - 1); startAutoplay(); });
  workGallery.querySelector('[data-gallery-next]').addEventListener('click', () => { showSlide(activeIndex + 1); startAutoplay(); });
  frame.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; });
  frame.addEventListener('pointerup', (event) => {
    if (pointerStart !== null && Math.abs(event.clientX - pointerStart) > 45) {
      showSlide(activeIndex + (event.clientX < pointerStart ? 1 : -1));
      startAutoplay();
    }
    pointerStart = null;
  });
  workGallery.addEventListener('mouseenter', () => { interacting = true; startAutoplay(); });
  workGallery.addEventListener('mouseleave', () => { interacting = false; startAutoplay(); });
  workGallery.addEventListener('focusin', () => { interacting = true; startAutoplay(); });
  workGallery.addEventListener('focusout', (event) => {
    if (!workGallery.contains(event.relatedTarget)) { interacting = false; startAutoplay(); }
  });
  document.addEventListener('visibilitychange', startAutoplay);
  reducedMotion.addEventListener('change', startAutoplay);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    startAutoplay();
  }, { threshold: 0.2 }).observe(workGallery);

  selectCategory(activeCategory);
}

const testimonialSlider = document.querySelector('[data-testimonial-slider]');
if (testimonialSlider) {
  const track = testimonialSlider.querySelector('[data-slider-track]');
  const move = (direction) => {
    const card = track.querySelector('.testimonial-card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  testimonialSlider.querySelector('[data-slider-prev]').addEventListener('click', () => move(-1));
  testimonialSlider.querySelector('[data-slider-next]').addEventListener('click', () => move(1));
}

const form = document.querySelector('[data-form]');
const status = document.querySelector('[data-form-status]');
form.querySelector('[data-form-started]').value = Math.floor(Date.now() / 1000);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.className = 'form-status';
  status.textContent = 'Sending your request...';

  try {
    const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to send your request.');
    form.reset();
    form.querySelector('[data-form-started]').value = Math.floor(Date.now() / 1000);
    status.className = 'form-status success';
    status.textContent = result.message;
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.message || 'Something went wrong. Please email hello@painters.ng.';
  } finally {
    button.disabled = false;
  }
});
