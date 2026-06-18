import React, { useState, useEffect } from 'react';
import { useDepartment } from '../context/DepartmentContext';
import { FileText, TrendingUp, DollarSign, Download, ShoppingCart, LayoutDashboard, Scale, AlertTriangle } from 'lucide-react';
import PurchasesAndExpenses from './PurchasesAndExpenses';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import html2pdf from 'html2pdf.js';

export const FinancialReports: React.FC<{ currentUserRole?: string, currentUser?: any }> = ({ currentUserRole, currentUser }) => {
  const { activeDepartment } = useDepartment();
  const [reportType, setReportType] = useState<'dashboard' | 'comprobacion' | 'resultados' | 'general' | 'flujo' | 'compras_gastos'>('dashboard');
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/asientos').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ])
    .then(([ledgerData, productsData]) => {
      setLedger(ledgerData);
      setProducts(productsData);
      setDataLoaded(true);
    })
    .catch(err => {
      console.error("Error fetching data", err);
      setDataLoaded(true);
    });
  }, []);

  // Helpers
  const sumByPrefix = (prefix: string) => {
    const filtered = ledger.filter(d => d.codigo_cuenta && d.codigo_cuenta.startsWith(prefix));
    const debe = filtered.reduce((acc, curr) => acc + (curr.debe || 0), 0);
    const haber = filtered.reduce((acc, curr) => acc + (curr.haber || 0), 0);
    return { debe, haber, netoDeudor: debe - haber, netoAcreedor: haber - debe };
  };

  const getAccountGroups = (prefix: string) => {
    const groups: Record<string, { codigo: string, nombre: string, debe: number, haber: number, netoDeudor: number, netoAcreedor: number }> = {};
    ledger.forEach(d => {
      if (d.codigo_cuenta && d.codigo_cuenta.startsWith(prefix)) {
        if (!groups[d.codigo_cuenta]) {
          groups[d.codigo_cuenta] = { codigo: d.codigo_cuenta, nombre: d.nombre_cuenta, debe: 0, haber: 0, netoDeudor: 0, netoAcreedor: 0 };
        }
        groups[d.codigo_cuenta].debe += (d.debe || 0);
        groups[d.codigo_cuenta].haber += (d.haber || 0);
        groups[d.codigo_cuenta].netoDeudor = groups[d.codigo_cuenta].debe - groups[d.codigo_cuenta].haber;
        groups[d.codigo_cuenta].netoAcreedor = groups[d.codigo_cuenta].haber - groups[d.codigo_cuenta].debe;
      }
    });
    return Object.values(groups).sort((a, b) => a.codigo.localeCompare(b.codigo));
  };

  // Calculations
  const ingresos = sumByPrefix('4');
  const costos = sumByPrefix('5');
  const gastos = sumByPrefix('6');
  
  const utilidadBruta = ingresos.netoAcreedor - costos.netoDeudor;
  const utilidadNeta = utilidadBruta - gastos.netoDeudor;

  const activos = sumByPrefix('1');
  const pasivos = sumByPrefix('2');
  const patrimonio = sumByPrefix('3');

  const totalActivos = activos.netoDeudor;
  const totalPasivos = pasivos.netoAcreedor;
  const totalPatrimonio = patrimonio.netoAcreedor;
  const patrimonioYUtilidad = totalPatrimonio + utilidadNeta;

  // Chart Data
  const chartData = [
    { name: 'Ingresos', Monto: ingresos.netoAcreedor, fill: '#10b981' },
    { name: 'Costos', Monto: costos.netoDeudor, fill: '#ef4444' },
    { name: 'Gastos', Monto: gastos.netoDeudor, fill: '#f59e0b' }
  ];

  const lowStockProducts = products.filter(p => (p.stock_actual || 0) < 10).sort((a, b) => (a.stock_actual || 0) - (b.stock_actual || 0));

  const exportPdf = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     `Reporte_Financiero_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Reportes Financieros {activeDepartment ? `- ${activeDepartment}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">Análisis centralizado de transacciones y estados contables.</p>
        </div>
        <button onClick={exportPdf} className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors">
          <Download className="w-4 h-4" /> Exportar a PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setReportType('dashboard')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'dashboard' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard Ejecutivo
        </button>
        <button 
          onClick={() => setReportType('comprobacion')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'comprobacion' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <FileText className="w-4 h-4" /> Balance de Comprobación
        </button>
        <button 
          onClick={() => setReportType('resultados')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'resultados' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <TrendingUp className="w-4 h-4" /> Estado de Resultados
        </button>
        <button 
          onClick={() => setReportType('general')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'general' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Scale className="w-4 h-4" /> Balance General
        </button>
        <button 
          onClick={() => setReportType('flujo')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'flujo' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <DollarSign className="w-4 h-4" /> Flujo de Caja
        </button>
        <button 
          onClick={() => setReportType('compras_gastos')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${reportType === 'compras_gastos' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Compras y Gastos
        </button>
      </div>

      <div id="report-content" className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 min-h-[500px]">
        
        {/* DASHBOARD EJECUTIVO */}
        {reportType === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-slate-800">Panel Ejecutivo Global</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Activos</p>
                <p className="text-2xl font-black text-blue-700">${totalActivos.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ingresos Globales</p>
                <p className="text-2xl font-black text-emerald-600">${ingresos.netoAcreedor.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Utilidad Neta</p>
                <p className={`text-2xl font-black ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${utilidadNeta.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo en Bancos</p>
                <p className="text-2xl font-black text-blue-700">${sumByPrefix('1.1.1').netoDeudor.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Ingresos vs. Costos/Gastos</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(val: number) => `$${val.toFixed(2)}`} />
                      <Bar dataKey="Monto" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Alertas de Stock Mínimo (&lt; 10 unds)</h3>
                <div className="overflow-y-auto max-h-64 pr-2">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-10">Inventario saludable. Ningún producto bajo el mínimo.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {lowStockProducts.map(p => (
                          <tr key={p.id} className="border-b border-red-100 last:border-0">
                            <td className="py-2 text-slate-700">{p.nombre}</td>
                            <td className="py-2 text-right"><span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-full text-xs">{p.stock_actual} unds</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BALANCE DE COMPROBACIÓN */}
        {reportType === 'comprobacion' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Balance de Comprobación de Sumas y Saldos</h2>
              <p className="text-sm text-slate-500">Al {new Date().toLocaleDateString()}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3 font-semibold uppercase text-xs tracking-wider border-r border-slate-200" rowSpan={2}>Código</th>
                    <th className="p-3 font-semibold uppercase text-xs tracking-wider border-r border-slate-200" rowSpan={2}>Cuenta</th>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-center border-b border-r border-slate-200" colSpan={2}>Sumas</th>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-center border-b border-slate-200" colSpan={2}>Saldos</th>
                  </tr>
                  <tr>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-right border-r border-slate-200">Debe</th>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-right border-r border-slate-200">Haber</th>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-right border-r border-slate-200">Deudor</th>
                    <th className="p-2 font-semibold uppercase text-xs tracking-wider text-right">Acreedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getAccountGroups('').filter(a => a.debe !== 0 || a.haber !== 0).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500 text-xs border-r border-slate-100">{row.codigo}</td>
                      <td className="p-3 font-medium text-slate-800 border-r border-slate-100">{row.nombre}</td>
                      <td className="p-3 text-right font-mono text-slate-600 border-r border-slate-100">${row.debe.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-slate-600 border-r border-slate-100">${row.haber.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 border-r border-slate-100">{row.netoDeudor > 0 ? `$${row.netoDeudor.toFixed(2)}` : ''}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{row.netoAcreedor > 0 ? `$${row.netoAcreedor.toFixed(2)}` : ''}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="p-3 text-right text-slate-800 uppercase text-xs tracking-wider border-r border-slate-200">Total Balance</td>
                    <td className="p-3 text-right font-mono text-blue-700 border-r border-slate-200">${sumByPrefix('').debe.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-blue-700 border-r border-slate-200">${sumByPrefix('').haber.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-emerald-700 border-r border-slate-200">${getAccountGroups('').reduce((acc, curr) => acc + (curr.netoDeudor > 0 ? curr.netoDeudor : 0), 0).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-emerald-700">${getAccountGroups('').reduce((acc, curr) => acc + (curr.netoAcreedor > 0 ? curr.netoAcreedor : 0), 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ESTADO DE RESULTADOS */}
        {reportType === 'resultados' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">Estado de Resultados Integral</h2>
              <p className="text-sm text-slate-500">Al {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-6">
              {/* Ingresos */}
              <div>
                <h3 className="font-bold text-emerald-800 border-b border-emerald-200 pb-1 mb-2 uppercase text-sm">4. Ingresos Operativos</h3>
                {getAccountGroups('4').map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700 px-4">
                    <span>{c.nombre}</span>
                    <span className="font-mono">${c.netoAcreedor.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-emerald-900 px-4 bg-emerald-50 mt-1">
                  <span>Total Ingresos</span>
                  <span className="font-mono">${ingresos.netoAcreedor.toFixed(2)}</span>
                </div>
              </div>

              {/* Costos */}
              <div>
                <h3 className="font-bold text-red-800 border-b border-red-200 pb-1 mb-2 uppercase text-sm">5. Costos de Ventas</h3>
                {getAccountGroups('5').map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700 px-4">
                    <span>{c.nombre}</span>
                    <span className="font-mono">(${c.netoDeudor.toFixed(2)})</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-red-900 px-4 bg-red-50 mt-1">
                  <span>Total Costos</span>
                  <span className="font-mono">(${costos.netoDeudor.toFixed(2)})</span>
                </div>
              </div>

              {/* Utilidad Bruta */}
              <div className="flex justify-between py-3 font-black text-slate-800 bg-slate-100 px-4 rounded-lg border border-slate-300">
                <span className="uppercase">Utilidad Bruta en Ventas</span>
                <span className="font-mono">${utilidadBruta.toFixed(2)}</span>
              </div>

              {/* Gastos */}
              <div>
                <h3 className="font-bold text-orange-800 border-b border-orange-200 pb-1 mb-2 uppercase text-sm">6. Gastos Operativos y Administrativos</h3>
                {getAccountGroups('6').map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700 px-4">
                    <span>{c.nombre}</span>
                    <span className="font-mono">(${c.netoDeudor.toFixed(2)})</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-orange-900 px-4 bg-orange-50 mt-1">
                  <span>Total Gastos</span>
                  <span className="font-mono">(${gastos.netoDeudor.toFixed(2)})</span>
                </div>
              </div>

              {/* Utilidad Neta */}
              <div className={`flex justify-between py-4 font-black text-white px-4 rounded-lg shadow-md ${utilidadNeta >= 0 ? 'bg-slate-900' : 'bg-red-700'}`}>
                <span className="uppercase tracking-widest text-lg">{utilidadNeta >= 0 ? 'Utilidad Neta del Ejercicio' : 'Pérdida Neta del Ejercicio'}</span>
                <span className="font-mono text-xl">${Math.abs(utilidadNeta).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* BALANCE GENERAL */}
        {reportType === 'general' && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">Estado de Situación Financiera (Balance General)</h2>
              <p className="text-sm text-slate-500">Al {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna Izquierda: Activos */}
              <div>
                <h3 className="font-bold text-blue-800 border-b-2 border-blue-600 pb-2 mb-4 uppercase tracking-wider">1. Activos</h3>
                <div className="space-y-4">
                  {getAccountGroups('1').map(c => (
                    <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700">
                      <span>{c.nombre}</span>
                      <span className="font-mono">${c.netoDeudor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Pasivos y Patrimonio */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-red-800 border-b-2 border-red-600 pb-2 mb-4 uppercase tracking-wider">2. Pasivos</h3>
                  <div className="space-y-2">
                    {getAccountGroups('2').map(c => (
                      <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700">
                        <span>{c.nombre}</span>
                        <span className="font-mono">${c.netoAcreedor.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-bold text-red-900 border-t border-slate-200 mt-2">
                      <span>Total Pasivos</span>
                      <span className="font-mono">${totalPasivos.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-purple-800 border-b-2 border-purple-600 pb-2 mb-4 uppercase tracking-wider">3. Patrimonio</h3>
                  <div className="space-y-2">
                    {getAccountGroups('3').map(c => (
                      <div key={c.codigo} className="flex justify-between py-1 text-sm text-slate-700">
                        <span>{c.nombre}</span>
                        <span className="font-mono">${c.netoAcreedor.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className={`flex justify-between py-1 text-sm font-bold ${utilidadNeta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      <span>{utilidadNeta >= 0 ? 'Utilidad del Ejercicio' : 'Pérdida del Ejercicio'}</span>
                      <span className="font-mono">${utilidadNeta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-purple-900 border-t border-slate-200 mt-2">
                      <span>Total Patrimonio + Utilidad</span>
                      <span className="font-mono">${patrimonioYUtilidad.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila de Cuadre */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-slate-800 pt-4">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                <span className="font-black text-blue-900 uppercase">Total Activos</span>
                <span className="font-mono text-xl font-black text-blue-900">${totalActivos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                <span className="font-black text-slate-900 uppercase">Pasivo + Patrimonio</span>
                <span className={`font-mono text-xl font-black ${Math.abs(totalActivos - (totalPasivos + patrimonioYUtilidad)) < 0.01 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${(totalPasivos + patrimonioYUtilidad).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FLUJO DE CAJA DETALLADO */}
        {reportType === 'flujo' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">Estado de Flujos de Efectivo</h2>
              <p className="text-sm text-slate-500">Resumen de cuenta Bancos (1.1.1.02) y Equivalentes</p>
            </div>

            <div className="space-y-6">
              <div className="border border-emerald-200 rounded-lg overflow-hidden">
                <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                  <h3 className="font-bold text-emerald-800">ENTRADAS DE EFECTIVO (Ingresos a Bancos)</h3>
                </div>
                <div className="p-4">
                  {ledger.filter(d => d.codigo_cuenta?.startsWith('1.1.1') && d.debe > 0).length > 0 ? (
                    ledger.filter(d => d.codigo_cuenta?.startsWith('1.1.1') && d.debe > 0).map((d, i) => (
                      <div key={i} className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-slate-800 font-medium">{d.glosa}</p>
                          <p className="text-xs text-slate-400">{d.fecha}</p>
                        </div>
                        <span className="font-mono text-emerald-600 font-bold">${d.debe.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No hay entradas registradas.</p>
                  )}
                </div>
              </div>

              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                  <h3 className="font-bold text-red-800">SALIDAS DE EFECTIVO (Egresos de Bancos)</h3>
                </div>
                <div className="p-4">
                  {ledger.filter(d => d.codigo_cuenta?.startsWith('1.1.1') && d.haber > 0).length > 0 ? (
                    ledger.filter(d => d.codigo_cuenta?.startsWith('1.1.1') && d.haber > 0).map((d, i) => (
                      <div key={i} className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-slate-800 font-medium">{d.glosa}</p>
                          <p className="text-xs text-slate-400">{d.fecha}</p>
                        </div>
                        <span className="font-mono text-red-600 font-bold">(${d.haber.toFixed(2)})</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No hay salidas registradas.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-6 flex justify-between items-center shadow-lg">
                <div>
                  <span className="font-bold uppercase tracking-wider text-sm block">SALDO NETO EN CAJA Y BANCOS</span>
                  <span className="text-xs text-slate-400">Efectivo Disponible</span>
                </div>
                <span className="font-mono text-3xl font-black text-emerald-400">
                  ${sumByPrefix('1.1.1').netoDeudor.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* COMPRAS Y GASTOS (Módulo incrustado) */}
        {reportType === 'compras_gastos' && (
          <div>
            <PurchasesAndExpenses 
              departmentContext={activeDepartment || currentUser?.department || 'Herramientas'} 
              currentUserRole={currentUserRole || ''} 
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
};
