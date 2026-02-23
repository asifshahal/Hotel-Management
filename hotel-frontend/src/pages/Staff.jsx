import { useState, useEffect } from 'react';
import { staffAPI } from '../api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const ROLES = ['Manager', 'Receptionist', 'Housekeeper', 'Chef', 'Waiter', 'Security', 'Maintenance', 'Accountant'];
const DEPARTMENTS = ['Front Desk', 'Housekeeping', 'Kitchen', 'Security', 'Maintenance', 'Finance', 'Management'];

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', role: 'Receptionist', department: 'Front Desk', salary: '', status: 'Active', join_date: new Date().toISOString().split('T')[0] };

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [modal, setModal] = useState({ open: false, type: '', member: null });
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const load = () => staffAPI.getAll().then(r => { setStaff(r.data); setLoading(false); }).catch(() => setLoading(false));
    useEffect(() => { load(); }, []);

    useEffect(() => {
        let r = staff;
        if (deptFilter !== 'All') r = r.filter(s => s.department === deptFilter);
        if (search) {
            const q = search.toLowerCase();
            r = r.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
        }
        setFiltered(r);
    }, [staff, search, deptFilter]);

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, type: 'add' }); };
    const openEdit = (m) => { setForm(m); setModal({ open: true, type: 'edit', member: m }); };
    const openDelete = (m) => setModal({ open: true, type: 'delete', member: m });

    const handleSave = async () => {
        if (!form.first_name || !form.last_name || !form.email || !form.role || !form.department) return toast.error('Required fields missing');
        try {
            if (modal.type === 'add') { await staffAPI.create(form); toast.success('Staff member added!'); }
            else { await staffAPI.update(modal.member.id, form); toast.success('Staff updated!'); }
            setModal({ open: false }); load();
        } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    };

    const handleDelete = async () => {
        try {
            await staffAPI.delete(modal.member.id); toast.success('Staff member removed!'); setModal({ open: false }); load();
        } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    };

    const f = (k) => e => setForm({ ...form, [k]: e.target.value });

    const deptColors = { 'Front Desk': 'blue', 'Housekeeping': 'green', 'Kitchen': 'yellow', 'Security': 'red', 'Maintenance': 'purple', 'Finance': 'gray', 'Management': 'yellow' };

    return (
        <div>
            <div className="page-header">
                <div><h2>Staff Management</h2><p>{staff.length} employees</p></div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Staff</button>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input className="form-input" placeholder="Search by name, role, email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 'auto', minWidth: 160 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                    <option>All</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>

            <div className="table-section">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Phone</th><th>Salary</th><th>Join Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No staff found</td></tr>
                            ) : filtered.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                {m.first_name[0]}{m.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.first_name} {m.last_name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{m.role}</td>
                                    <td><span className={`badge badge-${deptColors[m.department] || 'gray'}`}>{m.department}</span></td>
                                    <td>{m.phone || '—'}</td>
                                    <td className="revenue-amount">${m.salary?.toLocaleString()}/yr</td>
                                    <td>{m.join_date}</td>
                                    <td><Badge status={m.status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(m)}><MdEdit size={16} /></button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(m)}><MdDelete size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open && modal.type !== 'delete'} onClose={() => setModal({ open: false })} title={modal.type === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.first_name} onChange={f('first_name')} /></div>
                        <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.last_name} onChange={f('last_name')} /></div>
                        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={f('email')} /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={f('phone')} /></div>
                        <div className="form-group">
                            <label className="form-label">Role *</label>
                            <select className="form-select" value={form.role} onChange={f('role')}>
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <select className="form-select" value={form.department} onChange={f('department')}>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Annual Salary ($)</label><input className="form-input" type="number" value={form.salary} onChange={f('salary')} /></div>
                        <div className="form-group"><label className="form-label">Join Date</label><input className="form-input" type="date" value={form.join_date} onChange={f('join_date')} /></div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={form.status} onChange={f('status')}>
                                <option>Active</option><option>Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>{modal.type === 'add' ? '➕ Add Staff' : '💾 Save Changes'}</button>
                </div>
            </Modal>

            <Modal isOpen={modal.open && modal.type === 'delete'} onClose={() => setModal({ open: false })} title="Remove Staff Member">
                <div className="modal-body">
                    <div className="confirm-dialog">
                        <p>Are you sure you want to remove</p>
                        <p><strong>{modal.member?.first_name} {modal.member?.last_name}</strong>?</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete}>🗑️ Remove</button>
                </div>
            </Modal>
        </div>
    );
}
