'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check, Image as ImageIcon, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  initialSignature?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  onSave: (signatureDataUrl: string, name: string, title: string) => void;
}

export function SignaturePad({
  initialSignature = '',
  signatoryName = 'Vacanyi Project Lead',
  signatoryTitle = 'Authorized Builder & Contractor',
  onSave,
}: SignaturePadProps) {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [signatureUrl, setSignatureUrl] = useState<string>(initialSignature);
  const [name, setName] = useState<string>(signatoryName);
  const [title, setTitle] = useState<string>(signatoryTitle);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setSignatureUrl(initialSignature);
  }, [initialSignature]);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#082B52';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  // Canvas drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureUrl(dataUrl);
      onSave(dataUrl, name, title);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureUrl('');
    setHasDrawn(false);
    onSave('', name, title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSignatureUrl(result);
      onSave(result, name, title);
    };
    reader.readAsDataURL(file);
  };

  const handleDetailsChange = (newName: string, newTitle: string) => {
    setName(newName);
    setTitle(newTitle);
    onSave(signatureUrl, newName, newTitle);
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'draw'
              ? 'bg-[#082B52] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Draw Signature</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'upload'
              ? 'bg-[#082B52] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Signature Input Container */}
      {mode === 'draw' ? (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              width={500}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[140px] cursor-crosshair block"
            />
            {!hasDrawn && !signatureUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
                <span>Sign here with touch or mouse ✍️</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Sign with mouse, stylus or touch on mobile</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-slate-600 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Pad</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center relative hover:bg-slate-100/70 transition-colors">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-[#082B52]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Click to upload signature image</p>
                <p className="text-[10px] text-slate-500">PNG with transparent background recommended (Max 2MB)</p>
              </div>
            </div>
          </div>

          {signatureUrl && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSignatureUrl('');
                  onSave('', name, title);
                }}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-bold py-1 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Uploaded Signature</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Signatory Name & Title Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Authorized Signatory Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleDetailsChange(e.target.value, title)}
            placeholder="e.g. Vacanyi Lead Director"
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Official Capacity / Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleDetailsChange(name, e.target.value)}
            placeholder="e.g. Managing Director & NHBRC Builder"
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
          />
        </div>
      </div>

      {/* Live Signature Preview on Document */}
      {signatureUrl && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Official Document Signature Preview
          </span>
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4 max-w-sm">
            <div>
              <div className="h-12 flex items-end">
                <img
                  src={signatureUrl}
                  alt="Vacanyi Signature"
                  className="max-h-11 object-contain"
                />
              </div>
              <div className="border-t border-slate-300 pt-1 mt-1">
                <p className="font-bold text-xs text-[#082B52] leading-tight">{name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{title}</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              Active Signature
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
