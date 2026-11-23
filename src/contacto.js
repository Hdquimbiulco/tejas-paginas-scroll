// =============================================================================
// CONTACTO (contacto.html): WhatsApp por ciudad y formulario de sugerencias
// =============================================================================
import { $, $$ } from './comun.js';
import { WHATSAPP } from './datos.js';
import './pagina.js';

const wa = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
$$('[data-wa-ciudad]').forEach((a) => {
  a.href = wa(`Hola, escribo desde ${a.dataset.waCiudad}.`);
  a.target = '_blank';
  a.rel = 'noopener';
});
$('#formOpinion').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  window.open(wa(`${d.get('motivo')}\nNombre: ${d.get('nombre')}\n${d.get('mensaje')}`), '_blank', 'noopener');
  const aviso = $('.aviso', e.target);
  aviso.textContent = 'Se abrió WhatsApp con el mensaje listo para enviar.';
  aviso.hidden = false;
});
