import { playClickSfx } from '../utils/audio';

interface CsvInputTabProps {
  value: string;
  message: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onGenerate: () => void;
}

export function CsvInputTab({
  value,
  message,
  onChange,
  onParse,
  onGenerate,
}: CsvInputTabProps) {
  return (
    <div>
      <label className="wire-field">
        Tempel teks CSV di sini
        <textarea
          className="csv-textarea"
          value={value}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>

      <div className="button-row">
        <button
          type="button"
          className="wire-button compact"
          onClick={() => {
            playClickSfx();
            onParse();
          }}
        >
          [Parse &amp; Terapkan CSV]
        </button>
        <button
          type="button"
          className="wire-button compact"
          onClick={() => {
            playClickSfx();
            onGenerate();
          }}
        >
          [Generate dari State Saat Ini]
        </button>
      </div>

      {message && <p className="message-line">{message}</p>}
    </div>
  );
}
