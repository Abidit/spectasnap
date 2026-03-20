'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Upload, Trash2, Box, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GLBModelMeta {
  id: string;
  name: string;
  storeId: string;
  blobUrl: string;
  fileSize: number;
  uploadedAt: string;
  calibration?: {
    scale?: number;
    yOffset?: number;
    zOffset?: number;
    boundingBox?: { width: number; height: number; depth: number };
  };
  hasTemples?: boolean;
  templeMeshNames?: string[];
  templeMethod?: 'bone' | 'split' | 'none' | 'auto';
}

interface CalibrationOverride {
  scale: number;
  yOffset: number;
  zOffset: number;
}

interface TempleOverride {
  hasTemples: boolean;
  templeMeshNames: string;
  templeMethod: 'auto' | 'bone' | 'split' | 'none';
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminModelsPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [models, setModels] = useState<GLBModelMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState('default');
  const [modelName, setModelName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [calibrationOverrides, setCalibrationOverrides] = useState<
    Record<string, CalibrationOverride>
  >({});
  const [templeOverrides, setTempleOverrides] = useState<Record<string, TempleOverride>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch models ─────────────────────────────────────────────────────────
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/upload-glb?store=${encodeURIComponent(storeId)}`);
      const data = await res.json();
      if (data.ok) {
        setModels(data.models ?? []);
      }
    } catch {
      // Silently fail on list errors — list will be empty.
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // ── Upload handler ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setStatusMessage('Please select a .glb file first.');
      return;
    }

    setUploadStatus('uploading');
    setStatusMessage('Uploading model...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', modelName.trim() || selectedFile.name.replace(/\.glb$/i, ''));
      formData.append('storeId', storeId);

      const res = await fetch('/api/upload-glb', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.ok) {
        setUploadStatus('success');
        setStatusMessage(`"${data.meta?.name ?? modelName}" uploaded successfully.`);
        setSelectedFile(null);
        setModelName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchModels();
      } else {
        setUploadStatus('error');
        setStatusMessage(data.error || 'Upload failed.');
      }
    } catch {
      setUploadStatus('error');
      setStatusMessage('Network error — could not reach the server.');
    }
  };

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = async (model: GLBModelMeta) => {
    if (!confirm(`Delete "${model.name}"? This cannot be undone.`)) return;

    setDeletingId(model.id);
    try {
      const res = await fetch(
        `/api/upload-glb?id=${encodeURIComponent(model.id)}&store=${encodeURIComponent(model.storeId)}`,
        { method: 'DELETE' },
      );
      const data = await res.json();
      if (data.ok) {
        setModels((prev) => prev.filter((m) => m.id !== model.id));
      }
    } catch {
      // Deletion failed — model stays in the list.
    } finally {
      setDeletingId(null);
    }
  };

  // ── Drag-and-drop ────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      setSelectedFile(file);
      if (!modelName) {
        setModelName(file.name.replace(/\.glb$/i, ''));
      }
      setUploadStatus('idle');
      setStatusMessage('');
    } else {
      setUploadStatus('error');
      setStatusMessage('Only .glb files are accepted.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !modelName) {
      setModelName(file.name.replace(/\.glb$/i, ''));
    }
    setUploadStatus('idle');
    setStatusMessage('');
  };

  // ── Calibration override handler ─────────────────────────────────────────
  const handleCalibrationChange = (
    modelId: string,
    field: keyof CalibrationOverride,
    value: number,
  ) => {
    setCalibrationOverrides((prev) => ({
      ...prev,
      [modelId]: {
        scale: prev[modelId]?.scale ?? 1.0,
        yOffset: prev[modelId]?.yOffset ?? 0,
        zOffset: prev[modelId]?.zOffset ?? 0,
        [field]: value,
      },
    }));
  };

  // ── Temple override handler ─────────────────────────────────────────
  const handleTempleChange = (
    modelId: string,
    field: keyof TempleOverride,
    value: boolean | string,
  ) => {
    setTempleOverrides((prev) => {
      const model = models.find((m) => m.id === modelId);
      return {
        ...prev,
        [modelId]: {
          hasTemples: prev[modelId]?.hasTemples ?? (model?.hasTemples ?? false),
          templeMeshNames: prev[modelId]?.templeMeshNames ?? (model?.templeMeshNames?.join(', ') ?? ''),
          templeMethod: prev[modelId]?.templeMethod ?? (model?.templeMethod ?? 'auto'),
          [field]: value,
        },
      };
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#F5F0E8', color: '#1A1612' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b"
        style={{
          backgroundColor: '#FDFAF4',
          borderColor: '#DDD8CE',
        }}
      >
        <Link
          href="/trydemo"
          className="flex items-center gap-1 font-sans text-sm font-semibold uppercase"
          style={{
            color: '#6B6560',
            letterSpacing: '0.12em',
            textDecoration: 'none',
          }}
          aria-label="Back to demo"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <Link
          href="/admin/generate-glb"
          className="flex items-center gap-1 font-sans text-sm font-semibold uppercase"
          style={{
            color: '#C9A96E',
            letterSpacing: '0.12em',
            textDecoration: 'none',
          }}
          aria-label="GLB Generator"
        >
          <Wrench size={16} />
          GLB Generator
        </Link>
        <div className="flex-1" />
        <h1
          className="font-serif text-xl font-semibold"
          style={{ color: '#1A1612' }}
        >
          3D Model Manager
        </h1>
        <div className="flex-1" />
        {/* Spacer to keep title centred */}
        <div style={{ width: 160 }} />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* ── Upload section ────────────────────────────────────────────── */}
        <section
          className="mb-8 p-6 border"
          style={{
            backgroundColor: '#FDFAF4',
            borderColor: '#DDD8CE',
            borderRadius: 2,
          }}
        >
          <h2
            className="font-serif text-lg font-semibold mb-4"
            style={{ color: '#1A1612' }}
          >
            Upload GLB Model
          </h2>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            aria-label="Drop a .glb file here or click to browse"
            className="flex flex-col items-center justify-center gap-2 py-10 px-4 border-2 border-dashed cursor-pointer transition-colors"
            style={{
              borderColor: isDragOver ? '#C9A96E' : '#DDD8CE',
              backgroundColor: isDragOver ? 'rgba(201,169,110,0.06)' : 'transparent',
              borderRadius: 2,
            }}
          >
            <Upload
              size={28}
              style={{ color: isDragOver ? '#C9A96E' : '#6B6560' }}
            />
            {selectedFile ? (
              <p className="text-sm font-sans" style={{ color: '#1A1612' }}>
                {selectedFile.name}{' '}
                <span style={{ color: '#6B6560' }}>
                  ({formatBytes(selectedFile.size)})
                </span>
              </p>
            ) : (
              <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
                Drag &amp; drop a <strong>.glb</strong> file here, or click to browse
              </p>
            )}
            <p
              className="text-xs font-sans"
              style={{ color: '#6B6560' }}
            >
              Max 10 MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".glb"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />

          {/* Fields */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="model-name"
                className="block text-xs font-sans font-semibold uppercase mb-1"
                style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
              >
                Model Name
              </label>
              <input
                id="model-name"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Classic Aviator"
                className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                style={{
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                  backgroundColor: '#FDFAF4',
                  color: '#1A1612',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="store-id"
                className="block text-xs font-sans font-semibold uppercase mb-1"
                style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
              >
                Store ID
              </label>
              <input
                id="store-id"
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="default"
                className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                style={{
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                  backgroundColor: '#FDFAF4',
                  color: '#1A1612',
                }}
              />
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading'}
            className="mt-4 w-full py-2.5 text-sm font-sans font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
            style={{
              backgroundColor: '#1A1612',
              color: '#F5F0E8',
              borderRadius: 2,
              letterSpacing: '0.12em',
            }}
            aria-label="Upload GLB model"
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Model'}
          </button>

          {/* Status message */}
          {statusMessage && (
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 text-sm font-sans border"
              style={{
                borderRadius: 2,
                backgroundColor:
                  uploadStatus === 'success'
                    ? 'rgba(201,169,110,0.08)'
                    : uploadStatus === 'error'
                      ? 'rgba(220,38,38,0.06)'
                      : 'transparent',
                borderColor:
                  uploadStatus === 'success'
                    ? '#C9A96E'
                    : uploadStatus === 'error'
                      ? '#DC2626'
                      : '#DDD8CE',
                color:
                  uploadStatus === 'error' ? '#DC2626' : '#1A1612',
              }}
              role={uploadStatus === 'error' ? 'alert' : 'status'}
            >
              {uploadStatus === 'success' && (
                <CheckCircle size={16} style={{ color: '#C9A96E' }} />
              )}
              {uploadStatus === 'error' && (
                <AlertCircle size={16} style={{ color: '#DC2626' }} />
              )}
              {statusMessage}
            </div>
          )}
        </section>

        {/* ── Models list ───────────────────────────────────────────────── */}
        <section>
          <h2
            className="font-serif text-lg font-semibold mb-4"
            style={{ color: '#1A1612' }}
          >
            Uploaded Models
          </h2>

          {loading ? (
            <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
              Loading models...
            </p>
          ) : models.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-12 border"
              style={{
                backgroundColor: '#FDFAF4',
                borderColor: '#DDD8CE',
                borderRadius: 2,
              }}
            >
              <Box size={32} style={{ color: '#DDD8CE' }} />
              <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
                No 3D models uploaded yet. Upload a .glb file to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {models.map((model) => {
                const overrides = calibrationOverrides[model.id];
                const cal = model.calibration;
                const temples = templeOverrides[model.id] ?? {
                  hasTemples: model.hasTemples ?? false,
                  templeMeshNames: model.templeMeshNames?.join(', ') ?? '',
                  templeMethod: (model.templeMethod ?? 'auto') as 'auto' | 'bone' | 'split' | 'none',
                };
                return (
                  <div
                    key={model.id}
                    className="p-4 border"
                    style={{
                      backgroundColor: '#FDFAF4',
                      borderColor: '#DDD8CE',
                      borderRadius: 2,
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-serif text-base font-semibold truncate"
                          style={{ color: '#1A1612' }}
                        >
                          {model.name}
                        </h3>
                        <div
                          className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans"
                          style={{ color: '#6B6560' }}
                        >
                          <span>
                            <strong style={{ color: '#C9A96E' }}>Store:</strong>{' '}
                            {model.storeId}
                          </span>
                          <span>{formatBytes(model.fileSize)}</span>
                          <span>{formatDate(model.uploadedAt)}</span>
                        </div>
                        <p
                          className="mt-1 text-xs font-sans break-all"
                          style={{ color: '#6B6560' }}
                        >
                          ID: {model.id}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(model)}
                        disabled={deletingId === model.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold uppercase border transition-opacity disabled:opacity-40"
                        style={{
                          borderColor: '#DC2626',
                          color: '#DC2626',
                          borderRadius: 2,
                          letterSpacing: '0.08em',
                        }}
                        aria-label={`Delete model ${model.name}`}
                      >
                        <Trash2 size={12} />
                        {deletingId === model.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>

                    {/* Calibration info */}
                    {cal && (
                      <div
                        className="mt-3 p-3 border text-xs font-sans"
                        style={{
                          borderColor: '#DDD8CE',
                          borderRadius: 2,
                          backgroundColor: 'rgba(201,169,110,0.04)',
                        }}
                      >
                        <p
                          className="font-semibold uppercase mb-2"
                          style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                        >
                          Auto-Calibration
                        </p>
                        <div className="grid grid-cols-3 gap-2" style={{ color: '#6B6560' }}>
                          <span>
                            Scale: <strong style={{ color: '#1A1612' }}>{cal.scale?.toFixed(4)}</strong>
                          </span>
                          <span>
                            Y Offset: <strong style={{ color: '#1A1612' }}>{cal.yOffset?.toFixed(4)}</strong>
                          </span>
                          <span>
                            Z Offset: <strong style={{ color: '#1A1612' }}>{cal.zOffset?.toFixed(4)}</strong>
                          </span>
                        </div>
                        {cal.boundingBox && (
                          <p className="mt-1" style={{ color: '#6B6560' }}>
                            Bounding Box: {cal.boundingBox.width.toFixed(3)} x{' '}
                            {cal.boundingBox.height.toFixed(3)} x{' '}
                            {cal.boundingBox.depth.toFixed(3)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Manual calibration overrides */}
                    <div
                      className="mt-3 p-3 border text-xs font-sans"
                      style={{
                        borderColor: '#DDD8CE',
                        borderRadius: 2,
                      }}
                    >
                      <p
                        className="font-semibold uppercase mb-2"
                        style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                      >
                        Manual Overrides
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor={`scale-${model.id}`}
                            className="block mb-1"
                            style={{ color: '#6B6560' }}
                          >
                            Scale ({(overrides?.scale ?? 1.0).toFixed(2)})
                          </label>
                          <input
                            id={`scale-${model.id}`}
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.01"
                            value={overrides?.scale ?? 1.0}
                            onChange={(e) =>
                              handleCalibrationChange(model.id, 'scale', parseFloat(e.target.value))
                            }
                            className="w-full accent-[#C9A96E]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`yoffset-${model.id}`}
                            className="block mb-1"
                            style={{ color: '#6B6560' }}
                          >
                            Y Offset ({(overrides?.yOffset ?? 0).toFixed(3)})
                          </label>
                          <input
                            id={`yoffset-${model.id}`}
                            type="range"
                            min="-0.05"
                            max="0.05"
                            step="0.001"
                            value={overrides?.yOffset ?? 0}
                            onChange={(e) =>
                              handleCalibrationChange(model.id, 'yOffset', parseFloat(e.target.value))
                            }
                            className="w-full accent-[#C9A96E]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`zoffset-${model.id}`}
                            className="block mb-1"
                            style={{ color: '#6B6560' }}
                          >
                            Z Offset ({(overrides?.zOffset ?? 0).toFixed(3)})
                          </label>
                          <input
                            id={`zoffset-${model.id}`}
                            type="range"
                            min="-0.05"
                            max="0.05"
                            step="0.001"
                            value={overrides?.zOffset ?? 0}
                            onChange={(e) =>
                              handleCalibrationChange(model.id, 'zOffset', parseFloat(e.target.value))
                            }
                            className="w-full accent-[#C9A96E]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Temple Detection section */}
                    <div
                      className="mt-3 p-3 border text-xs font-sans"
                      style={{
                        borderColor: '#DDD8CE',
                        borderRadius: 2,
                      }}
                    >
                      <p
                        className="font-semibold uppercase mb-2"
                        style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                      >
                        Temple Detection
                      </p>

                      {/* Has Temples toggle */}
                      <div className="flex items-center gap-3 mb-3">
                        <label htmlFor={`has-temples-${model.id}`} style={{ color: '#6B6560' }}>
                          Has Temple Arms
                        </label>
                        <button
                          id={`has-temples-${model.id}`}
                          role="switch"
                          aria-checked={temples.hasTemples}
                          onClick={() => handleTempleChange(model.id, 'hasTemples', !temples.hasTemples)}
                          className="relative w-9 h-5 transition-colors"
                          style={{
                            backgroundColor: temples.hasTemples ? '#C9A96E' : '#DDD8CE',
                            borderRadius: 2,
                          }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 transition-transform"
                            style={{
                              backgroundColor: '#FDFAF4',
                              borderRadius: 2,
                              transform: temples.hasTemples ? 'translateX(16px)' : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>

                      {/* Temple Mesh Names */}
                      <div className="mb-3">
                        <label
                          htmlFor={`temple-names-${model.id}`}
                          className="block mb-1"
                          style={{ color: '#6B6560' }}
                        >
                          Temple Mesh Names (comma-separated)
                        </label>
                        <input
                          id={`temple-names-${model.id}`}
                          type="text"
                          value={temples.templeMeshNames}
                          onChange={(e) => handleTempleChange(model.id, 'templeMeshNames', e.target.value)}
                          placeholder="temple_left, temple_right"
                          className="w-full px-2 py-1 text-xs font-sans border outline-none focus:ring-1"
                          style={{
                            borderColor: '#DDD8CE',
                            borderRadius: 2,
                            backgroundColor: '#FDFAF4',
                            color: '#1A1612',
                          }}
                        />
                      </div>

                      {/* Temple Method dropdown */}
                      <div>
                        <label
                          htmlFor={`temple-method-${model.id}`}
                          className="block mb-1"
                          style={{ color: '#6B6560' }}
                        >
                          Temple Method
                        </label>
                        <select
                          id={`temple-method-${model.id}`}
                          value={temples.templeMethod}
                          onChange={(e) => handleTempleChange(model.id, 'templeMethod', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-sans border outline-none focus:ring-1"
                          style={{
                            borderColor: '#DDD8CE',
                            borderRadius: 2,
                            backgroundColor: '#FDFAF4',
                            color: '#1A1612',
                          }}
                        >
                          <option value="auto">Auto Detect</option>
                          <option value="bone">Bone-based</option>
                          <option value="split">Split Group</option>
                          <option value="none">None (No Temples)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
