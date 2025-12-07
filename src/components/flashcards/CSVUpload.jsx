import React from "react";
import { useCSVUpload } from "../../hooks/useCSVUpload";

export default function CSVUpload({ onQuestionsAdded }) {
  const {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload: upload,
    clearFileInput,
  } = useCSVUpload((parsed) => {
    const flashcards = parsed.map((q) => ({
      front: q.question || q.front || "",
      back: q.correct_answer || q.answer || q.back || "",
    }));

    onQuestionsAdded(flashcards);
  });

  return (
    <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-700 shadow-lg max-w-3xl mx-auto mb-10">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">
        Bulk Upload from CSV
      </h2>

      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="text-gray-300 mb-4"
      />

      {uploadError && <p className="text-red-400 mb-2">{uploadError}</p>}

      {selectedFile && (
        <p className="text-gray-300 mb-3">Selected: {selectedFile.name}</p>
      )}

      <div className="flex gap-4">
        <button
          onClick={upload}
          disabled={isUploadingCSV}
          className={`px-5 py-2 text-white rounded-lg transition 
          ${isUploadingCSV ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {isUploadingCSV ? "Processing..." : "Upload CSV"}
        </button>

        {selectedFile && (
          <button
            onClick={clearFileInput}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
