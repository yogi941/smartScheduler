import { useState } from 'react';
import api from '../../api/client';

function ImportExportModal({ isOpen, onClose, onSuccess }) {
  const [entityType, setEntityType] = useState('TEACHERS');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to import');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('entityType', entityType);
      formData.append('file', file);

      const res = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Import successful!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setMessage('');
        setFile(null);
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to import data');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Excel / CSV Batch Data Import</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleImportSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Data Category
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-brand-500 focus:outline-hidden"
            >
              <option value="TEACHERS">Faculty / Teachers</option>
              <option value="ROOMS">Classrooms</option>
              <option value="LABS">Laboratories</option>
              <option value="SUBJECTS">Academic Subjects</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Upload File (.csv or .xlsx)
            </label>
            <input
              type="file"
              accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          {message && (
            <p className={`text-xs font-medium ${message.includes('successful') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {message}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {uploading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportExportModal;
