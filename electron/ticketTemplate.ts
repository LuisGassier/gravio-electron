/**
 * Template HTML para tickets térmicos de 80mm
 * Formato optimizado para impresoras térmicas Epson TM-T88V
 */

interface TicketTemplateData {
  folio: string;
  fecha: Date;
  empresa: string;
  vehiculo: {
    placas: string;
    numeroEconomico: string;
  };
  operador: string;
  ruta: string;
  pesos: {
    entrada?: number;
    salida?: number;
    neto?: number;
  };
  fechaEntrada?: Date;
  fechaSalida?: Date;
  observaciones?: string;
}

/**
 * Genera el HTML para el ticket térmico
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
      second: '2-digit',
      hour12: false
    });
  };

  const formatWeight = (weight?: number) => {
    return weight ? weight.toFixed(2) : '0.00';
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
      font-family: 'Courier New', 'Courier', monospace;
      font-size: 12px;
      line-height: 1.4;
      width: 80mm;
      padding: 5mm;
      background: white;
      color: #000;
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
    }

    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
      letter-spacing: 1px;
    }

    .header .empresa {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .header .folio {
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
    }

    .divider {
      border-top: 2px dashed #000;
      margin: 8px 0;
    }

    .divider-solid {
      border-top: 1px solid #000;
      margin: 6px 0;
    }

    .section {
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 4px;
      text-decoration: underline;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 11px;
    }

    .label {
      font-weight: bold;
      width: 45%;
    }

    .value {
      width: 55%;
      text-align: right;
    }

    .pesos {
      margin-top: 8px;
    }

    .peso-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
      border-bottom: 1px dotted #000;
    }

    .peso-row:last-child {
      border-bottom: none;
    }

    .peso-row.highlight {
      font-size: 14px;
      font-weight: bold;
      background: #f0f0f0;
      padding: 6px 4px;
      border: 2px solid #000;
      margin-top: 4px;
    }

    .peso-label {
      font-weight: bold;
    }

    .peso-value {
      font-weight: bold;
    }

    .observaciones {
      margin-top: 8px;
      padding: 6px;
      border: 1px solid #000;
      background: #f9f9f9;
      font-size: 10px;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #333;
    }

    .footer .date {
      margin-top: 4px;
      font-size: 9px;
    }

    @media print {
      body {
        width: 80mm;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>GRAVIO</h1>
    <div class="empresa">${data.empresa}</div>
    <div style="font-size: 11px;">Sistema de Gestión de Relleno Sanitario</div>
    <div class="folio">FOLIO: ${data.folio}</div>
  </div>

  <div class="divider"></div>

  <!-- INFORMACIÓN DEL VEHÍCULO -->
  <div class="section">
    <div class="section-title">DATOS DEL VEHÍCULO</div>
    <div class="row">
      <span class="label">Placas:</span>
      <span class="value">${data.vehiculo.placas}</span>
    </div>
    <div class="row">
      <span class="label">No. Económico:</span>
      <span class="value">${data.vehiculo.numeroEconomico}</span>
    </div>
    <div class="row">
      <span class="label">Operador:</span>
      <span class="value">${data.operador}</span>
    </div>
    <div class="row">
      <span class="label">Ruta:</span>
      <span class="value">${data.ruta}</span>
    </div>
  </div>

  <div class="divider-solid"></div>

  <!-- FECHAS -->
  <div class="section">
    <div class="row">
      <span class="label">Fecha Entrada:</span>
      <span class="value">${data.fechaEntrada ? formatDate(data.fechaEntrada) : 'N/A'}</span>
    </div>
    <div class="row">
      <span class="label">Hora Entrada:</span>
      <span class="value">${data.fechaEntrada ? formatTime(data.fechaEntrada) : 'N/A'}</span>
    </div>
    <div class="row">
      <span class="label">Fecha Salida:</span>
      <span class="value">${data.fechaSalida ? formatDate(data.fechaSalida) : 'N/A'}</span>
    </div>
    <div class="row">
      <span class="label">Hora Salida:</span>
      <span class="value">${data.fechaSalida ? formatTime(data.fechaSalida) : 'N/A'}</span>
    </div>
  </div>

  <div class="divider"></div>

  <!-- PESOS -->
  <div class="section pesos">
    <div class="section-title">REGISTRO DE PESOS</div>

    <div class="peso-row">
      <span class="peso-label">Peso Entrada:</span>
      <span class="peso-value">${formatWeight(data.pesos.entrada)} kg</span>
    </div>

    <div class="peso-row">
      <span class="peso-label">Peso Salida:</span>
      <span class="peso-value">${formatWeight(data.pesos.salida)} kg</span>
    </div>

    <div class="peso-row highlight">
      <span class="peso-label">PESO NETO:</span>
      <span class="peso-value">${formatWeight(data.pesos.neto)} kg</span>
    </div>
  </div>

  ${data.observaciones ? `
  <div class="divider-solid"></div>

  <!-- OBSERVACIONES -->
  <div class="section">
    <div class="section-title">OBSERVACIONES</div>
    <div class="observaciones">${data.observaciones}</div>
  </div>
  ` : ''}

  <div class="divider"></div>

  <!-- FOOTER -->
  <div class="footer">
    <div>Sistema Gravio v1.0</div>
    <div class="date">Impreso: ${formatDate(new Date())} ${formatTime(new Date())}</div>
    <div style="margin-top: 8px; font-size: 8px;">
      Este documento es válido sin firma ni sello
    </div>
  </div>
</body>
</html>
  `.trim();
}
