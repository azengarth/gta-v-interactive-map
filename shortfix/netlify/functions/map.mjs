import { getStore } from '@netlify/blobs';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function response(status, body) {
  return new Response(JSON.stringify(body), { status, headers });
}

function makeId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export default async (request) => {
  try {
    const store = getStore('gta-v-maps');
    const url = new URL(request.url);

    if (request.method === 'GET') {
      const id = url.searchParams.get('id') || '';
      if (!/^[A-Za-z0-9]{8}$/.test(id)) return response(400, { error: 'ID no válido' });
      const data = await store.get(id, { type: 'json' });
      if (!data) return response(404, { error: 'Mapa no encontrado' });
      return response(200, data);
    }

    if (request.method === 'POST') {
      let data;
      try { data = await request.json(); }
      catch { return response(400, { error: 'JSON no válido' }); }

      if (!data || !Array.isArray(data.items)) {
        return response(400, { error: 'Faltan los elementos del mapa' });
      }

      const payload = {
        map: 'GTA V',
        version: 4,
        items: data.items,
        createdAt: new Date().toISOString()
      };

      // Netlify Blobs permite valores de hasta 5 MB; dejamos margen para la petición.
      const size = new TextEncoder().encode(JSON.stringify(payload)).byteLength;
      if (size > 4_500_000) {
        return response(413, { error: 'El mapa es demasiado grande para compartirlo de esta forma' });
      }

      let id = null;
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = makeId();
        const existing = await store.get(candidate);
        if (existing === null) {
          id = candidate;
          break;
        }
      }

      if (!id) return response(500, { error: 'No se pudo generar un ID único' });

      await store.setJSON(id, payload);
      return response(200, { id });
    }

    return response(405, { error: 'Método no permitido' });
  } catch (error) {
    console.error('GTA V map function error:', error);
    return response(500, { error: 'Netlify no pudo guardar/cargar el mapa. Revisa los logs de la función.' });
  }
};
