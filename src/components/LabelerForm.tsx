import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getContador,
  getProductos,
  getMarcas,
  postImpresion,
  patchContador
} from '../services/airtable';
import { buildCodigo21 } from '../utils/formatters';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import Toast from './ui/Toast';

interface Product {
  id: string;
  label: string;
  codigo: string;
  rne: string;
  rnpa: string;
}
interface Marca {
  id: string;
  label: string;
  indicador: number;
}

const LabelerForm: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [contador, setContador] = useState<{ id: string; nextId: number } | null>(null);
  const [form, setForm] = useState({
    productoId: '',
    marcaId: '',
    lote: '',
    fechaFab: '',
    fechaVto: '',
    peso: 0,
  });
  const [toast, setToast] = useState<{visible:boolean; message:string}>({visible:false, message:''});

  useEffect(() => {
    async function loadData() {
      const cnt = await getContador();
      setContador(cnt);
      const prods = await getProductos();
      setProductos(prods);
      const mks = await getMarcas();
      setMarcas(mks);
      const hoy = new Date().toISOString().slice(0,10);
      const vto = new Date(); vto.setFullYear(vto.getFullYear()+2);
      setForm(f => ({ ...f, fechaFab: hoy, fechaVto: vto.toISOString().slice(0,10) }));
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'peso' ? Number(value) : value
    }));
  };

  const handleConnectScale = async () => {
    if (!('serial' in navigator)) return alert('WebSerial no soportado');
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });
    const rdr = port.readable.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { value, done } = await rdr.read();
      if (done) break;
      const m = /([\d.]+)/.exec(value);
      if (m) setForm(f => ({ ...f, peso: Math.round(parseFloat(m[1]) * 1000) }));
    }
  };

  const handlePrint = async () => {
    if (!contador) return;
    const prod = productos.find(p => p.id === form.productoId);
    const mkt = marcas.find(m => m.id === form.marcaId);
    if (!prod || !mkt) return alert('Seleccione producto y marca');
    const idLata = contador.nextId;
    const codigo21 = buildCodigo21({
      idLata,
      lote: form.lote,
      indicador: mkt.indicador,
      codigoProducto: prod.codigo,
      pesoGramos: form.peso
    });
    const zpl = [
      '^XA^CI28',
      // Nombre del producto
      `^FO20,20^A0N,24,24^FD${prod.label}^FS`,
      // Fecha de fabricación (obligatoria)
      `^FO20,50^A0N,18,18^FDF. Fab: ${form.fechaFab}^FS`,
      // Fecha de vencimiento (obligatoria)
      `^FO20,75^A0N,18,18^FDF. Vto: ${form.fechaVto}^FS`,
      // RNE (obligatorio)
      `^FO20,100^A0N,20,20^FDRNE: ${prod.rne}^FS`,
      // RNPA (obligatorio)
      `^FO150,100^A0N,20,20^FDRNPA: ${prod.rnpa}^FS`,
      // Número de lote
      `^FO20,130^A0N,20,20^FDLOT ${form.lote}^FS`,
      // Código de barras 21 dígitos
      `^FO20,160^BY2^BCN,80,Y,N,N^FD${codigo21}^FS`,
      '^XA^CI28',
      `^FO20,20^A0N,28,28^FD${prod.label}^FS`,
      `^FO20,60^A0N,20,20^FDRNE ${prod.rne} RNPA ${prod.rnpa}^FS`,
      `^FO20,90^A0N,22,22^FDLOT ${form.lote}^FS`,
      `^FO20,130^BY2^BCN,80,Y,N,N^FD${codigo21}^FS`,
      '^XZ'
    ].join('\n');

    await postImpresion({
      id_lata: idLata,
      lote: Number(form.lote),
      marcaId: form.marcaId,
      productoId: form.productoId,
      peso: form.peso,
      rne: prod.rne,
      rnpa: prod.rnpa,
      codigo21
    });
    // Incremento de contador en +1
    await patchContador(contador.id, idLata + 1);
    setContador({ id: contador.id, nextId: idLata + 1 });

    (window as any).BrowserPrint.getDefaultDevice('printer', (p: any) => p.send(zpl));

    setToast({visible: true, message: 'Etiqueta impresa con éxito!'});
    setTimeout(() => setToast({visible: false, message: ''}), 3000);

    if (!window.confirm('¿Mismo artículo?')) {
      window.location.reload();
    } else {
      setForm(f => ({ ...f, peso: 0 }));
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Dropdown options={productos.map(p => ({value: p.id, label: p.label}))}
          value={form.productoId} onChange={val => setForm(f => ({...f, productoId: val}))} />
        <Dropdown options={marcas.map(m => ({value: m.id, label: m.label}))}
          value={form.marcaId} onChange={val => setForm(f => ({...f, marcaId: val}))} />
        <input name="lote" placeholder="Lote"
          className="mt-1 block w-full rounded-xl border border-neutral-200 focus:border-brand focus:ring focus:ring-brand-light focus:ring-opacity-50 px-3 py-2"
          value={form.lote} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-4">
          <input type="date" name="fechaFab"
            className="mt-1 block w-full rounded-xl border border-neutral-200 focus:border-brand focus:ring focus:ring-brand-light focus:ring-opacity-50 px-3 py-2"
            value={form.fechaFab} onChange={handleChange} />
          <input type="date" name="fechaVto"
            className="mt-1 block w-full rounded-xl border border-neutral-200 focus:border-brand focus:ring focus:ring-brand-light focus:ring-opacity-50 px-3 py-2"
            value={form.fechaVto} onChange={handleChange} />
        </div>
        <div>
          <Button onClick={handleConnectScale}>Conectar Báscula</Button>
          <motion.span key={form.peso}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="ml-4 font-semibold text-lg"
          >{form.peso} g</motion.span>
        </div>
        <Button onClick={handlePrint}>Imprimir</Button>
      </div>
      <Toast visible={toast.visible} message={toast.message} />
    </>
);};

export default LabelerForm;
