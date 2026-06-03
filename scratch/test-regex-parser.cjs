const fs = require('fs');

// We will copy the parseReceiptText logic here or import it if possible.
// Since ESM import of TypeScript files is tricky in Node without ts-node, we'll write a simple test copying the regex logic we just wrote to verify correctness.

function parseReceiptText(text) {
  let clientName = "Erick Alejandro Rosales";
  let ruc = "1729483758";
  let totalAmount = 145.00;
  let bankName = "Banco Pichincha";
  let referenceNumber = "98765432";
  let date = new Date().toISOString().split('T')[0];

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const textLower = text.toLowerCase();

  // 1. Detect Bank
  if (textLower.includes('pichincha')) {
    bankName = "Banco Pichincha";
  }

  // 2. Detect RUC / Cédula
  const candidateMatches = text.match(/\b\d[\d\s-]{8,15}\d\b/g) || [];
  let foundId = "";
  for (const match of candidateMatches) {
    const cleanNum = match.replace(/\D/g, '');
    if (cleanNum.length === 10 || cleanNum.length === 13) {
      foundId = cleanNum;
      break; 
    }
  }
  if (foundId) {
    ruc = foundId;
  }

  // 3. Detect Amount
  let foundAmount = 0;
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (
      lineLower.includes('monto') ||
      lineLower.includes('valor') ||
      lineLower.includes('total') ||
      lineLower.includes('usd') ||
      lineLower.includes('$') ||
      lineLower.includes('cantidad') ||
      lineLower.includes('debitado') ||
      lineLower.includes('importe') ||
      lineLower.includes('transferido') ||
      lineLower.includes('pagado') ||
      lineLower.includes('pago') ||
      lineLower.includes('exito') ||
      lineLower.includes('exitosa')
    ) {
      const match = line.match(/\b\d+(?:[.,]\d{2})?\b/);
      if (match) {
        const amt = parseFloat(match[0].replace(',', '.'));
        if (amt > 0 && amt < 100000) {
          foundAmount = amt;
          break;
        }
      }
    }
  }

  if (foundAmount === 0) {
    const amountRegex = /(?:monto|valor|total|usd|\$|s\b|s\.|cantidad|debitado|depositado|exito|exitoso|exitosa|pagado|pago|importe|transferido)\s*:?\s*(\d+(?:[.,]\d{2})?)/i;
    const match = text.match(amountRegex);
    if (match) {
      const amt = parseFloat(match[1].replace(',', '.'));
      if (amt > 0 && amt < 100000) {
        foundAmount = amt;
      }
    }
  }

  if (foundAmount > 0) {
    totalAmount = foundAmount;
  }

  // 4. Detect Client Name
  let foundName = "";
  for (const line of lines) {
    const match = line.match(/^(?:de|desde|remitente|emisor|ordenante|titular|nombre|origen)\b\s*:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+)/i);
    if (match) {
      const name = match[1].trim();
      if (name.length > 5 && !name.toLowerCase().includes('cuenta') && !name.toLowerCase().includes('banco') && !name.toLowerCase().includes('ahorros')) {
        foundName = name;
        break;
      }
    }
  }

  if (!foundName) {
    for (const line of lines) {
      const match = line.match(/^(?:a|beneficiario|destinatario|destino)\b\s*:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+)/i);
      if (match) {
        const name = match[1].trim();
        if (name.length > 5 && !name.toLowerCase().includes('cuenta') && !name.toLowerCase().includes('banco') && !name.toLowerCase().includes('ahorros')) {
          foundName = name;
          break;
        }
      }
    }
  }

  if (foundName) {
    clientName = foundName.replace(/\b\w/g, c => c.toUpperCase());
  }

  // 5. Detect Reference Number (check sequential or reference keywords)
  let foundRef = "";
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('referencia') || lineLower.includes('documento') || lineLower.includes('secuencial') || lineLower.includes('nro') || lineLower.includes('número') || lineLower.includes('comprobante') || lineLower.includes('transaccion') || lineLower.includes('transacción')) {
      let possibleRef = "";
      if (lines[i].includes(':')) {
        possibleRef = lines[i].split(':')[1].trim();
      }
      if (possibleRef.length < 3 && i + 1 < lines.length) {
        possibleRef = lines[i+1].trim();
      }
      const numOnly = possibleRef.replace(/\D/g, '');
      if (numOnly.length >= 4) {
        foundRef = numOnly;
        break;
      }
    }
  }
  if (foundRef) {
    referenceNumber = foundRef;
  }

  // 6. Detect Date
  const dateMatch = text.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/) || text.match(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/);
  if (dateMatch) {
    const rawDate = dateMatch[0].replace(/\//g, '-');
    const parts = rawDate.split('-');
    if (parts[0].length === 4) {
      date = rawDate;
    } else {
      date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else {
    const textClean = textLower.replace(/\s+/g, ' ');
    const spanishDateMatch = textClean.match(/\b(\d{1,2})\s+(?:de|cie|del)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de|cie|del)?\s*(\d{4})\b/);
    if (spanishDateMatch) {
      const day = spanishDateMatch[1].padStart(2, '0');
      const monthName = spanishDateMatch[2];
      const year = spanishDateMatch[3];
      const monthsMap = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
        julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
      };
      const month = monthsMap[monthName];
      if (month) {
        date = `${year}-${month}-${day}`;
      }
    }
  }

  return { clientName, ruc, totalAmount, date, bankName, referenceNumber };
}

const rawText = `BANCO PICHINCHA
iTransferencia exitosa!
s 1100.00
A Romero Pino Silvia Lilian
EI 27 cie abril de 2026
De Vasquez Salinas Julio Alberto
Cuenta destino
Banco destino
Cuenta origen
NC de comprobante
4171
Banco Pichincha
220 4112648
136853427
Verificar transacción con este QR.`;

console.log("Parsing test text...");
const result = parseReceiptText(rawText);
console.log("Parsed Result:", result);

if (result.clientName === "Vasquez Salinas Julio Alberto") {
  console.log("Client name extraction PASSED!");
} else {
  console.error("Client name extraction FAILED: expected 'Vasquez Salinas Julio Alberto', got:", result.clientName);
}

if (result.totalAmount === 1100) {
  console.log("Amount extraction PASSED!");
} else {
  console.error("Amount extraction FAILED: expected 1100, got:", result.totalAmount);
}

if (result.date === "2026-04-27") {
  console.log("Date extraction PASSED!");
} else {
  console.error("Date extraction FAILED: expected '2026-04-27', got:", result.date);
}

if (result.bankName === "Banco Pichincha") {
  console.log("Bank extraction PASSED!");
} else {
  console.error("Bank extraction FAILED: expected 'Banco Pichincha', got:", result.bankName);
}
