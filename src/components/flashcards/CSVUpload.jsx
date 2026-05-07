import { useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "react-toastify";

const REQUIRED_HEADERS = ["front", "back"];

const normalizeHeader = (value) => String(value || "").trim().toLowerCase();

const parseFlashcardCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const missingHeaders = REQUIRED_HEADERS.filter(
            (header) => !headers.includes(header)
          );

          if (missingHeaders.length > 0) {
            throw new Error(
              `Missing required column(s): ${missingHeaders.join(", ")}. CSV format must be: front,back`
            );
          }

          const cards = results.data
            .map((row, index) => {
              const front = String(row.front || "").trim();
              const back = String(row.back || "").trim();

              if (!front && !back) {
                return null;
              }

              if (!front || !back) {
                throw new Error(`Row ${index + 2}: Both front and back are required.`);
              }

              return {
                id: `card_${Date.now()}_${index + 1}`,
                front,
                back,
                type: "basic",
              };
            })
            .filter(Boolean);

          if (cards.length === 0) {
            throw new Error(
              "No valid cards found in CSV file. Make sure your file has front and back values."
            );
          }

          resolve({
            success: true,
            cards,
            count: cards.length,
          });
        } catch (error) {
          reject({
            success: false,
            error: error.message,
          });
        }
      },
      error: (error) => {
        reject({
          success: false,
          error: `CSV parsing error: ${error.message}`,
        });
      },
    });
  });
};

const downloadFlashcardCSVTemplate = () => {
  const template = `front,back
"What does HTML stand for?","HyperText Markup Language"
"What CSS property changes text color?","color"
"What React hook manages component state?","useState"
"What does API stand for?","Application Programming Interface"`;

  const blob = new Blob([template], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcard_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default function CSVUpload({ onQuestionsAdded }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    setUploadError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setUploadError("Please choose a .csv file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please choose a CSV file first.");
      return;
    }

    try {
      setIsUploadingCSV(true);
      setUploadError("");

      const result = await parseFlashcardCSV(selectedFile);

      onQuestionsAdded(result.cards);
      toast.success(
        `${result.count} flashcard${result.count === 1 ? "" : "s"} imported from CSV!`
      );
      clearFileInput();
    } catch (error) {
      const message = error?.error || error?.message || "Failed to import CSV file.";
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploadingCSV(false);
    }
  };

  return (
    <div className="w-full space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 text-primary shadow-inner">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">
          📥 Upload Cards from CSV
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload a CSV file with flashcard fronts and backs to add them all at once.
        </p>
      </div>

      <label
        htmlFor="csv-file-input"
        className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--primary-400)] px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-500)] hover:shadow-xl"
      >
        {selectedFile ? `📄 ${selectedFile.name}` : "📁 Choose CSV File"}
      </label>

      <input
        ref={fileInputRef}
        id="csv-file-input"
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelect}
        className="sr-only"
      />

      {uploadError ? (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {uploadError}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCSVUpload}
          disabled={isUploadingCSV || !selectedFile}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isUploadingCSV ? "Processing..." : "⬆️ Upload CSV"}
        </button>

        {selectedFile ? (
          <button
            type="button"
            onClick={clearFileInput}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-3 font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
        <button
          type="button"
          onClick={() => setShowRequirements((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-primary"
        >
          <span>{showRequirements ? "▾" : "▸"} 📋 CSV Format Requirements</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              downloadFlashcardCSVTemplate();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                downloadFlashcardCSVTemplate();
              }
            }}
            className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Download Template
          </span>
        </button>

        {showRequirements ? (
          <div className="space-y-3 border-t border-[var(--border)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            <p>Your CSV must have these columns in order:</p>
            <code className="block rounded-lg bg-[var(--bg-primary)] px-3 py-2 text-primary">
              front,back
            </code>
            <p>Each row creates one flashcard. Both fields are required.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}