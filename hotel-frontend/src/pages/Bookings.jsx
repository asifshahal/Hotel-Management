import { useState, useEffect } from 'react';
import { bookingsAPI, roomsAPI, guestsAPI } from '../api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCheckCircle } from 'react-icons/md';

const STATUSES = ['Confirmed', 'Checked Out', 'Cancelled'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded'];

const emptyForm = { guest_id: '', room_id: '', check_in: '', check_out: '', adults: 1, children: 0, total_amount: '', status: 'Confirmed', payment_status: 'Pending', special_requests: '' };

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modal, setModal] = useState({ open: false, type: '', booking: null });
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const loadAll = async () => {
        try {
            const [b, r, g] = await Promise.all([bookingsAPI.getAll(), roomsAPI.getAll(), guestsAPI.getAll()]);
            setBookings(b.data); setRooms(r.data); setGuests(g.data); setLoading(false);
        } catch { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    useEffect(() => {
        let r = bookings;
        if (statusFilter !== 'All') r = r.filter(b => b.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            r = r.filter(b => b.guest_name?.toLowerCase().includes(q) || b.room_number?.includes(q));
        }
        setFiltered(r);
    }, [bookings, search, statusFilter]);

    // Auto-calculate total when fields change
    useEffect(() => {
        if (form.room_id && form.check_in && form.check_out) {
            const room = rooms.find(r => r.id === +form.room_id);
            if (room) {
                const nights = Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000));
                setForm(f => ({ ...f, total_amount: (room.price_per_night * nights).toFixed(2) }));
            }
        }
    }, [form.room_id, form.check_in, form.check_out, rooms]);

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, type: 'add' }); };
    const openEdit = (b) => { setForm({ ...b, guest_id: b.guest_id, room_id: b.room_id }); setModal({ open: true, type: 'edit', booking: b }); };
    const openDelete = (b) => setModal({ open: true, type: 'delete', booking: b });

    const handleSave = async () => {
        if (!form.guest_id || !form.room_id || !form.check_in || !form.check_out) return toast.error('Guest, room, and dates are required');
        try {
            if (modal.type === 'add') { await bookingsAPI.create(form); toast.success('Booking created!'); }
            else { await bookingsAPI.update(modal.booking.id, form); toast.success('Booking updated!'); }
            setModal({ open: false }); loadAll();
        } catch (err) { toast.error(err.response?.data?.error || 'Error saving booking'); }
    };

    const handleDelete = async () => {
        try {
            await bookingsAPI.delete(modal.booking.id); toast.success('Booking deleted!'); setModal({ open: false }); loadAll();
        } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    };

    const handleCheckout = async (b) => {
        try {
            await bookingsAPI.update(b.id, { ...b, status: 'Checked Out' });
            toast.success('Guest checked out!'); loadAll();
        } catch { toast.error('Error checking out'); }
    };

    const f = (k) => e => setForm({ ...form, [k]: e.target.value });

    return (
        <div>
            <div className="page-header">
                <div><h2>Bookings</h2><p>{bookings.length} total bookings</p></div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> New Booking</button>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input className="form-input" placeholder="Search by guest or room..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['All', ...STATUSES].map(s => (
                    <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStatusFilter(s)}>{s}</button>
                ))}
            </div>

            <div className="table-section">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bookings found</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{b.id}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.guest_name}</td>
                                    <td>{b.room_number} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({b.room_type})</span></td>
                                    <td>{b.check_in}</td>
                                    <td>{b.check_out}</td>
                                    <td className="revenue-amount">${b.total_amount?.toLocaleString()}</td>
                                    <td><Badge status={b.status} /></td>
                                    <td><Badge status={b.payment_status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {b.status === 'Confirmed' && (
                                                <button className="btn btn-success btn-sm btn-icon" title="Check Out" onClick={() => handleCheckout(b)}><MdCheckCircle size={16} /></button>
                                            )}
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(b)}><MdEdit size={16} /></button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(b)}><MdDelete size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open && modal.type !== 'delete'} onClose={() => setModal({ open: false })} title={modal.type === 'add' ? 'New Booking' : 'Edit Booking'} size="lg">
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Guest *</label>
                            <select className="form-select" value={form.guest_id} onChange={f('guest_id')}>
                                <option value="">Select guest...</option>
                                {guests.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Room *</label>
                            <select className="form-select" value={form.room_id} onChange={f('room_id')}>
                                <option value="">Select room...</option>
                                {rooms.filter(r => r.status === 'Available' || r.id === +form.room_id).map(r => (
                                    <option key={r.id} value={r.id}>#{r.room_number} — {r.type} — ${r.price_per_night}/night</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Check In *</label>
                            <input className="form-input" type="date" value={form.check_in} onChange={f('check_in')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Check Out *</label>
                            <input className="form-input" type="date" value={form.check_out} min={form.check_in} onChange={f('check_out')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Adults</label>
                            <input className="form-input" type="number" value={form.adults} onChange={f('adults')} min={1} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Children</label>
                            <input className="form-input" type="number" value={form.children} onChange={f('children')} min={0} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Total Amount ($)</label>
                            <input className="form-input" type="number" value={form.total_amount} onChange={f('total_amount')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Status</label>
                            <select className="form-select" value={form.payment_status} onChange={f('payment_status')}>
                                {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        {modal.type === 'edit' && (
                            <div className="form-group">
                                <label className="form-label">Booking Status</label>
                                <select className="form-select" value={form.status} onChange={f('status')}>
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Special Requests</label>
                        <textarea className="form-textarea" value={form.special_requests} onChange={f('special_requests')} placeholder="Any special requests..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>{modal.type === 'add' ? '📅 Create Booking' : '💾 Save Changes'}</button>
                </div>
            </Modal>

            <Modal isOpen={modal.open && modal.type === 'delete'} onClose={() => setModal({ open: false })} title="Cancel Booking">
                <div className="modal-body">
                    <div className="confirm-dialog">
                        <p>Are you sure you want to delete booking</p>
                        <p><strong>#{modal.booking?.id} — {modal.booking?.guest_name}</strong>?</p>
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
