import React, { useState } from 'react';
import { Product, Provider } from '../types';
import { Save, AlertCircle, X, Package, DollarSign, Image as ImageIcon, Truck } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  existingSkus: string[];
  existingCategories: string[];
  departmentContext: string;
  currentUserRole?: string;
  providers?: Provider[];
}

export default function ProductForm({ product, onSave, onCancel, existingSkus, existingCategories = [], departmentContext, currentUserRole = '', providers = [] }: ProductFormProps) {
  // Sección A: Información Básica
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [categoryBase, setCategoryBase] = useState(product?.department || departmentContext || 'Herramientas');
  const [newCategory, setNewCategory] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [imageUrls, setImageUrls] = useState<string>(product?.imageUrl || '');
  const [description, setDescription] = useState(product?.description || '');
  const [providerId, setProviderId] = useState(product?.providerId || '');

  // Sección B: Precios y Costos
  const [cost, setCost] = useState<string>(product?.costPrice?.toString() || '');
  const [unitPrice, setUnitPrice] = useState<string>(product?.unitPrice?.toString() || '');
  const [discount, setDiscount] = useState<string>(product?.discount?.toString() || '');

  // Sección C: Inventario
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState<string>(product?.stock?.toString() || '');
  const [stockMinimo, setStockMinimo] = useState<string>(product?.lowStockThreshold?.toString() || '5');
  const [skuError, setSkuError] = useState('');

  // Sección D: Logística
  const dims = product?.dimensions ? product.dimensions.split('x') : [];
  const [weight, setWeight] = useState<string>(product?.weight?.toString() || '');
  const [width, setWidth] = useState<string>(dims[0] || '');
  const [height, setHeight] = useState<string>(dims[1] || '');
  const [depth, setDepth] = useState<string>(dims[2] || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkuError('');

    if (!name || !sku || !unitPrice) {
      alert('Por favor complete los campos requeridos (Nombre, SKU, Precio de Venta).');
      return;
    }

    // Validación de SKU único
    if (existingSkus.includes(sku.toLowerCase()) && product?.sku.toLowerCase() !== sku.toLowerCase()) {
      setSkuError('Error de validación: El SKU ya está cogido por otro producto.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name,
        category: category.trim(),
        description,
        sku,
        costPrice: parseFloat(cost) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        discount: parseFloat(discount) || 0,
        stock: parseInt(stock, 10) || 0,
        lowStockThreshold: parseInt(stockMinimo, 10) || 0,
        weight: parseFloat(weight) || 0,
        dimensions: `${width}x${height}x${depth}`,
        imageUrl: imageUrls.split(',')[0]?.trim() || '',
        department: categoryBase || departmentContext,
        providerId: providerId || undefined
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedStock = parseInt(stock, 10) || 0;
  const isLowStock = parsedStock <= 5;
  const hideCost = currentUserRole.includes('Vendedor');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección A: Información Básica */}
            <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Producto *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoría *</label>
                  <input 
                    type="text" 
                    required 
                    list="category-options"
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    placeholder="Escriba o seleccione una categoría..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                  />
                  <datalist id="category-options">
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">URLs de Imagen principal</label>
                  <input type="text" value={imageUrls} onChange={e => setImageUrls(e.target.value)} placeholder="https://ejemplo.com/img1.jpg" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Proveedor Asociado</label>
                  <select value={providerId} onChange={e => setProviderId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                    <option value="">Ninguno / Proveedor Interno</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre_empresa} (RUC: {p.ruc})</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Sección B: Precios y Costos */}
            <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Precios y Costos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!hideCost && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Costo ($)</label>
                    <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Precio de Venta ($) *</label>
                  <input type="number" step="0.01" required value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Rebaja/Descuento ($)</label>
                  <input type="number" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Sección C: Control de Inventario Estricto */}
            <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Package className="w-4 h-4 text-orange-400" />
                Inventario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Código / SKU *</label>
                  <input type="text" required value={sku} onChange={e => setSku(e.target.value)} placeholder="Ej: t001" className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white outline-none ${skuError ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-orange-500'}`} />
                  {skuError && <p className="text-red-400 text-xs mt-1">{skuError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Stock (Existencias Globales)</label>
                  <div className="relative">
                    <input type="number" readOnly={!!product} value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 focus:border-orange-500 outline-none" />
                    {product && <p className="text-[10px] text-slate-500 mt-1">El stock se calcula sumando lotes en edición.</p>}
                    {isLowStock && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Stock Bajo
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Umbral de Alerta (Stock Mínimo)</label>
                  <input type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Sección D: Envío y Logística */}
            <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-purple-400" />
                Envío y Logística
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Peso (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ancho (cm)</label>
                  <input type="number" step="0.1" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Alto (cm)</label>
                  <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Prof. (cm)</label>
                  <input type="number" step="0.1" value={depth} onChange={e => setDepth(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" form="product-form" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}
