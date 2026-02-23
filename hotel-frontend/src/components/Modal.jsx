import { MdClose } from 'react-icons/md';

export default function Modal({ isOpen, onClose, title, children, size = '' }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>
                        <MdClose size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
