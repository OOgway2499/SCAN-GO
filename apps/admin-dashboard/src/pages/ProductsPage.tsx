import React, { useEffect, useState } from 'react';
import { useUiStore } from '../stores/uiStore';
import { formatINR, categories } from '@scango/ui';
import { Plus, Search, Upload, Pencil, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { pushToast } = useUiStore();

  const load = () => {
    fetch('/api/admin/products?storeId=store_freshmart_hyd')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => pushToast('Failed to load products', 'err'));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      storeId: 'store_freshmart_hyd',
      barcode: fd.get('barcode'),
      name: fd.get('name'),
      brand: fd.get('brand'),
      category: fd.get('category'),
      price: Number(fd.get('price')),
      mrp: Number(fd.get('mrp')),
      gstRate: Number(fd.get('gstRate')),
      icon: fd.get('icon'),
      inStock: fd.get('inStock') === 'on',
    };

    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      
      pushToast(editing ? 'Product updated' : 'Product created', 'ok');
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err: any) {
      pushToast(err.message, 'err');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      pushToast('Deleted', 'ok');
      load();
    } catch {
      pushToast('Error deleting', 'err');
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.barcode.includes(q) || 
    p.brand.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-t1 tracking-tight">Products</h1>
          <p className="text-t3 text-[14px] mt-1">Manage store inventory and pricing</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => pushToast("CSV import coming soon", "warn")} className="bg-surface hover:bg-elevated border border-border-subtle text-t1 px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 transition-all">
            <Upload size={16} /> Import CSV
          </button>
          <button 
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="btn-primary px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-[24px] overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-elevated/30">
          <div className="flex-1 max-w-[400px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 w-4 h-4" />
            <input 
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name, brand, or barcode..."
              className="w-full bg-bg border border-border-hi rounded-lg pl-10 pr-4 py-2 text-[14px] text-t1 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="text-t3 text-[13px] font-medium">
            Showing {filtered.length} of {products.length} items
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-elevated sticky top-0 z-10 box-border">
              <tr>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Product</th>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Category</th>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Barcode</th>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle text-right">Price</th>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle text-right">Stock</th>
                <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border-subtle/50 hover:bg-elevated/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-[20px]">{p.icon}</div>
                      <div>
                        <div className="font-bold text-t1">{p.name}</div>
                        <div className="text-t3 text-[12px]">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-t2"><span className="bg-primary/10 text-primary-light border border-primary/20 px-2.5 py-1 rounded-md text-[11px] font-bold">{p.category}</span></td>
                  <td className="px-6 py-4 text-t3 font-mono text-[12px]">{p.barcode}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-extrabold text-[#fff]">{formatINR(p.price)}</div>
                    {p.mrp > p.price && <div className="text-t3 text-[11px] line-through">{formatINR(p.mrp)}</div>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.inStock ? 
                      <span className="text-success text-[12px] font-bold">In Stock</span> : 
                      <span className="text-danger text-[12px] font-bold">Out of Stock</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(p); setModalOpen(true); }} className="text-t2 hover:text-primary p-2 transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="text-t2 hover:text-danger p-2 transition-colors ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-t3">No products found</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[600px] rounded-2xl p-6 relative border-border-hi">
            <h2 className="text-[20px] font-extrabold mb-6 text-t1">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Product Name</label>
                <input required name="name" defaultValue={editing?.name} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Brand</label>
                <input required name="brand" defaultValue={editing?.brand} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Category</label>
                <select name="category" defaultValue={editing?.category || categories[1]} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary appearance-none custom-select">
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Barcode (EAN-13)</label>
                <input required name="barcode" defaultValue={editing?.barcode} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary font-mono" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Emoji Icon</label>
                <input required name="icon" defaultValue={editing?.icon || '📦'} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[18px] text-t1 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Selling Price (₹)</label>
                <input required type="number" step="0.01" name="price" defaultValue={editing?.price} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary font-mono" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">MRP (₹)</label>
                <input required type="number" step="0.01" name="mrp" defaultValue={editing?.mrp} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary font-mono" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">GST Rate (%)</label>
                <select name="gstRate" defaultValue={editing?.gstRate || 0} className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary appearance-none">
                  <option value="0">0%</option>
                  <option value="0.05">5%</option>
                  <option value="0.12">12%</option>
                  <option value="0.18">18%</option>
                  <option value="0.28">28%</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="inStock" name="inStock" defaultChecked={editing ? editing.inStock : true} className="w-5 h-5 accent-primary cursor-pointer" />
                <label htmlFor="inStock" className="text-t1 font-bold text-[14px] cursor-pointer">Available in Stock</label>
              </div>
              
              <div className="col-span-2 flex gap-3 mt-6 pt-6 border-t border-border-subtle">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-surface hover:bg-elevated border border-border-subtle rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 btn-primary rounded-xl font-bold">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
