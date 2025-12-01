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
      font-family: 'Courier New', 'Courier', monospace;
      font-size: 10px;
      line-height: 1.3;
      width: 80mm;
      padding: 3mm;
      background: white;
      color: #000;
    }

    .logo-container {
      text-align: center;
      margin-bottom: 3px;
    }

    .logo {
      max-width: 60mm;
      max-height: 15mm;
      margin: 0 auto;
    }

    .company-name {
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .company-address {
      text-align: center;
      font-size: 9px;
      margin-bottom: 4px;
    }

    .field {
      font-size: 10px;
      margin-bottom: 1px;
      line-height: 1.4;
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

  ${data.companyName ? `
  <div class="company-name">${data.companyName}</div>
  ` : ''}

  ${data.companyAddress ? `
  <div class="company-address">${data.companyAddress}</div>
  ` : ''}

  <div class="field">Folio: ${data.folio}</div>
  <div class="field">Entrada: ${data.fechaEntrada ? `${formatDate(data.fechaEntrada)} ${formatTime(data.fechaEntrada)}` : 'N/A'}</div>
  <div class="field">Salida: ${data.fechaSalida ? `${formatDate(data.fechaSalida)} ${formatTime(data.fechaSalida)}` : 'N/A'}</div>
  <div class="field">${data.vehiculo.placas ? `Placas: ${data.vehiculo.placas}` : `Numero Economico: ${data.vehiculo.numeroEconomico}`}</div>
  <div class="field">Concepto: ${data.conceptoClave} - ${data.conceptoNombre}</div>
  <div class="field">Empresa: ${data.empresaClave} - ${data.empresaNombre}</div>
  <div class="field">Operador: ${data.operadorClave} - ${data.operadorNombre}</div>
  <div class="field">Ruta: ${data.rutaClave} - ${data.rutaNombre}</div>
  <div class="field">Vehiculo: ${data.vehiculo.numeroEconomico}</div>

  <div class="field">Peso Bruto: ${kgToToneladas(data.pesos.entrada)} t</div>
  <div class="field">Peso Tara: ${kgToToneladas(data.pesos.salida)} t</div>
  <div class="field">Peso Neto: ${kgToToneladas(data.pesos.neto)} t</div>
  <div class="field">Tiempo: ${calcularTiempo()} min</div>

  ${data.observaciones ? `<div class="field">Obs: ${data.observaciones}</div>` : ''}
  ${data.usuario ? `<div class="field">Usuario: ${data.usuario}</div>` : ''}
</body>
</html>
  `.trim();
}
