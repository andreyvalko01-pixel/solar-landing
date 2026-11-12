import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // без анімацій одразу показуємо фінальні значення лічильників
    document.querySelectorAll('[data-counter]').forEach((el) => {
      el.textContent = Number(el.dataset.counter).toLocaleString('uk-UA');
    });
    return;
  }

  gsap.from('[data-anim="hero"]', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });

  gsap.utils.toArray('[data-anim="up"]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // картки в одному блоці з'являються по черзі
  ScrollTrigger.batch('[data-anim="card"]', {
    start: 'top 88%',
    onEnter: (batch) => gsap.from(batch, { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }),
    once: true,
  });

  document.querySelectorAll('[data-counter]').forEach((el) => {
    const decimals = Number(el.dataset.decimals || 0);
    const counter = { value: 0 };
    gsap.to(counter, {
      value: Number(el.dataset.counter),
      duration: 1.6,
      delay: 0.5,
      ease: 'power1.out',
      onUpdate: () => {
        el.textContent = counter.value.toLocaleString('uk-UA', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
    });
  });

  // легкий паралакс фону першого екрана
  gsap.to('.hero__bg', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}
