import React from "react";
import { useCSVUpload } from "../../hooks/useCSVUpload";

export default function CSVUpload({ onQuestionsAdded }) {
  const {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload,
    clearFileInput,
  } = useCSVUpload((rows) => {
    // For flashcards, rows are expected to be [front, back].
    const flashcards = rows.map((row) => ({
      front: row[0] || "",
      back: row[1] || "",
    }));

    onQuestionsAdded(flashcards);
  });

  return (
    <div className="w-full mt-4 p-4 rounded-lg border border-accent bg-[var(--neutral-200)]">
      <h2 className="text-lg font-semibold mb-3 text-[var(--primary-500)]">
        Upload Cards from CSV
      </h2>

      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="mb-3 block text-[var(--neutral-800)]"
      />

      {uploadError && (
        <p className="text-red-600 mb-2 text-sm">{uploadError}</p>
      )}

      {selectedFile && (
        <p className="text-sm text-[var(--neutral-700)] mb-2">
          Selected file: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCSVUpload}
          disabled={isUploadingCSV}
          className={`px-4 py-2 rounded-lg font-medium text-white border border-accent
            ${
              isUploadingCSV
                ? "bg-[var(--neutral-500)]"
                : "bg-[var(--primary-400)] hover:bg-[var(--primary-500)]"
            }`}
        >
          {isUploadingCSV ? "Processing..." : "Upload CSV"}
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={clearFileInput}
            className="px-4 py-2 rounded-lg font-medium bg-[var(--neutral-300)] hover:bg-[var(--neutral-400)] text-[var(--neutral-900)] border border-accent"
          >
            Clear
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--neutral-700)]">
        CSV format: <code>front,back</code>. Each row in the file will create a
        new flashcard.
      </p>
    </div>
  );
}
