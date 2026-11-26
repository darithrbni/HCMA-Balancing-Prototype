import type { ChangeEvent } from 'react';
import { playClickSfx } from '../utils/audio';

interface UploadCsvTabProps {
  message: string;
  onFileText: (text: string, fileName: string) => void;
  onError: (message: string) => void;
  onDownload: () => void;
}

export function UploadCsvTab({
  message,
  onFileText,
  onError,
  onDownload,
}: UploadCsvTabProps) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onFileText(String(reader.result ?? ''), file.name);
    reader.onerror = () => onError(`Gagal membaca file: ${file.name}`);
    reader.readAsText(file);
  };

  return (
    <div>
      <label className="wire-field">
        Pilih file .csv
        <input
          type="file"
          accept=".csv,text/csv"
          onClick={() => playClickSfx()}
          onChange={handleFile}
        />
      </label>

      <div className="button-row">
        <button
          type="button"
          className="wire-button compact"
          onClick={() => {
            playClickSfx();
            onDownload();
          }}
        >
          [Download Template .csv]
        </button>
      </div>

      {message && <p className="message-line">{message}</p>}
    </div>
  );
}
