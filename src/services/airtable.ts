import Airtable from 'airtable';

Airtable.configure({
  apiKey: import.meta.env.VITE_AIRTABLE_KEY as string,
});

const base = Airtable.base(import.meta.env.VITE_AIRTABLE_BASE as string);

export async function getContador() {
  const records = await base('contadores')
    .select({ maxRecords: 1, fields: ['next_id_lata'] })
    .firstPage();
  const rec = records[0];
  return { id: rec.id, nextId: rec.fields.next_id_lata as number };
}

export async function getProductos() {
  const records = await base('productos')
    .select({ fields: ['nombre', 'codigo_producto', 'rne', 'rnpa'] })
    .all();
  return records.map(r => ({
    id: r.id,
    label: r.fields.nombre as string,
    codigo: String(r.fields.codigo_producto).padStart(3, '0'),
    rne: r.fields.rne as string,
    rnpa: r.fields.rnpa as string,
  }));
}

export async function getMarcas() {
  const records = await base('marcas')
    .select({ fields: ['nombre', 'indicador'] })
    .all();
  return records.map(r => ({
    id: r.id,
    label: r.fields.nombre as string,
    indicador: r.fields.indicador as number
  }));
}

export async function postImpresion(data: any) {
  await base('impresiones').create([
    {
      fields: {
        id_lata: data.id_lata,
        lote: data.lote,
        marca: [data.marcaId],
        producto: [data.productoId],
        peso_g: data.peso,
        rne: data.rne,
        rnpa: data.rnpa,
        codigo21: data.codigo21
      }
    }
  ]);
}

export async function patchContador(id: string, nextId: number) {
  await base('contadores').update([
    { id, fields: { next_id_lata: nextId } }
  ]);
}