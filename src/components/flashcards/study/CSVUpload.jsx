import React from "react";
import { useCSVUpload } from "../../../hooks/useCSVUpload";

export default function CSVUpload({ saveDeck }) {

  // Called when CSV parsing succeeds
  const onQuestionsAdded = (questions) => {
    const formattedCards = questions.map(q => ({
      front: q.front || q.question || "",
      back: q.back || q.answer || "",
    }));

    saveDeck({
      name: "Imported Deck",
      cards: formattedCards,
      tags: "",
      isPublic: false,
      category: "General",
      difficulty: "2",
      description: "Imported via CSV upload",
    });
  };

  const {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload,
    clearFileInput,
  } = useCSVUpload(onQuestionsAdded);

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">
        Bulk Upload from CSV
      </h2>

      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="text-white mb-4 block"
      />

      {uploadError && (
        <p className="text-red-400 mb-2">{uploadError}</p>
      )}

      {selectedFile && (
        <p className="text-gray-300 mb-2">Selected: {selectedFile.name}</p>
      )}

      <button
        onClick={handleCSVUpload}
        disabled={isUploadingCSV}
        className={`px-4 py-2 text-white rounded-lg 
          ${isUploadingCSV ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"}`}
      >
        {isUploadingCSV ? "Processing..." : "Upload CSV"}
      </button>

      {selectedFile && (
        <button
          onClick={clearFileInput}
          className="ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Clear
        </button>
      )}
    </div>
  );
}
