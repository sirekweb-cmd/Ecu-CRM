// src/utils/AccountingCore.ts
export interface AsientoDetalle {
  codigo_cuenta: string;
  nombre_cuenta: string;
  debe: number;
  haber: number;
}

export interface Asiento {
  id_asiento?: string;
  fecha: string;
  glosa: string;
  usuario_id: string;
  detalles: AsientoDetalle[];
  estado: 'ACTIVO' | 'ANULADO';
}

export class AccountingCore {
  
  // Validates the double entry accounting principle (Debe == Haber)
  // and the strict CHECK constraint ((debe > 0 AND haber = 0) OR (haber > 0 AND debe = 0))
  static validateAsiento(detalles: AsientoDetalle[]): boolean {
    let totalDebe = 0;
    let totalHaber = 0;

    for (const d of detalles) {
      if ((d.debe > 0 && d.haber > 0) || (d.debe < 0) || (d.haber < 0)) {
        throw new Error("Invalid entry: account cannot have both Debe and Haber > 0, and values must be positive.");
      }
      totalDebe += d.debe;
      totalHaber += d.haber;
    }

    if (Math.abs(totalDebe - totalHaber) > 0.01) { // 1 cent precision
      throw new Error(`Double entry validation failed: Debe (${totalDebe}) != Haber (${totalHaber})`);
    }

    return true;
  }

  static registrarCompra(monto: number, metodoPago: 'BANCOS' | 'CXP', glosa: string, usuario_id: string): Asiento {
    const detalles: AsientoDetalle[] = [
      { codigo_cuenta: '1.1.2.01', nombre_cuenta: 'Inventario de Mercaderías', debe: monto, haber: 0 }
    ];

    if (metodoPago === 'BANCOS') {
      detalles.push({ codigo_cuenta: '1.1.1.02', nombre_cuenta: 'Bancos', debe: 0, haber: monto });
    } else {
      detalles.push({ codigo_cuenta: '2.1.1.01', nombre_cuenta: 'Cuentas por Pagar', debe: 0, haber: monto });
    }

    this.validateAsiento(detalles);

    return {
      fecha: new Date().toISOString().split('T')[0],
      glosa,
      usuario_id,
      detalles,
      estado: 'ACTIVO'
    };
  }

  static registrarVenta(subtotal: number, costo: number, iva15: number, valorRetFuente: number, valorRetIva: number, glosa: string, usuario_id: string): { asientoVenta: Asiento, asientoCosto: Asiento } {
    const totalVenta = subtotal + iva15;
    const aCobrar = totalVenta - valorRetFuente - valorRetIva;

    const detallesVenta: AsientoDetalle[] = [
      { codigo_cuenta: '1.1.1.02', nombre_cuenta: 'Bancos/Caja', debe: aCobrar, haber: 0 },
      { codigo_cuenta: '1.3', nombre_cuenta: 'Retenciones en la Fuente por Cobrar', debe: valorRetFuente, haber: 0 },
      { codigo_cuenta: '1.4', nombre_cuenta: 'Retenciones de IVA por Cobrar', debe: valorRetIva, haber: 0 },
      { codigo_cuenta: '4.1', nombre_cuenta: 'Ingresos por Ventas', debe: 0, haber: subtotal },
      { codigo_cuenta: '2.1.2.01', nombre_cuenta: 'IVA en Ventas (15%)', debe: 0, haber: iva15 },
    ];

    this.validateAsiento(detallesVenta.filter(d => d.debe > 0 || d.haber > 0));

    const asientoVenta: Asiento = {
      fecha: new Date().toISOString().split('T')[0],
      glosa: `Venta: ${glosa}`,
      usuario_id,
      detalles: detallesVenta.filter(d => d.debe > 0 || d.haber > 0), // remove zero entries if retenciones = 0
      estado: 'ACTIVO'
    };

    const detallesCosto: AsientoDetalle[] = [
      { codigo_cuenta: '5.1', nombre_cuenta: 'Costo de Ventas', debe: costo, haber: 0 },
      { codigo_cuenta: '1.2', nombre_cuenta: 'Inventarios', debe: 0, haber: costo }
    ];

    this.validateAsiento(detallesCosto.filter(d => d.debe > 0 || d.haber > 0));

    const asientoCosto: Asiento = {
      fecha: new Date().toISOString().split('T')[0],
      glosa: `Costo de Venta: ${glosa}`,
      usuario_id,
      detalles: detallesCosto,
      estado: 'ACTIVO'
    };

    return { asientoVenta, asientoCosto };
  }

  static procesarRolPagosMensual(sueldo: number, horasExtras: number, glosa: string, usuario_id: string): Asiento {
    const totalIngresos = sueldo + horasExtras;
    const iessPersonal = totalIngresos * 0.0945;
    const netoAPagar = totalIngresos - iessPersonal;
    
    // Debit Gasto Sueldos against Haber (IESS por pagar y Bancos)
    const detalles: AsientoDetalle[] = [
      { codigo_cuenta: '5.2.1.01', nombre_cuenta: 'Gasto Sueldos y Salarios', debe: totalIngresos, haber: 0 },
      { codigo_cuenta: '2.1.3.01', nombre_cuenta: 'IESS por Pagar', debe: 0, haber: iessPersonal },
      { codigo_cuenta: '1.1.1.02', nombre_cuenta: 'Bancos', debe: 0, haber: netoAPagar }
    ];

    this.validateAsiento(detalles);

    return {
      fecha: new Date().toISOString().split('T')[0],
      glosa,
      usuario_id,
      detalles,
      estado: 'ACTIVO'
    };
  }
}
