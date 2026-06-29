import React from 'react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal-card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Hapus Data?</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            Apakah Anda yakin ingin menghapus data ini secara permanen dari server? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}
            onClick={onConfirm}
          >
            Ya, Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
}
