import React, { useState, useEffect, useMemo } from 'react';
import { Package, BarChart3, TrendingUp, Download } from 'lucide-react';
import { Product, Invoice } from '../types';

interface Quotation {
  id: string;
  items: any[];
}

interface Props {
  products: Product[];
  invoices: Invoice[];
}

export const GlobalProductStatistics: React.FC<Props> = ({ products, invoices }) => {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cotizaciones');
      const data = await res.json();
      if (res.ok) {
        setQuotes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(() => {
    const statsMap = new Map<string, {
      product: Product,
      soldUnits: number,
      soldRevenue: number,
      quotedUnits: number,
      quotedRevenue: number,
      totalUnits: number,
      totalRevenue: number
    }>();

    // Initialize map with all products
    products.forEach(p => {
      statsMap.set(p.name, {
        product: p,
        soldUnits: 0,
        soldRevenue: 0,
        quotedUnits: 0,
        quotedRevenue: 0,
        totalUnits: 0,
        totalRevenue: 0
      });
    });

    // Process invoices
    invoices.forEach(inv => {
      inv.items.forEach((item: any) => {
        let stat = statsMap.get(item.description);
        // If product was deleted or renamed, we might not find it, so we can ignore or add it dynamically
        if (!stat) {
          stat = {
            product: { name: item.description, sku: 'N/A', department: 'Eliminado/Otro' } as Product,
            soldUnits: 0, soldRevenue: 0, quotedUnits: 0, quotedRevenue: 0, totalUnits: 0, totalRevenue: 0
          };
          statsMap.set(item.description, stat);
        }
        stat.soldUnits += item.quantity;
        stat.soldRevenue += (item.quantity * item.unitPrice);
        stat.totalUnits += item.quantity;
        stat.totalRevenue += (item.quantity * item.unitPrice);
      });
    });

    // Process quotes
    quotes.forEach(q => {
      let items = q.items || [];
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch(e) {}
      }
      items.forEach((item: any) => {
        let stat = statsMap.get(item.description);
        if (!stat) {
          stat = {
            product: { name: item.description, sku: 'N/A', department: 'Eliminado/Otro' } as Product,
            soldUnits: 0, soldRevenue: 0, quotedUnits: 0, quotedRevenue: 0, totalUnits: 0, totalRevenue: 0
          };
          statsMap.set(item.description, stat);
        }
        stat.quotedUnits += item.quantity;
        stat.quotedRevenue += (item.quantity * item.unitPrice);
        stat.totalUnits += item.quantity;
        stat.totalRevenue += (item.quantity * item.unitPrice);
      });
    });

    const sorted = Array.from(statsMap.values()).sort((a, b) => b.totalUnits - a.totalUnits);
    return sorted;
  }, [products, invoices, quotes]);

  const downloadCSV = () => {
    const headers = ['Producto', 'SKU', 'Departamento', 'Facturado (Uds)', 'Cotizado (Uds)', 'Total Uds', 'Ingresos Generados'];
    const rows = statistics.map(stat => [
      `"${stat.product.name.replace(/"/g, '""')}"`,
      `"${stat.product.sku}"`,
      `"${stat.product.department}"`,
      stat.soldUnits,
      stat.quotedUnits,
      stat.totalUnits,
      stat.totalRevenue.toFixed(2)
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estadisticas_productos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden animate-slide-up">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Rendimiento de Productos (Global)</h3>
            <p className="text-sm text-slate-500">Estadísticas consolidadas de ventas y cotizaciones de todos los departamentos.</p>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          disabled={statistics.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Descargar CSV
        </button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Cargando estadísticas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Departamento</th>
                <th className="p-4 text-right">Facturado (Uds)</th>
                <th className="p-4 text-right">Cotizado (Uds)</th>
                <th className="p-4 text-right font-bold text-indigo-700">Total Uds</th>
                <th className="p-4 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {statistics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No hay datos suficientes para mostrar estadísticas.</td>
                </tr>
              ) : (
                statistics.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{stat.product.name}</div>
                      <div className="text-xs text-slate-400 font-mono">SKU: {stat.product.sku}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                        {stat.product.department}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-600">{stat.soldUnits}</td>
                    <td className="p-4 text-right font-medium text-amber-600">{stat.quotedUnits}</td>
                    <td className="p-4 text-right font-bold text-indigo-700">{stat.totalUnits}</td>
                    <td className="p-4 text-right font-bold text-slate-800">${stat.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
