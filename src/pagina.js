// =============================================================================
// PÁGINAS SIMPLES (nosotros, obras, sostenibilidad, reciclaje, noticias)
// Sólo arman el menú y el pie (comun.js) y hacen aparecer los bloques al bajar.
// Las demás páginas usan entradas() desde su propio archivo.
// =============================================================================
import { $$ } from './comun.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Tarjetas y bloques que suben y aparecen uno tras otro al llegar.
export function entradas() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const selector = '.tarjeta-diagonal, .obra, .noticia, .valores li, .linea-tiempo li, .pasos li, .categoria, .uso, .oficinas-lista li';
  const elementos = $$(selector).filter((e) => !e.dataset.entrada);
  if (!elementos.length) return;
  elementos.forEach((e) => { e.dataset.entrada = '1'; });
  gsap.set(elementos, { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(elementos, {
    start: 'top 92%',
    once: true,
    onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }),
  });
}
entradas();
