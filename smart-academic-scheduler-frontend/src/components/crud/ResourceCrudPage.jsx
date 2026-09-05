import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import TextField from '../common/TextField';
import SelectField from '../common/SelectField';
import StatusBadge from '../common/StatusBadge';
import extractErrorMessage from '../../utils/extractErrorMessage';

function ResourceCrudPage({ title, api, columns, fields }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.list({ limit: 100 });
      setItems(response.data || []);
    } catch (loadErr) {
      setError(extractErrorMessage(loadErr));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOpenCreate() {
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    setFormData(initial);
    setEditingItem(null);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEdit(item) {
    const initial = {};
    fields.forEach((f) => {
      let val = item[f.name];
      if (val && typeof val === 'object' && val.id) {
        val = val.id;
      } else if (val && typeof val === 'object' && val._id) {
        val = val._id;
      }
      initial[f.name] = val !== undefined && val !== null ? val : '';
    });
    setFormData(initial);
    setEditingItem(item);
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.remove(id);
      await loadData();
    } catch (deleteErr) {
      setError(extractErrorMessage(deleteErr));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      const payload = { ...formData };
      fields.forEach((f) => {
        if (f.type === 'number' && payload[f.name] !== '') {
          payload[f.name] = Number(payload[f.name]);
        }
        if (f.type === 'boolean') {
          payload[f.name] = payload[f.name] === 'true' || payload[f.name] === true;
        }
      });

      if (editingItem) {
        await api.update(editingItem.id || editingItem._id, payload);
      } else {
        await api.create(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (saveErr) {
      setFormError(extractErrorMessage(saveErr));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <Button onClick={handleOpenCreate}>+ Add {title.slice(0, -1)}</Button>
      </div>

      <Alert tone="error">{error}</Alert>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-600">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                  No records found.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((item) => (
                <tr key={item.id || item._id}>
                  {columns.map((col) => {
                    let cellVal = item[col.key];
                    if (col.render) {
                      cellVal = col.render(item);
                    } else if (typeof cellVal === 'boolean') {
                      cellVal = <StatusBadge status={cellVal} />;
                    } else if (cellVal && typeof cellVal === 'object') {
                      cellVal = cellVal.name || cellVal.batchName || cellVal.email || cellVal.id;
                    }
                    return (
                      <td key={col.key} className="px-4 py-3 text-slate-700">
                        {cellVal !== undefined && cellVal !== null ? cellVal : '—'}
                      </td>
                    );
                  })}
                  <td className="space-x-3 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="font-medium text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id || item._id)}
                      className="font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={`${editingItem ? 'Edit' : 'Create'} ${title.slice(0, -1)}`}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Alert tone="error">{formError}</Alert>

          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <SelectField
                  key={field.name}
                  id={field.name}
                  label={field.label}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  options={field.options}
                />
              );
            }
            return (
              <TextField
                key={field.name}
                id={field.name}
                label={field.label}
                type={field.type || 'text'}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                placeholder={field.placeholder || ''}
              />
            );
          })}

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingItem ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ResourceCrudPage;
