// frontend/src/lib/exportPdf.js
//
// Usa html2canvas-pro (compatible con los colores oklch de Tailwind v4).
// Instalación: npm install html2canvas-pro jspdf
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Captura un elemento del DOM y lo guarda como PDF A4.
 *
 * Si el contenido es más largo que una hoja, lo parte en varias páginas
 * SIN cortar por la mitad los bloques marcados con el atributo
 * `data-pdf-block` (tarjetas, gráficas, tablas). Si un bloque no cabe en
 * lo que queda de la página, se pasa completo a la siguiente.
 *
 * @param {HTMLElement} elemento  Nodo a capturar (ref.current)
 * @param {string} nombreArchivo  Ej. 'panel-riesgos.pdf'
 * @param {string} titulo         Título de la primera página
 * @param {string} subtitulo      Línea opcional bajo el título
 */
export async function exportarElementoAPdf(
  elemento,
  nombreArchivo = 'reporte.pdf',
  titulo = '',
  subtitulo = '',
) {
  if (!elemento) return;

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: elemento.scrollWidth,
  });

  // Posición de cada bloque "indivisible", en píxeles del canvas
  const rectElemento = elemento.getBoundingClientRect();
  const escala = canvas.width / rectElemento.width;

  const bloques = [...elemento.querySelectorAll('[data-pdf-block]')].map(
    (nodo) => {
      const rect = nodo.getBoundingClientRect();
      return {
        top: (rect.top - rectElemento.top) * escala,
        bottom: (rect.bottom - rectElemento.top) * escala,
      };
    },
  );

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const imgW = pageW - margin * 2;
  const pxPorMm = canvas.width / imgW;
  const altoUtilMm = pageH - margin * 2;

  // Encabezado de la primera página
  let encabezadoMm = 0;
  if (titulo) {
    pdf.setFontSize(16);
    pdf.setTextColor(30, 41, 59);
    pdf.text(titulo, margin, margin + 6);
    encabezadoMm = 10;
  }
  if (subtitulo) {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(subtitulo, margin, margin + encabezadoMm + 2);
    encabezadoMm += 7;
  }
  if (encabezadoMm) encabezadoMm += 3;

  let inicioPx = 0;
  let primera = true;

  while (inicioPx < canvas.height) {
    const disponibleMm = primera ? altoUtilMm - encabezadoMm : altoUtilMm;
    let finPx = Math.min(
      canvas.height,
      inicioPx + Math.floor(disponibleMm * pxPorMm),
    );

    // Si el corte cae dentro de un bloque, se corta justo antes de él
    // (siempre que el bloque no empiece al inicio de esta página).
    if (finPx < canvas.height) {
      const cortado = bloques.find(
        (b) => b.top > inicioPx + 40 && b.top < finPx && b.bottom > finPx,
      );
      if (cortado) finPx = Math.floor(cortado.top);
    }

    const rebanadaPx = finPx - inicioPx;

    const rebanada = document.createElement('canvas');
    rebanada.width = canvas.width;
    rebanada.height = rebanadaPx;
    rebanada
      .getContext('2d')
      .drawImage(
        canvas,
        0, inicioPx, canvas.width, rebanadaPx,
        0, 0, canvas.width, rebanadaPx,
      );

    if (!primera) pdf.addPage();

    pdf.addImage(
      rebanada.toDataURL('image/png'),
      'PNG',
      margin,
      primera ? margin + encabezadoMm : margin,
      imgW,
      rebanadaPx / pxPorMm,
    );

    inicioPx = finPx;
    primera = false;
  }

  pdf.save(nombreArchivo);
}
