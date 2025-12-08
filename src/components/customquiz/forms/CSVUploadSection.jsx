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
    <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
        📤 Bulk Upload from CSV
      </h2>
      <p className="text-sm md:text-base text-secondary mb-4 md:mb-6">
        Upload a CSV file with multiple questions to add them all at once.
      </p>

      <div className="space-y-4">
        {/* File Input */}
        <div className="space-y-3">
          <label
            htmlFor="csv-file-input"
            className="block w-full px-4 py-3 bg-accent hover:bg-accent-hover text-white text-center rounded-lg font-medium transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
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
            <p className="text-sm text-error">{uploadError}</p>
          )}

          {selectedFile && (
            <button
              onClick={onUpload}
              disabled={isUploading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                '⬆️ Upload CSV'
              )}
            </button>
          )}
        </div>

        {/* CSV Format Info - Collapsible */}
        <details className="p-4 bg-secondary rounded-lg border border-primary">
          <summary className="font-semibold text-primary cursor-pointer text-sm md:text-base">
            📋 CSV Format Requirements
          </summary>
          <div className="mt-3 space-y-2 text-xs md:text-sm text-secondary">
            <p>Your CSV must have these columns in order:</p>
            <code className="block bg-primary text-secondary px-2 py-1 rounded overflow-x-auto text-xs">
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
