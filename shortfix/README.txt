GTA V INTERACTIVE MAP — ENLACES CORTOS

Esta versión usa una Netlify Function + Netlify Blobs para guardar cada mapa y generar un enlace corto.

IMPORTANTE: NO subas solo index.html. Debes subir todo el contenido de esta carpeta a un repositorio de GitHub y conectar ese repositorio con Netlify.

Estructura:
  index.html
  netlify.toml
  package.json
  netlify/functions/map.mjs

Cuando esté publicado, el botón Compartir crea enlaces como:
  https://TU-SITIO.netlify.app/?map=Ab7Kx92P

Los mapas compartidos se guardan en Netlify Blobs y permanecen disponibles aunque vuelvas a desplegar el sitio.
