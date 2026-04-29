// Shared scroll-reveal animation
export function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
  // Hero elements fire immediately
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
}
