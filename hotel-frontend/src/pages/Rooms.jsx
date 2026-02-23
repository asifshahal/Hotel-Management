import { useState, useEffect } from 'react';
import { roomsAPI } from '../api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdGridView, MdViewList, MdSearch, MdBed, MdPeople } from 'react-icons/md';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
const STATUSES = ['Available', 'Occupied', 'Maintenance'];

const emptyForm = { room_number: '', type: 'Standard', floor: 1, capacity: 2, price_per_night: '', status: 'Available', amenities: '', description: '' };

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [view, setView] = useState('grid');
    const [modal, setModal] = useState({ open: false, type: '', room: null });
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const load = () => roomsAPI.getAll().then(r => { setRooms(r.data); setLoading(false); }).catch(() => setLoading(false));
    useEffect(() => { load(); }, []);

    useEffect(() => {
        let r = rooms;
        if (statusFilter !== 'All') r = r.filter(x => x.status === statusFilter);
        if (search) r = r.filter(x => x.room_number.includes(search) || x.type.toLowerCase().includes(search.toLowerCase()));
        setFiltered(r);
    }, [rooms, search, statusFilter]);

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, type: 'add' }); };
    const openEdit = (room) => { setForm(room); setModal({ open: true, type: 'edit', room }); };
    const openDelete = (room) => setModal({ open: true, type: 'delete', room });

    const handleSave = async () => {
        try {
            if (modal.type === 'add') {
                await roomsAPI.create(form);
                toast.success('Room added!');
            } else {
                await roomsAPI.update(modal.room.id, form);
                toast.success('Room updated!');
            }
            setModal({ open: false });
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving room');
        }
    };

    const handleDelete = async () => {
        try {
            await roomsAPI.delete(modal.room.id);
            toast.success('Room deleted!');
            setModal({ open: false });
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error deleting room');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Room Management</h2>
                    <p>{rooms.length} rooms total</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Room</button>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input className="form-input" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['All', ...STATUSES].map(s => (
                    <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStatusFilter(s)}>{s}</button>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                    <div className="view-toggle">
                        <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><MdGridView /></button>
                        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><MdViewList /></button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner" /> Loading rooms...</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">🏨</div><p>No rooms found</p></div>
            ) : view === 'grid' ? (
                <div className="rooms-grid">
                    {filtered.map(room => (
                        <div key={room.id} className="room-card">
                            <div className="room-card-header">
                                <div>
                                    <div className="room-number">#{room.room_number}</div>
                                    <div className="room-type">{room.type} · Floor {room.floor}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="room-price">${room.price_per_night}<span>/night</span></div>
                                    <Badge status={room.status} />
                                </div>
                            </div>
                            <div className="room-details">
                                <span><MdPeople size={14} /> {room.capacity} guests</span>
                                <span><MdBed size={14} /> Floor {room.floor}</span>
                            </div>
                            {room.amenities && <div className="room-amenities">{room.amenities}</div>}
                            <div className="room-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(room)}><MdEdit size={14} /> Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => openDelete(room)}><MdDelete size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="table-section">
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Capacity</th><th>Price/Night</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(room => (
                                    <tr key={room.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>#{room.room_number}</td>
                                        <td><Badge status={room.type} /></td>
                                        <td>Floor {room.floor}</td>
                                        <td>{room.capacity} guests</td>
                                        <td className="revenue-amount">${room.price_per_night}</td>
                                        <td><Badge status={room.status} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(room)}><MdEdit size={16} /></button>
                                                <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(room)}><MdDelete size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={modal.open && modal.type !== 'delete'} onClose={() => setModal({ open: false })} title={modal.type === 'add' ? 'Add New Room' : 'Edit Room'}>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Room Number *</label>
                            <input className="form-input" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} placeholder="e.g. 101" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type *</label>
                            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Floor</label>
                            <input className="form-input" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: +e.target.value })} min={1} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Capacity</label>
                            <input className="form-input" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} min={1} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price Per Night ($) *</label>
                            <input className="form-input" type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: +e.target.value })} min={0} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Amenities (comma-separated)</label>
                        <input className="form-input" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, TV, AC, Mini Bar" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Room description..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {modal.type === 'add' ? '➕ Add Room' : '💾 Save Changes'}
                    </button>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={modal.open && modal.type === 'delete'} onClose={() => setModal({ open: false })} title="Delete Room">
                <div className="modal-body">
                    <div className="confirm-dialog">
                        <p>Are you sure you want to delete</p>
                        <p><strong>Room #{modal.room?.room_number} ({modal.room?.type})</strong>?</p>
                        <p style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>This action cannot be undone.</p>
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
