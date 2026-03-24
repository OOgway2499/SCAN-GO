import React, { useEffect, useState } from 'react';
import { useUiStore } from '../stores/uiStore';
import { format } from 'date-fns';
import { Shield, UserPlus, Trash2, KeyRound } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const { pushToast } = useUiStore();

  const load = () => {
    fetch('/api/admin/staff?storeId=store_freshmart_hyd', {
      headers: { Authorization: `Bearer ${localStorage.getItem('scango_admin_token')}` }
    })
      .then(res => res.json())
      .then(setStaff)
      .catch(() => pushToast('Failed to load staff', 'err'));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      storeId: 'store_freshmart_hyd',
      name: fd.get('name'),
      role: fd.get('role'),
      pin: fd.get('pin'),
      email: fd.get('email'),
    };

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      
      pushToast('Staff added successfully', 'ok');
      setModalOpen(false);
      load();
    } catch (err: any) {
      pushToast(err.message, 'err');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      pushToast('Deactivated', 'ok');
      load();
    } catch {
      pushToast('Error deactivating', 'err');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-t1 tracking-tight">Staff & Guards</h1>
          <p className="text-t3 text-[14px] mt-1">Manage admin access and security guard PINs</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="btn-primary px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 transition-all"
        >
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-[24px] overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-elevated/50">
            <tr>
              <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Name / Details</th>
              <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Role</th>
              <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Status</th>
              <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle">Added On</th>
              <th className="font-bold text-t2 px-6 py-4 uppercase tracking-wider text-[11px] border-b border-border-subtle text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-border-subtle/50 hover:bg-elevated/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-t1 font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-t1">{s.name}</div>
                      <div className="text-t3 text-[12px]">{s.email || 'No email'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-t1">
                  {s.role === 'admin' ? (
                    <span className="bg-primary/10 text-primary-light border border-primary/20 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 w-max">
                      <Shield size={12} /> Administrator
                    </span>
                  ) : (
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 w-max">
                      <KeyRound size={12} /> Guard
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-left">
                  {s.isActive ? 
                    <span className="text-success text-[12px] font-bold">Active</span> : 
                    <span className="text-danger text-[12px] font-bold">Inactive</span>
                  }
                </td>
                <td className="px-6 py-4 text-t2 text-[13px]">{format(new Date(s.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(s.id, s.name)} disabled={!s.isActive} className="text-t2 hover:text-danger p-2 transition-colors disabled:opacity-30"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="text-center py-10 text-t3">No staff records found</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[500px] rounded-2xl p-6 relative border-border-hi shadow-2xl">
            <h2 className="text-[20px] font-extrabold mb-6 text-t1">Add New Staff Member</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Full Name</label>
                <input required name="name" className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Role</label>
                <select name="role" className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary appearance-none">
                  <option value="guard">Guard (Console Access)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">4-Digit PIN</label>
                <input required name="pin" type="text" maxLength={4} pattern="\d{4}" placeholder="e.g. 1234" className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[18px] text-t1 outline-none focus:border-primary tracking-[0.5em] font-mono" />
              </div>
              <div>
                <label className="block text-t3 text-[12px] font-bold mb-1.5 uppercase tracking-wide">Email (Optional)</label>
                <input type="email" name="email" className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-[14px] text-t1 outline-none focus:border-primary" />
              </div>
              
              <div className="flex gap-3 mt-4 pt-6 border-t border-border-subtle">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-surface hover:bg-elevated border border-border-subtle rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 btn-primary rounded-xl font-bold">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
