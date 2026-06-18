import React, { useState, useEffect } from 'react';
import { FileText, FilePlus } from 'lucide-react';

interface Quotation {
  id: string;
  client_id: string;
  client_name: string;
  department: string;
  total: number;
  created_at: string;
  items: any[];
}

interface Props {
  department: string | null;
  onConvert?: (quotation: Quotation) => void;
  onDownloadPDF?: (quotation: Quotation) => void;
}

export const QuotationsHistory: React.FC<Props> = ({ department, onConvert, onDownloadPDF }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, [department]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const url = department ? `/api/cotizaciones?department=${encodeURIComponent(department)}` : '/api/cotizaciones';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch quotations');
      }
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-24 animate-slide-up">
      <div>
        <h2 className="font-display text-3xl font-semibold text-slate-900">Historial de Cotizaciones</h2>
        <p className="text-slate-500 mt-1">Registro de cotizaciones emitidas {department ? `en ${department}` : 'en todos los departamentos'}.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando historial...</div>
        ) : quotations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No hay cotizaciones registradas en esta área.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">ID Cotización</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  {!department && <th className="p-4">Departamento</th>}
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-slate-600">{q.id}</td>
                    <td className="p-4 text-sm text-slate-700">{new Date(q.created_at).toLocaleString()}</td>
                    <td className="p-4 text-sm font-semibold text-slate-800">{q.client_name}</td>
                    {!department && <td className="p-4 text-sm text-slate-600">{q.department}</td>}
                    <td className="p-4 text-sm font-bold text-emerald-600">${q.total.toFixed(2)}</td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => onDownloadPDF && onDownloadPDF(q)}
                        className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors" 
                        title="Descargar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {onConvert && (
                        <button 
                          onClick={() => onConvert(q)}
                          className="text-emerald-600 hover:text-emerald-800 p-2 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1 font-semibold text-xs" 
                          title="Convertir a Factura"
                        >
                          <FilePlus className="w-4 h-4" />
                          Convertir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
