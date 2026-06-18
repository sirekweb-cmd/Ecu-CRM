const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Configuración del Transporter (Transportista) SMTP
 * Utiliza Gmail por el puerto seguro 465 (SSL/TLS)
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    user: 'sirekweb@gmail.com',
    pass: 'iruz enyt lbbg mqho' // Contraseña de aplicación
  }
});

/**
 * Plantilla HTML Premium/Oscura para el correo
 */
const getEmailTemplate = (nombreEmpleado, periodo) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a; /* Slate 900 */
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc; /* Slate 50 */
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #1e293b; /* Slate 800 */
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155; /* Slate 700 */
    }
    .header {
      background-color: #2563eb; /* Blue 600 */
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #f1f5f9; /* Slate 100 */
    }
    .message {
      color: #cbd5e1; /* Slate 300 */
      margin-bottom: 30px;
      font-size: 15px;
    }
    .highlight-box {
      background-color: #0f172a;
      border-left: 4px solid #3b82f6; /* Blue 500 */
      padding: 15px 20px;
      border-radius: 4px;
      margin-bottom: 30px;
      font-weight: 500;
      color: #e2e8f0;
    }
    .footer {
      padding: 20px 30px;
      background-color: #0f172a;
      text-align: center;
      font-size: 12px;
      color: #64748b; /* Slate 500 */
      border-top: 1px solid #334155;
    }
    .icon {
      font-size: 32px;
      margin-bottom: 10px;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="icon">💼</span>
      <h1>S.I.D-CRM</h1>
    </div>
    <div class="content">
      <div class="greeting">Hola, ${nombreEmpleado}</div>
      <div class="message">
        Esperamos que te encuentres excelente. Te adjuntamos tu rol de pago correspondiente al periodo de <strong>${periodo}</strong> en formato PDF.
      </div>
      <div class="highlight-box">
        Por favor, revisa el archivo adjunto. Si tienes alguna duda o discrepancia, no dudes en comunicarte con el departamento de Recursos Humanos.
      </div>
      <div class="message">
        Agradecemos profundamente tu compromiso y excelente labor en el equipo.<br><br>
        Saludos cordiales,<br>
        <strong>El Equipo de Recursos Humanos</strong>
      </div>
    </div>
    <div class="footer">
      Este es un correo generado automáticamente por S.I.D-CRM. Por favor, no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
`;

/**
 * Función Principal Asíncrona para enviar el Rol de Pago
 * 
 * @param {string} correoEmpleado - El correo de destino del empleado
 * @param {string} nombreEmpleado - El nombre del empleado para personalizar el saludo
 * @param {string} periodo - El periodo de pago (Ej: "Mayo 2026")
 * @param {string} rutaPdf - La ruta absoluta o relativa hacia el archivo PDF del rol de pago
 */
async function enviarRolDePago(correoEmpleado, nombreEmpleado, periodo, rutaPdf) {
  try {
    console.log(`[+] Iniciando envío a: ${correoEmpleado} | Empleado: ${nombreEmpleado}`);

    // Verificar que el archivo PDF exista localmente
    const resolvedPath = path.resolve(rutaPdf);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`El archivo PDF no existe en la ruta proporcionada: ${resolvedPath}`);
    }

    // Configurar las opciones del correo
    const mailOptions = {
      from: '"S.I.D-CRM Recursos Humanos" <sirekweb@gmail.com>',
      to: correoEmpleado,
      subject: `Comprobante de Rol de Pago - ${periodo}`,
      html: getEmailTemplate(nombreEmpleado, periodo),
      attachments: [
        {
          filename: `Rol_Pago_${nombreEmpleado.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.pdf`,
          path: resolvedPath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Ejecutar el envío
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[✔] Correo enviado exitosamente a ${correoEmpleado}`);
    console.log(`[i] ID del Mensaje: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`[X] Error al enviar el correo a ${correoEmpleado}:`);
    console.error(error.message || error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// EJEMPLO DE USO (Descomentar para probar)
// ==========================================
/*
(async () => {
  // Asegúrate de tener un PDF de prueba llamado "test.pdf" en la misma carpeta
  // fs.writeFileSync('test.pdf', 'Contenido PDF de prueba falso'); 

  await enviarRolDePago(
    'empleado.prueba@ejemplo.com', // Reemplaza con tu correo para probar
    'Juan Pérez',
    'Junio 2026',
    './test.pdf'
  );
})();
*/

module.exports = { enviarRolDePago };
