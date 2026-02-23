import { useState, useEffect } from 'react';
import { guestsAPI } from '../api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson } from 'react-icons/md';

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', id_type: 'Passport', id_number: '', nationality: '', address: '' };
const ID_TYPES = ['Passport', 'National ID', 'Driver\'s License', 'Other'];

export default function Guests() {
    const [guests, setGuests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, type: '', guest: null });
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const load = () => guestsAPI.getAll().then(r => { setGuests(r.data); setLoading(false); }).catch(() => setLoading(false));
    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (!search) { setFiltered(guests); return; }
        const q = search.toLowerCase();
        setFiltered(guests.filter(g =>
            g.first_name.toLowerCase().includes(q) ||
            g.last_name.toLowerCase().includes(q) ||
            g.email.toLowerCase().includes(q) ||
            (g.phone || '').includes(q)
        ));
    }, [guests, search]);

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, type: 'add' }); };
    const openEdit = (g) => { setForm(g); setModal({ open: true, type: 'edit', guest: g }); };
    const openDelete = (g) => setModal({ open: true, type: 'delete', guest: g });

    const handleSave = async () => {
        if (!form.first_name || !form.last_name || !form.email) return toast.error('Name and email are required');
        try {
            if (modal.type === 'add') { await guestsAPI.create(form); toast.success('Guest added!'); }
            else { await guestsAPI.update(modal.guest.id, form); toast.success('Guest updated!'); }
            setModal({ open: false }); load();
        } catch (err) { toast.error(err.response?.data?.error || 'Error saving guest'); }
    };

    const handleDelete = async () => {
        try {
            await guestsAPI.delete(modal.guest.id);
            toast.success('Guest deleted!'); setModal({ open: false }); load();
        } catch (err) { toast.error(err.response?.data?.error || 'Error deleting guest'); }
    };

    const f = (k) => e => setForm({ ...form, [k]: e.target.value });

    return (
        <div>
            <div className="page-header">
                <div><h2>Guests</h2><p>{guests.length} registered guests</p></div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Guest</button>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input className="form-input" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-section">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>ID Type</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No guests found</td></tr>
                            ) : filtered.map((g, i) => (
                                <tr key={g.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                                                {g.first_name[0]}{g.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.first_name} {g.last_name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.address || 'No address'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><a href={`mailto:${g.email}`} style={{ color: 'var(--blue-light)', textDecoration: 'none' }}>{g.email}</a></td>
                                    <td>{g.phone || '—'}</td>
                                    <td>{g.nationality || '—'}</td>
                                    <td>{g.id_type || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(g)}><MdEdit size={16} /></button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(g)}><MdDelete size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open && modal.type !== 'delete'} onClose={() => setModal({ open: false })} title={modal.type === 'add' ? 'Add New Guest' : 'Edit Guest'}>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">First Name *</label>
                            <input className="form-input" value={form.first_name} onChange={f('first_name')} placeholder="First name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input className="form-input" value={form.last_name} onChange={f('last_name')} placeholder="Last name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input className="form-input" type="email" value={form.email} onChange={f('email')} placeholder="email@example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" value={form.phone} onChange={f('phone')} placeholder="+1-555-0100" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nationality</label>
                            <input className="form-input" value={form.nationality} onChange={f('nationality')} placeholder="Country" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ID Type</label>
                            <select className="form-select" value={form.id_type} onChange={f('id_type')}>
                                {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">ID Number</label>
                            <input className="form-input" value={form.id_number} onChange={f('id_number')} placeholder="Document number" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea className="form-textarea" value={form.address} onChange={f('address')} placeholder="Full address..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>{modal.type === 'add' ? '➕ Add Guest' : '💾 Save Changes'}</button>
                </div>
            </Modal>

            <Modal isOpen={modal.open && modal.type === 'delete'} onClose={() => setModal({ open: false })} title="Delete Guest">
                <div className="modal-body">
                    <div className="confirm-dialog">
                        <p>Are you sure you want to delete</p>
                        <p><strong>{modal.guest?.first_name} {modal.guest?.last_name}</strong>?</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                </div>
            </Modal>
        </div>
    );
}
