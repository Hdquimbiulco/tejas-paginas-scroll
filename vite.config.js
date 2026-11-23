import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Configuración de Vite (sirve el sitio en local y lo compila en dist/).
// Este sitio tiene varias páginas: cada archivo .html de la raíz es una página
// y se declara en PAGINAS para que también salga en dist/.
// PARA AGREGAR UNA PÁGINA: crear el .html en la raíz y sumar su nombre aquí.
// base: carpeta donde vivirá el sitio publicado ("/" en local; en GitHub Pages
// se define la variable VITE_BASE con la subcarpeta).
const PAGINAS = ['index', 'nosotros', 'productos', 'producto', 'obras', 'sostenibilidad', 'reciclaje', 'noticias', 'contacto', 'cotizar'];

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: {
    rollupOptions: {
      input: Object.fromEntries(PAGINAS.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
});
