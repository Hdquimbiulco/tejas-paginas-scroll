// =============================================================================
// FICHA DE PRODUCTO (producto.html?id=<id>)
// Una sola página para todos los productos: los datos salen de src/datos.js.
// Si el id no existe, se muestra el primer producto.
// =============================================================================
import { $, icono } from './comun.js';
import { CATEGORIAS, PRODUCTOS, WHATSAPP, ruta } from './datos.js';
import { entradas } from './pagina.js';

const id = new URLSearchParams(location.search).get('id');
const idMostrado = PRODUCTOS[id] ? id : CATEGORIAS[0].productos[0];
const p = PRODUCTOS[idMostrado];
const categoria = CATEGORIAS.find((c) => c.id === p.categoria);
const foto = (archivo, alt) => (archivo ? `<img src="${ruta(archivo)}" alt="${alt}">` : '<div class="espacio-foto">Foto pendiente</div>');

document.title = `${p.nombre} · Truvec`;
// Color oscuro de la categoría para títulos, rayas e íconos (se lee sobre blanco)
const OSCUROS = { pvc: '#c8431b', pc: '#1d7fa6', pp: '#a8680c', acc: '#59626a' };
$('[data-ficha]').style.setProperty('--c-osc', OSCUROS[p.categoria]);
if (p.foto) $('[data-hero]').style.setProperty('--foto', `url(${ruta(p.foto)})`);
$('[data-nombre-hero]').textContent = categoria.nombre;
$('[data-nombre]').innerHTML = p.nombre + (p.ejemplo ? ' <em class="etiqueta-ejemplo">Ejemplo</em>' : '');
$('[data-migas]').innerHTML = `<li><a href="index.html">Inicio</a></li><li><a href="productos.html">Productos</a></li><li><a href="productos.html#${categoria.id}">${categoria.nombre}</a></li><li aria-current="page">${p.nombre}</li>`;
$('[data-submenu]').innerHTML = CATEGORIAS.map((c) => `<li><a href="productos.html#${c.id}"${c === categoria ? ' class="actual"' : ''}>${c.nombre}</a></li>`).join('');
$('[data-foto]').innerHTML = foto(p.foto, p.nombre);
$('[data-usos]').innerHTML = p.usos.map(([ico, texto]) => `<div class="uso">${icono(ico)}${texto}</div>`).join('');
$('[data-descripcion]').innerHTML = p.descripcion.map((d) => `<li>${d}</li>`).join('');
$('[data-normas]').innerHTML = p.normas.map(([t, d]) => `<p><b>${t}:</b>${d}</p>`).join('') + '<p class="pendiente">Datos por confirmar con la ficha técnica.</p>';
// Cotizar abre sólo el cotizador que corresponde: láminas (con el material
// marcado) o, para accesorios, el de cajas con el artículo elegido.
// WhatsApp abre con el nombre del producto.
$('[data-cotizar]').href = p.categoria === 'acc' ? `cotizar.html?articulo=${idMostrado}` : `cotizar.html?material=${p.categoria}`;
$('[data-wa-producto]').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, quiero información de: ${p.nombre}`)}`;
$('[data-relacionados]').innerHTML = categoria.productos.filter((otro) => PRODUCTOS[otro] !== p).map((otro) => `
  <a class="relacionado" href="producto.html?id=${otro}"><figure>${foto(PRODUCTOS[otro].foto, '')}</figure><p>${PRODUCTOS[otro].nombre}</p></a>`).join('');
entradas();
