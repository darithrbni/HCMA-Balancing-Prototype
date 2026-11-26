import { useEffect, useState } from 'react';
import {
  DEFAULT_CONFIG,
  cloneConfig,
} from '../constants/defaultConfig';
import {
  downloadCsvTemplate,
  parseCSV,
  serializeConfigToCSV,
} from '../utils/csvParser';
import { playClickSfx } from '../utils/audio';
import { ManualConfigTab } from './ManualConfigTab';
import { CsvInputTab } from './CsvInputTab';
import { UploadCsvTab } from './UploadCsvTab';
import type {
  ActivityDelta,
  ActivityKey,
  BalancingConfig,
  ConfigTab,
  CycleNumber,
} from '../types/game';

interface ConfigModalProps {
  initialConfig: BalancingConfig;
  isFirstRun: boolean;
  onApply: (config: BalancingConfig) => void;
  onClose: () => void;
}

const BUILT_IN_CSV_URL = `${import.meta.env.BASE_URL}hiyori-default-config.csv`;

const TAB_LABELS: Record<ConfigTab, string> = {
  manual: 'Manual Input Field',
  upload: 'Upload File .csv',
  csv: 'Copy-Paste CSV',
  preset: 'Gunakan File CSV Bawaan',
};

export function ConfigModal({
  initialConfig,
  isFirstRun,
  onApply,
  onClose,
}: ConfigModalProps) {
  const [tab, setTab] = useState<ConfigTab>('manual');
  const [draft, setDraft] = useState<BalancingConfig>(() =>
    cloneConfig(initialConfig),
  );
  const [csvText, setCsvText] = useState(() =>
    serializeConfigToCSV(initialConfig),
  );
  const [csvEdited, setCsvEdited] = useState(false);
  const [message, setMessage] = useState('');
  const [presetCsvText, setPresetCsvText] = useState<string | null>(null);
  const [presetMessage, setPresetMessage] = useState('');

  const fetchPresetCsv = async (): Promise<string | null> => {
    try {
      const response = await fetch(BUILT_IN_CSV_URL);
      if (!response.ok) {
        setPresetCsvText('');
        return null;
      }

      const text = await response.text();
      setPresetCsvText(text);
      return text;
    } catch {
      setPresetCsvText('');
      return null;
    }
  };

  useEffect(() => {
    if (tab === 'preset' && presetCsvText === null) {
      void fetchPresetCsv();
    }
  }, [tab, presetCsvText]);

  const handleTabChange = (next: ConfigTab) => {
    playClickSfx();
    if (next === tab) return;
    if (next === 'csv' && !csvEdited) {
      setCsvText(serializeConfigToCSV(draft));
    }
    if (next !== 'preset') {
      setPresetMessage('');
    }
    setTab(next);
  };

  const handleChangeActivity = (
    key: ActivityKey,
    field: keyof ActivityDelta,
    value: number,
  ) => {
    const safeValue = value;

    setDraft((previous) => ({
      ...previous,
      activities: {
        ...previous.activities,
        [key]: { ...previous.activities[key], [field]: safeValue },
      },
    }));
  };

  const handleChangeGlobal = (
    field: 'monetizationThreshold' | 'moneyMultiplier',
    value: number,
  ) => {
    setDraft((previous) => ({
      ...previous,
      [field]: Math.max(0, value),
    }));
  };

  const handleChangeCycle = (cycle: CycleNumber, value: number) => {
    setDraft((previous) => ({
      ...previous,
      cycleMultipliers: {
        ...previous.cycleMultipliers,
        [cycle]: Math.max(0, value),
      },
    }));
  };

  const handleParse = () => {
    const result = parseCSV(csvText, draft);
    setDraft(result.config);
    setCsvEdited(false);
    setMessage(
      result.errors.length > 0
        ? `CSV diterapkan (${result.errors.length} baris diabaikan).`
        : 'CSV diterapkan ke state.',
    );
  };

  const handleGenerate = () => {
    setCsvText(serializeConfigToCSV(draft));
    setCsvEdited(false);
    setMessage('CSV dihasilkan dari state saat ini.');
  };

  const handleFileText = (text: string, fileName: string) => {
    const result = parseCSV(text, draft);
    setDraft(result.config);
    setCsvText(text);
    setCsvEdited(true);
    setMessage(
      result.errors.length > 0
        ? `${fileName} dibaca (${result.errors.length} baris diabaikan).`
        : `${fileName} dibaca dan diterapkan.`,
    );
  };

  const handleDownload = () => {
    downloadCsvTemplate(serializeConfigToCSV(draft));
    setMessage('Template CSV diunduh dari state saat ini.');
  };

  const handleResetConfig = () => {
    setDraft(cloneConfig(DEFAULT_CONFIG));
    setCsvText(serializeConfigToCSV(DEFAULT_CONFIG));
    setCsvEdited(false);
    setMessage('Konfigurasi dikembalikan ke default.');
  };

  const handleUsePreset = async () => {
    const text =
      presetCsvText && presetCsvText.length > 0
        ? presetCsvText
        : await fetchPresetCsv();

    if (!text) {
      setPresetMessage('Gagal membaca CSV bawaan.');
      return;
    }

    const result = parseCSV(text, draft);
    setDraft(result.config);
    setCsvText(text);
    setCsvEdited(false);
    setPresetMessage(
      result.errors.length > 0
        ? `CSV bawaan diterapkan (${result.errors.length} baris diabaikan).`
        : 'CSV bawaan diterapkan',
    );
  };

  const handleApply = () => {
    onApply(cloneConfig(draft));
  };

  const handleClose = () => {
    onClose();
  };

  const presetRows =
    presetCsvText && presetCsvText.length > 0
      ? presetCsvText.trim().split('\n').map((line) => line.split(','))
      : [];

  return (
    <div className="modal-overlay">
      <div className="modal-box config-box" role="dialog" aria-modal="true">
        <div className="panel-header">
          <span className="wire-box-title">Konfigurasi Balancing</span>
          <button
            type="button"
            className="wire-button compact"
            onClick={() => {
              playClickSfx();
              handleResetConfig();
            }}
          >
            [Reset Default]
          </button>
        </div>

        <div className="tabs" role="tablist">
          {(Object.keys(TAB_LABELS) as ConfigTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`wire-button compact tab-button${tab === key ? ' active' : ''}`}
              onClick={() => handleTabChange(key)}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="config-content">
          {tab === 'manual' && (
            <ManualConfigTab
              draft={draft}
              onChangeActivity={handleChangeActivity}
              onChangeGlobal={handleChangeGlobal}
              onChangeCycle={handleChangeCycle}
            />
          )}
          {tab === 'upload' && (
            <UploadCsvTab
              message={message}
              onFileText={handleFileText}
              onError={(text) => setMessage(text)}
              onDownload={handleDownload}
            />
          )}
          {tab === 'csv' && (
            <CsvInputTab
              value={csvText}
              message={message}
              onChange={(value) => {
                setCsvText(value);
                setCsvEdited(true);
              }}
              onParse={handleParse}
              onGenerate={handleGenerate}
            />
          )}
          {tab === 'preset' && (
            <div>
              {presetCsvText === null ? (
                <p className="message-line">Memuat pratinjau CSV bawaan...</p>
              ) : presetRows.length === 0 ? (
                <p className="message-line">CSV bawaan tidak tersedia.</p>
              ) : (
                <div className="table-scroll preset-preview">
                  <table className="wire-table">
                    <thead>
                      <tr>
                        {presetRows[0].map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {presetRows.slice(1).map((row, rowIndex) => (
                        <tr key={`${row[1] ?? 'row'}-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="button-row">
                <button
                  type="button"
                  className="wire-button compact"
                  onClick={() => {
                    playClickSfx();
                    void handleUsePreset();
                  }}
                >
                  Terapkan File CSV Bawaan
                </button>
              </div>
              {presetMessage && <p className="message-line">{presetMessage}</p>}
            </div>
          )}
        </div>

        <div className="config-footer">
          {!isFirstRun && (
            <button
              type="button"
              className="wire-button compact"
              onClick={() => {
                playClickSfx();
                handleClose();
              }}
            >
              [Batal]
            </button>
          )}
          <button
            type="button"
            className="wire-button compact primary"
            onClick={() => {
              playClickSfx();
              handleApply();
            }}
          >
            {isFirstRun ? '[Mulai Simulasi]' : '[Terapkan Config]'}
          </button>
        </div>
      </div>
    </div>
  );
}
