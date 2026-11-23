// =============================================================================
// COTIZAR (cotizar.html): calculadora de láminas (de tejas2, sección 8),
// cotizador por cajas de tornillos y accesorios, y envío del pedido
// Lo que se muestra depende de cómo se llegó (lo usa la ficha de producto):
//   ?material=pvc|pc|pp → sólo el cotizador de láminas, con ese material marcado
//   ?articulo=<id>      → sólo el cotizador por cajas, con ese accesorio elegido
//   sin nada (menú)     → los dos
// =============================================================================
import { $ } from './comun.js';
import { WHATSAPP, CORREO, PRODUCTOS } from './datos.js';

$('[data-wa-texto]').textContent = `+${WHATSAPP.slice(0, 3)} ${WHATSAPP.slice(3, 5)} ${WHATSAPP.slice(5, 8)} ${WHATSAPP.slice(8)}`;
$('[data-correo-texto]').textContent = CORREO;
const parametros = new URLSearchParams(location.search);
const marcado = $(`input[name="material"][value="${parametros.get('material')}"]`);
const articuloPedido = PRODUCTOS[parametros.get('articulo')]?.caja ? parametros.get('articulo') : null;
if (marcado) {
  marcado.checked = true;
  $('#accesorios').hidden = true;
  $('[data-bajada]').textContent = 'Elegir el material y las medidas. El cálculo suma 5 % de traslapes y cortes; después, ventas confirma precio y entrega.';
} else if (articuloPedido) {
  $('#laminas').hidden = true;
  $('[data-bajada]').textContent = 'Se vende por caja completa. Elegir la cantidad o el número de cajas; después, ventas confirma precio y entrega.';
}
if (marcado || articuloPedido) $('[data-submenu-cotizar]').hidden = true;

// Ancho útil por lámina (m) y peso por m²: se llenan con la ficha técnica; sin dato no se estima.
const ANCHO_UTIL = { pp: null, pc: null, pvc: null };
const PESO_M2 = { pp: null, pc: null, pvc: null };
const TRASLAPE = 0.05;
let pedido = {};
function calcular() {
  const opcion = $('input[name="material"]:checked');
  const material = opcion.value;
  const area = (+$('#largo').value || 0) * (+$('#ancho').value || 0);
  const conTraslape = area * (1 + TRASLAPE);
  const lamina = +$('#largoLamina').value || 0;
  const ancho = ANCHO_UTIL[material];
  const laminas = ancho && lamina ? `${Math.ceil(conTraslape / (ancho * lamina))} láminas de ${lamina} m` : `Láminas de ${lamina} m: pendiente del ancho útil`;
  const peso = PESO_M2[material] ? `${Math.round(conTraslape * PESO_M2[material])} kg aproximados` : 'Peso: pendiente de la ficha técnica';
  pedido = { material: opcion.dataset.nombre, medidas: `${$('#largo').value} × ${$('#ancho').value} m`, area: `${area.toFixed(1)} m² (${conTraslape.toFixed(1)} m² con traslapes)`, lamina: `${lamina} m` };
  $('#resultado').innerHTML = `<strong>${area.toFixed(1)} m²</strong><em>${conTraslape.toFixed(1)} m² de ${opcion.dataset.nombre} con 5 % de traslapes y cortes</em><span>${laminas}</span><span>${peso}</span>`;
}
$('#calculo').addEventListener('input', calcular);
$('#calculo').addEventListener('change', calcular);
$('#calculo').addEventListener('submit', (e) => e.preventDefault());
calcular();
$('#contacto').addEventListener('submit', (e) => {
  e.preventDefault();
  const datos = new FormData(e.target);
  const texto = [
    'Hola, quiero una cotización.',
    `Nombre: ${datos.get('nombre')}`,
    `Teléfono: ${datos.get('telefono')}`,
    datos.get('ciudad') && `Ciudad: ${datos.get('ciudad')}`,
    // Sólo lo que está a la vista: láminas, accesorios o los dos
    ...(!$('#laminas').hidden ? [`Material: ${pedido.material}`, `Techo: ${pedido.medidas}, ${pedido.area}`, `Largo de lámina: ${pedido.lamina}`] : []),
    ...(!$('#accesorios').hidden && lineas.length ? ['Accesorios:', ...lineas.map((l) => `- ${l.nombre}: ${l.cantidad} u (${l.cajas} ${l.cajas === 1 ? 'caja' : 'cajas'}) × ${dinero.format(l.precio)} = ${dinero.format(l.total)}`),
      `Total de accesorios: ${dinero.format(lineas.reduce((suma, l) => suma + l.total, 0))}`] : []),
  ].filter(Boolean).join('\n');
  const aviso = $('#contactoAviso');
  if (e.submitter?.value === 'correo') {
    location.href = `mailto:${CORREO}?subject=${encodeURIComponent('Cotización de techo')}&body=${encodeURIComponent(texto)}`;
    aviso.textContent = 'Se abrió el correo con el pedido listo para enviar.';
  } else {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    aviso.textContent = 'Se abrió WhatsApp con el pedido listo para enviar.';
  }
  aviso.hidden = false;
});

// =============================================================================
// COTIZADOR POR CAJAS: tornillos y accesorios (sección #accesorios)
// Los artículos son los productos de datos.js que tienen caja y precio.
// Se vende por caja completa: al escribir la cantidad se redondea hacia arriba
// a cajas enteras; al escribir las cajas, la cantidad es cajas × unidades.
// =============================================================================
const dinero = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });
const ARTICULOS = Object.entries(PRODUCTOS).filter(([, p]) => p.caja && p.precio);
const lineas = []; // { id, nombre, cantidad, cajas, precio, total }

$('#articulo').innerHTML = ARTICULOS.map(([id, p]) => `<option value="${id}">${p.nombre}${p.ejemplo ? ' (ejemplo)' : ''}</option>`).join('');
if (articuloPedido) $('#articulo').value = articuloPedido;
const articulo = () => PRODUCTOS[$('#articulo').value];

// Cuál de los dos campos escribió la persona: el otro se calcula.
function cuadrar(desde) {
  const { caja } = articulo();
  if (desde === 'cantidad') $('#nroCajas').value = Math.ceil((+$('#cantidad').value || 0) / caja);
  $('#cantidad').value = (+$('#nroCajas').value || 0) * caja;
  mostrarCajas();
}
function mostrarCajas() {
  const { caja, precio } = articulo();
  const cajas = +$('#nroCajas').value || 0;
  $('#cajasInfo').textContent = `Se vende en cajas de ${caja} unidades.`;
  $('#valorUnidad').textContent = dinero.format(precio);
  $('#valorCaja').textContent = dinero.format(precio * caja);
  $('#totalCajas').textContent = dinero.format(precio * caja * cajas);
}
// La cantidad se cuadra a cajas enteras al salir del campo, no en cada tecla.
$('#cantidad').addEventListener('change', () => cuadrar('cantidad'));
$('#nroCajas').addEventListener('input', () => cuadrar('cajas'));
$('#articulo').addEventListener('change', () => cuadrar('cajas'));
cuadrar('cajas');

function mostrarLineas() {
  $('#lineas').innerHTML = lineas.length
    // data-titulo: rótulo de cada dato cuando la tabla se apila en celular
    ? lineas.map((l, i) => `<tr><td>${l.nombre}</td><td data-titulo="Cantidad">${l.cantidad}</td><td data-titulo="Cajas">${l.cajas}</td>
        <td data-titulo="Valor unidad">${dinero.format(l.precio)}</td><td data-titulo="Total">${dinero.format(l.total)}</td>
        <td><button class="quitar" type="button" data-quitar="${i}" aria-label="Quitar ${l.nombre}">×</button></td></tr>`).join('')
    : '<tr class="vacio"><td colspan="6">Todavía no hay accesorios en el pedido.</td></tr>';
  $('#totalPedido').textContent = dinero.format(lineas.reduce((suma, l) => suma + l.total, 0));
}
$('#cajas').addEventListener('submit', (e) => {
  e.preventDefault();
  cuadrar('cantidad');
  const id = $('#articulo').value;
  const { nombre, caja, precio } = PRODUCTOS[id];
  const cajas = +$('#nroCajas').value || 0;
  if (!cajas) return;
  // El mismo artículo agregado dos veces suma cajas en una sola línea.
  const previa = lineas.find((l) => l.id === id);
  const total = previa ? previa.cajas + cajas : cajas;
  const linea = { id, nombre, cajas: total, cantidad: total * caja, precio, total: total * caja * precio };
  if (previa) Object.assign(previa, linea); else lineas.push(linea);
  mostrarLineas();
});
$('#lineas').addEventListener('click', (e) => {
  const boton = e.target.closest('[data-quitar]');
  if (!boton) return;
  lineas.splice(+boton.dataset.quitar, 1);
  mostrarLineas();
});
mostrarLineas();
