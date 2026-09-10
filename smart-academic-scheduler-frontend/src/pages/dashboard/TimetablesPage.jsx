import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import TextField from '../../components/common/TextField';
import StatusBadge from '../../components/common/StatusBadge';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import { studentBatchesApi } from '../../api/resources';
import {
  listTimetables,
  getTimetableById,
  generateTimetables,
  publishTimetable,
  archiveTimetable,
  downloadTimetableExport,
} from '../../api/timetable.api';
import extractErrorMessage from '../../utils/extractErrorMessage';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

function TimetablesPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const [timetables, setTimetables] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [generateResult, setGenerateResult] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);

  async function loadTimetables() {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await listTimetables({ limit: 50, sort: '-createdAt' });
      setTimetables(data);
    } catch (loadError) {
      setError(extractErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  // Real-time Socket listener setup
  useSocket({
    TIMETABLE_GENERATED: () => loadTimetables(),
    TIMETABLE_UPDATED: (data) => {
      loadTimetables();
      if (selectedTimetable && (selectedTimetable.id === data.timetableId || selectedTimetable._id === data.timetableId)) {
        handleViewTimetable(data.timetableId);
      }
    },
    TIMETABLE_PUBLISHED: () => loadTimetables(),
    TIMETABLE_ROLLED_BACK: (data) => {
      loadTimetables();
      if (data.timetableId) handleViewTimetable(data.timetableId);
    },
  });

  useEffect(() => {
    loadTimetables();

    if (isAdmin) {
      studentBatchesApi
        .list({ limit: 100 })
        .then(({ data }) => setBatches(data))
        .catch(() => setBatches([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleViewTimetable(id) {
    try {
      const timetable = await getTimetableById(id);
      setSelectedTimetable(timetable);
    } catch (viewError) {
      setError(extractErrorMessage(viewError));
    }
  }

  function toggleBatchSelection(batchId) {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setGenerateError('');
    setGenerateResult(null);
    setIsGenerating(true);

    try {
      const result = await generateTimetables({
        batchIds: selectedBatchIds,
        academicYear,
      });
      setGenerateResult(result);
      await loadTimetables();
    } catch (generateErr) {
      setGenerateError(extractErrorMessage(generateErr));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePublish(id) {
    try {
      await publishTimetable(id);
      await loadTimetables();
      if ((selectedTimetable?.id || selectedTimetable?._id) === id) {
        handleViewTimetable(id);
      }
    } catch (publishError) {
      setError(extractErrorMessage(publishError));
    }
  }

  async function handleArchive(id) {
    try {
      await archiveTimetable(id);
      await loadTimetables();
    } catch (archiveError) {
      setError(extractErrorMessage(archiveError));
    }
  }

  async function handleExport(id, format) {
    setExportingFormat(format);
    setError('');
    try {
      const timetable = timetables.find((t) => (t.id || t._id) === id) || selectedTimetable;
      const batchLabel = timetable?.batch?.batchName || id;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `timetable-${batchLabel}-v${timetable?.version || ''}.${extension}`
        .replace(/\s+/g, '-')
        .toLowerCase();

      await downloadTimetableExport(id, format, fileName);
    } catch (exportError) {
      setError(extractErrorMessage(exportError));
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Timetables</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setGenerateResult(null);
              setGenerateError('');
              setIsGenerateModalOpen(true);
            }}
          >
            Generate Timetable
          </Button>
        )}
      </div>

      <Alert tone="error">{error}</Alert>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Batch</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Academic Year</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Version</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Conflicts</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && timetables.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No timetables generated yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              timetables.map((timetable) => {
                const ttId = timetable.id || timetable._id;
                return (
                  <tr key={ttId}>
                    <td className="px-4 py-3 text-slate-700">
                      {timetable.batch?.batchName || timetable.batch}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{timetable.academicYear}</td>
                    <td className="px-4 py-3 text-slate-700">v{timetable.version}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={timetable.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {timetable.conflictCount > 0 ? (
                        <span className="font-semibold text-red-600">{timetable.conflictCount}</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">0</span>
                      )}
                    </td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewTimetable(ttId)}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        View
                      </button>
                      {isAdmin && timetable.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(ttId)}
                          className="font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Publish
                        </button>
                      )}
                      {isAdmin && timetable.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(ttId)}
                          className="font-medium text-slate-500 hover:text-slate-700"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {selectedTimetable && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedTimetable.batch?.batchName} — v{selectedTimetable.version}
            </h2>
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedTimetable.status} />
              <Button
                variant="secondary"
                isLoading={exportingFormat === 'pdf'}
                onClick={() => handleExport(selectedTimetable.id || selectedTimetable._id, 'pdf')}
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                isLoading={exportingFormat === 'excel'}
                onClick={() => handleExport(selectedTimetable.id || selectedTimetable._id, 'excel')}
              >
                Download Excel
              </Button>
            </div>
          </div>
          <TimetableGrid
            timetable={selectedTimetable}
            onTimetableUpdated={() => handleViewTimetable(selectedTimetable.id || selectedTimetable._id)}
          />
        </div>
      )}

      <Modal
        isOpen={isGenerateModalOpen}
        title="Generate Timetable"
        onClose={() => setIsGenerateModalOpen(false)}
      >
        <form className="flex flex-col gap-4" onSubmit={handleGenerate}>
          <Alert tone="error">{generateError}</Alert>

          {generateResult && (
            <Alert tone={generateResult.conflictCount > 0 ? 'error' : 'success'}>
              {generateResult.conflictCount > 0
                ? `Generated with ${generateResult.conflictCount} unresolved conflict(s). Review unassigned subjects, unresolved classes, and room allocation failures.`
                : 'Generated successfully with zero conflicts.'}
            </Alert>
          )}

          <TextField
            id="academicYear"
            label="Academic Year (YYYY-YYYY)"
            required
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
            placeholder="2025-2026"
          />

          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Student Batches</p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-300 p-2">
              {batches.length === 0 && (
                <p className="p-2 text-xs text-slate-400">No student batches available.</p>
              )}
              {batches.map((batch) => {
                const bId = batch.id || batch._id;
                return (
                  <label key={bId} className="flex items-center gap-2 px-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedBatchIds.includes(bId)}
                      onChange={() => toggleBatchSelection(bId)}
                    />
                    {batch.batchName} — Section {batch.section}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsGenerateModalOpen(false)}>
              Close
            </Button>
            <Button type="submit" isLoading={isGenerating} disabled={selectedBatchIds.length === 0}>
              Run Scheduling Engine
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TimetablesPage;
