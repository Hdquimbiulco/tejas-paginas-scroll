// =============================================================================
// JAVASCRIPT DEL INICIO (index.html)
// -----------------------------------------------------------------------------
// Viene de tejas2/src/main.js, sin la galería, el comparador ni el cotizador.
// Partes (buscar el título con Ctrl+F):
//   1. PORTADA                    → fotogramas de la lluvia atados al scroll
//   1b. LÁMINAS EN VIDEO          → fotogramas con scroll; el menú los sigue
//   2. PALABRAS QUE SE ENCIENDEN  → «Nuestro propósito»
//   3. ENTRADAS                   → tarjetas que aparecen al llegar
//   4. MAPA DE SUCURSALES         → se carga al acercarse (mapaSucursales.js)
//   5. PIE                        → tejas que cubren TRUVEC (tejasLetras.js)
// El menú y el pie los arma comun.js (se importa primero).
// =============================================================================

import { $, $$ } from './comun.js';
import { WHATSAPP } from './datos.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cargarFotogramas, crearSecuencia } from './secuencia.js';

gsap.registerPlugin(ScrollTrigger);

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const celular = innerWidth < 768;
const PASO = celular ? 2 : 1;            // en celular, 1 de cada 2 fotogramas
const escenas = $$('[data-frames]');
const FPS_VIDEO = 24;                    // con movimiento reducido, las escenas se reproducen a 24 fotogramas por segundo

// ---------------------------------------------------------------------------
// 1. PORTADA — la escena queda fija y el scroll elige el fotograma
// Los textos .cap aparecen y se van según data-tramo="inicio,fin".
// No hay pantalla de carga: mientras bajan los fotogramas se ve el primero como
// fondo, y el scroll ya funciona; al terminar la descarga se dibuja el que toca.
// Con «movimiento reducido» (animaciones apagadas en el sistema) la escena no se
// fija ni sigue al scroll: se reproduce sola como video, en bucle, mientras está
// en pantalla. La misma línea de tiempo turna los tres textos (sin ella quedan
// encimados); sólo se quitan el deslizamiento de los textos y el giro del arco.
// ---------------------------------------------------------------------------
escenas.forEach((escena) => {
  let secuencia = null;
  let avance = 0;
  escena.style.background = `#000 url(${import.meta.env.BASE_URL}frames/${escena.dataset.frames}/f001.webp) center / cover`;
  cargarFotogramas(escena.dataset.frames, +escena.dataset.total, PASO, () => {})
    .then((blobs) => crearSecuencia(escena.querySelector('canvas'), blobs))
    .then((s) => { secuencia = s; s.mostrar(avance); })
    .catch((error) => console.error(error));
  const tl = gsap.timeline({
    defaults: { ease: 'none', duration: 0.04 },
    onUpdate: () => { avance = tl.progress(); if (secuencia) secuencia.mostrar(avance); },
    // Con movimiento reducido: sin scroll, se reproduce sola (ver abajo).
    ...(quieto ? { paused: true, repeat: -1 } : {}),
    scrollTrigger: quieto ? undefined : {
      trigger: escena,
      start: 'top top',
      end: `+=${(celular ? escena.dataset.pantallasMovil : escena.dataset.pantallas) * 100}%`,
      pin: true,
      scrub: celular ? true : 0.35,
      onToggle: ({ isActive }) => { if (!isActive && secuencia) secuencia.liberar(); },
    },
  });
  escena.querySelectorAll('[data-tramo]').forEach((el) => {
    const [a, b] = el.dataset.tramo.split(',').map(Number);
    const desde = quieto ? 0 : el.classList.contains('cap-der') ? 60 : -60;
    if (a > 0) tl.fromTo(el, { autoAlpha: 0, x: desde }, { autoAlpha: 1, x: 0 }, a);
    if (b < 1) tl.to(el, { autoAlpha: 0, x: -desde / 2 }, b - 0.04);
  });
  // El arco terracota de la portada gira apenas mientras se baja.
  if (!quieto) tl.fromTo('.arco', { rotate: -8 }, { rotate: 14, duration: 1 }, 0);
  tl.set({}, {}, 1);
  if (quieto) {
    tl.timeScale(1 / (+escena.dataset.total / FPS_VIDEO));   // 180 fotogramas a 24 por segundo
    new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause())).observe(escena);
  }
});

// ---------------------------------------------------------------------------
// 1b. LÁMINAS EN VIDEO CON SCROLL — igual que tejas2 (main.js sección 1b)
// ---------------------------------------------------------------------------
const seccionLamina = $('#lamina');
const lienzoLamina = seccionLamina.querySelector('canvas');
const TOTAL_LAMINA = +seccionLamina.dataset.total;
const acabados = [...seccionLamina.querySelectorAll('.acabado')];
const coloresVideo = [...seccionLamina.querySelectorAll('.colores li[data-desde]')];
const gruposDetalle = [...seccionLamina.querySelectorAll('.detalle-grupo')];
const barraVideo = seccionLamina.querySelector('.video-avance span');
const aFotograma = (p) => 1 + p * (TOTAL_LAMINA - 1);
const aAvance = (f) => (f - 1) / (TOTAL_LAMINA - 1);
const enTramo = (el, f) => f >= +el.dataset.desde && f < +el.dataset.hasta + 1;
lienzoLamina.parentElement.style.backgroundImage = `url(${import.meta.env.BASE_URL}frames/laminas/f001.webp)`;

let secuenciaLamina = null;
let avanceLamina = 0;
let fijacionLamina = null;

function sincronizarLamina(p) {
  avanceLamina = p;
  const f = Math.round(aFotograma(p));
  const activo = acabados.find((a) => enTramo(a, f)) || acabados[0];
  acabados.forEach((a) => {
    const es = a === activo;
    a.classList.toggle('activo', es);
    a.style.setProperty('--avance', es ? (f - a.dataset.desde) / (a.dataset.hasta - a.dataset.desde) : 0);
  });
  coloresVideo.forEach((li) => li.classList.toggle('activo', enTramo(li, f)));
  gruposDetalle.forEach((g) => g.classList.toggle('activo', g.dataset.material === activo.dataset.material));
  barraVideo.style.transform = `scaleX(${p})`;
  if (secuenciaLamina) secuenciaLamina.mostrar(p);
}

function irAFotograma(f) {
  const p = aAvance(f);
  if (fijacionLamina) scrollTo({ top: fijacionLamina.start + p * (fijacionLamina.end - fijacionLamina.start) + 2, behavior: 'smooth' });
  else if (relojLamina) relojLamina.progress(p);
  else sincronizarLamina(p);
}
acabados.forEach((a) => a.querySelector('.acabados-nombre').addEventListener('click', () => irAFotograma(+a.dataset.desde)));
coloresVideo.forEach((li) => {
  li.setAttribute('role', 'button');
  li.tabIndex = 0;
  li.addEventListener('click', () => irAFotograma(+li.dataset.desde));
  li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); irAFotograma(+li.dataset.desde); } });
});

// Con «movimiento reducido» el video se reproduce solo, en bucle, mientras se ve;
// sin movimiento reducido, la sección queda fija y el scroll elige el fotograma.
let relojLamina = null;
if (quieto) {
  const estado = { p: 0 };
  relojLamina = gsap.to(estado, {
    p: 1, duration: TOTAL_LAMINA / FPS_VIDEO, ease: 'none', repeat: -1, paused: true,
    onUpdate: () => sincronizarLamina(estado.p),
  });
  new IntersectionObserver(([e]) => (e.isIntersecting ? relojLamina.play() : relojLamina.pause())).observe(seccionLamina);
} else fijacionLamina = ScrollTrigger.create({
  trigger: seccionLamina,
  start: 'top top',
  end: `+=${(celular ? seccionLamina.dataset.pantallasMovil : seccionLamina.dataset.pantallas) * 100}%`,
  pin: true,
  scrub: celular ? true : 0.35,
  onUpdate: (st) => sincronizarLamina(st.progress),
  onToggle: ({ isActive }) => { if (!isActive && secuenciaLamina) secuenciaLamina.liberar(); },
});
sincronizarLamina(0);

new IntersectionObserver(async ([e], obs) => {
  if (!e.isIntersecting) return;
  obs.disconnect();
  const blobs = await cargarFotogramas(seccionLamina.dataset.fotogramas, TOTAL_LAMINA, PASO, () => {});
  secuenciaLamina = await crearSecuencia(lienzoLamina, blobs);
  sincronizarLamina(avanceLamina);
}, { rootMargin: '200% 0px' }).observe(seccionLamina);

if (!quieto) gsap.to('#avance', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

// ---------------------------------------------------------------------------
// 2. PALABRAS QUE SE ENCIENDEN
// ---------------------------------------------------------------------------
$$('.encendido').forEach((texto) => {
  const calientes = (texto.dataset.calientes || '').split('|').filter(Boolean);
  texto.innerHTML = texto.textContent.trim().split(/\s+/).map((w) => {
    const caliente = calientes.some((c) => w.toLowerCase().replace(/[«»]/g, '').startsWith(c));
    return `<span${caliente ? ' class="caliente"' : ''}>${w}</span>`;
  }).join(' ');
  if (!quieto) {
    gsap.from(texto.querySelectorAll('span'), {
      opacity: 0.12, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: texto, start: 'top 80%', end: 'bottom 55%', scrub: true },
    });
  }
});

// ---------------------------------------------------------------------------
// 3. ENTRADAS — las tarjetas suben y aparecen una tras otra al llegar
// ---------------------------------------------------------------------------
if (!quieto) {
  const entrar = (selector) => {
    gsap.set(selector, { autoAlpha: 0, y: 50 });
    ScrollTrigger.batch(selector, {
      start: 'top 90%',
      once: true,
      onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }),
    });
  };
  entrar('.material');
  entrar('.cifra');
  entrar('.noticia');
}

// ---------------------------------------------------------------------------
// 4. MAPA DE SUCURSALES — se descarga cuando la sección está a 1.000 px
// ---------------------------------------------------------------------------
const seccionMapa = $('#mapa');
const verMapa = new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) return;
  verMapa.disconnect();
  import('./mapaSucursales.js')
    .then(({ crearMapa }) => crearMapa(seccionMapa, { whatsapp: WHATSAPP }))
    .catch((error) => {
      seccionMapa.querySelector('.mapa-estado').textContent = 'No se pudo cargar el mapa de sucursales.';
      console.error(error);
    });
}, { rootMargin: '1000px 0px' });
verMapa.observe(seccionMapa);

// ---------------------------------------------------------------------------
// 5. PIE — la animación de TRUVEC se descarga al acercarse
// ---------------------------------------------------------------------------
const techo = $('#techoTejas');
const verTecho = new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) return;
  verTecho.disconnect();
  import('./tejasLetras.js').then(({ crearLetras }) => crearLetras(techo)).catch((error) => console.error(error));
}, { rootMargin: '800px 0px' });
verTecho.observe(techo);
ScrollTrigger.refresh();
