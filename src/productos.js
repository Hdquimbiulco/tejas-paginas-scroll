// =============================================================================
// PÁGINA DE PRODUCTOS (productos.html)
// Arma una caja por categoría con la lista de sus productos (src/datos.js).
// =============================================================================
import { $, icono } from './comun.js';
import { CATEGORIAS, PRODUCTOS } from './datos.js';
import { entradas } from './pagina.js';

$('[data-submenu]').innerHTML = CATEGORIAS.map((c) => `<li><a href="#${c.id}">${c.nombre}</a></li>`).join('');
$('[data-categorias]').innerHTML = CATEGORIAS.map((c) => `
  <article class="categoria" id="${c.id}">
    <h2 class="categoria-titulo">${icono(c.icono)}${c.nombre}</h2>
    <ul>${c.productos.map((id) => `
      <li><a href="producto.html?id=${id}">
        <span>${PRODUCTOS[id].nombre}${PRODUCTOS[id].ejemplo ? '<em class="etiqueta-ejemplo">Ejemplo</em>' : ''}</span>${icono('i-flecha')}
      </a></li>`).join('')}
    </ul>
  </article>`).join('');
entradas();
// Las categorías se arman después de cargar: si se llegó con #categoria, se baja hasta ella.
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
