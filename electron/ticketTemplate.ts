/**
 * Template HTML para tickets térmicos de 80mm
 * Formato optimizado para impresoras térmicas Epson TM-T88V
 */

interface TicketTemplateData {
  folio: string;
  fecha: Date;
  companyName?: string;
  companyAddress?: string;
  companyLogo?: string;
  empresaClave: string;
  empresaNombre: string;
  conceptoClave: string;
  conceptoNombre: string;
  vehiculo: {
    placas: string;
    numeroEconomico: string;
  };
  operadorClave: string;
  operadorNombre: string;
  rutaClave: string;
  rutaNombre: string;
  pesos: {
    entrada?: number;
    salida?: number;
    neto?: number;
  };
  fechaEntrada?: Date;
  fechaSalida?: Date;
  observaciones?: string;
  usuario?: string;
}

/**
 * Genera el HTML para el ticket térmico simplificado
 */
export function generateTicketHTML(data: TicketTemplateData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Convertir kilogramos a toneladas (1 tonelada = 1000 kg)
  const kgToToneladas = (kg?: number) => {
    if (!kg) return '0.000';
    return (kg / 1000).toFixed(3);
  };

  // Calcular tiempo de permanencia en minutos
  const calcularTiempo = () => {
    if (!data.fechaEntrada || !data.fechaSalida) return '0';
    const diffMs = data.fechaSalida.getTime() - data.fechaEntrada.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes.toString();
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      font-weight: bold;
      line-height: 1.4;
      width: 80mm;
      padding: 2mm 3mm;
      background: white;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .logo-container {
      text-align: center;
      margin-bottom: 4px;
    }

    .logo {
      max-width: 65mm;
      max-height: 18mm;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 6px;
    }

    .company-name {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 1px;
      line-height: 1.2;
    }

    .company-address {
      font-size: 10px;
      font-weight: normal;
      margin-bottom: 4px;
    }

    .separator {
      border-bottom: 1px dashed #000;
      margin: 3px 0;
    }

    .folio {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .field {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 1.5px;
      line-height: 1.3;
    }

    .field-label {
      display: inline-block;
      min-width: 50px;
    }

    .section-title {
      font-size: 11px;
      font-weight: bold;
      margin-top: 4px;
      margin-bottom: 2px;
      text-decoration: underline;
    }

    .pesos-section {
      margin-top: 5px;
      padding-top: 3px;
      border-top: 1px solid #000;
    }

    .peso-field {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 1px;
      display: flex;
      justify-content: space-between;
    }

    .footer {
      margin-top: 5px;
      padding-top: 3px;
      border-top: 1px dashed #000;
      font-size: 9px;
      font-weight: normal;
    }

    @media print {
      body {
        width: 80mm;
      }
    }
  </style>
</head>
<body>
  ${data.companyLogo ? `
  <div class="logo-container">
    <img src="${data.companyLogo}" alt="Logo" class="logo">
  </div>
  ` : ''}

  <div class="header">
    ${data.companyName ? `<div class="company-name">${data.companyName}</div>` : ''}
    ${data.companyAddress ? `<div class="company-address">${data.companyAddress}</div>` : ''}
  </div>

  <div class="folio">Folio: ${data.folio}</div>
  <div class="field">Entrada: ${data.fechaEntrada ? `${formatDate(data.fechaEntrada)} ${formatTime(data.fechaEntrada)}` : 'N/A'}</div>
  <div class="field">Salida: ${data.fechaSalida ? `${formatDate(data.fechaSalida)} ${formatTime(data.fechaSalida)}` : 'N/A'}</div>
  <div class="field">Placas: ${data.vehiculo.placas}</div>

  <div class="separator"></div>

  <div class="field">Concepto: ${data.conceptoClave} - ${data.conceptoNombre}</div>
  <div class="field">Empresa: ${data.empresaClave} - ${data.empresaNombre}</div>
  <div class="field">Operador: ${data.operadorClave} - ${data.operadorNombre}</div>
  <div class="field">Ruta: ${data.rutaClave} - ${data.rutaNombre}</div>
  <div class="field">Vehiculo: ${data.vehiculo.numeroEconomico}</div>

  <div class="pesos-section">
    <div class="peso-field">
      <span>Peso Bruto:</span>
      <span>${kgToToneladas(data.pesos.entrada)} t</span>
    </div>
    <div class="peso-field">
      <span>Peso Tara:</span>
      <span>${kgToToneladas(data.pesos.salida)} t</span>
    </div>
    <div class="peso-field">
      <span>Peso Neto:</span>
      <span>${kgToToneladas(data.pesos.neto)} t</span>
    </div>
    <div class="peso-field">
      <span>Tiempo:</span>
      <span>${calcularTiempo()} min</span>
    </div>
  </div>

  <div class="footer">
    ${data.observaciones ? `<div>Obs: ${data.observaciones}</div>` : ''}
    ${data.usuario ? `<div>Usuario: ${data.usuario}</div>` : ''}
  </div>
</body>
</html>
  `.trim();
}
