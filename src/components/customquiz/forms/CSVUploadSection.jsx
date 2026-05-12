/**
 * CSVUploadSection Component
 * Handles bulk question upload from CSV files
 */

export default function CSVUploadSection({
  selectedFile,
  onFileSelect,
  onUpload,
  isUploading,
  uploadError
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-[var(--text-primary)] shadow-inner transition-colors duration-200 md:p-8">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
        📤 Bulk Upload from CSV
      </h2>
      <p className="text-sm text-[var(--text-secondary)] md:text-base">
        Upload a CSV file with multiple questions to add them all at once.
      </p>

      <div className="space-y-4">
        {/* File Input */}
        <div className="space-y-3">
          <label
            htmlFor="csv-file-input"
            className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--btn-primary-bg)] px-5 py-3 text-center font-semibold text-[var(--btn-primary-text)] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-xl"
          >
            {selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose CSV File'}
          </label>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={onFileSelect}
            disabled={isUploading}
            className="hidden"
          />

          {uploadError && (
            <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm font-medium text-[var(--error-text)]">
              {uploadError}
            </div>
          )}

          <button
            onClick={onUpload}
            disabled={isUploading || !selectedFile}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--success)] bg-[var(--success)] px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isUploading ? (
              <>
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              '⬆️ Upload CSV'
            )}
          </button>
        </div>

        {/* CSV Format Info - Collapsible */}
        <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 transition-colors duration-200">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)] md:text-base">
            📋 CSV Format Requirements
          </summary>
          <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)] md:text-sm">
            <p>Your CSV must have these columns in order:</p>
            <code className="block overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--text-primary)]">
              question,option_1,option_2,option_3,option_4,correct_answer,difficulty
            </code>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>difficulty</strong>: 1-5 (1 = easiest, 5 = hardest)</li>
              <li><strong>correct_answer</strong>: Must match one of the options exactly</li>
              <li>First row should be headers (will be skipped)</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
