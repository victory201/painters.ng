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
