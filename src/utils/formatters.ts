export function buildCodigo21(params: {
  idLata: number;
  lote: string;
  indicador: number;
  codigoProducto: string;
  pesoGramos: number;
}): string {
  const { idLata, lote, indicador, codigoProducto, pesoGramos } = params;
  const pId = String(idLata).padStart(6, '0');
  const pLote = String(lote).padStart(5, '0');
  const pCodProd = String(codigoProducto).padStart(3, '0');
  const pPeso = String(pesoGramos).padStart(6, '0');
  return `${pId}${pLote}${indicador}${pCodProd}${pPeso}`;
}