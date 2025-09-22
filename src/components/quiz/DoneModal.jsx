import React from "react";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { SquareX } from "../icons";
import { Link } from "react-router-dom";
import { useVolumeSettings } from "../../contexts/VolumeContext.jsx";


const DoneModal = ({ isActive, amountCorrect, totalAmount, active, loading, quizId, isCustomQuiz=false }) => {

    const { passThreshold } = useVolumeSettings();
    console.log('Modal open')


    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizId}&download=true`);
            if (!response.ok) {
                throw new Error("Failed to download study guide");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "study_guide.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading study guide:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    return (
        <Modal
            isOpen={active}
            contentLabel="Done Modal"
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                    zIndex: 1000,
                },
                content: {
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    padding: 0,
                },
            }}
        >
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-card rounded-3xl shadow-xl border border-accent">
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-primary">
                            <h2 className="text-3xl font-semibold text-gradient-primary">
                                Quiz Results!
                            </h2>
                            <button
                                type="button"
                                className="text-secondary hover:text-accent transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--neutral-200)]"
                                onClick={() => isActive(false)}
                            >
                                <SquareX className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Score Display */}
                        <div className="p-8">
                            <div className="text-center">
                                <div className="text-8xl font-bold text-gradient-primary mb-4">
                                    {amountCorrect}/{totalAmount}
                                </div>
                                <p className="text-xl text-secondary">
                                    You answered {amountCorrect} out of {totalAmount} questions correctly
                                </p>
                                <div className="mt-4">
                                    <div className="text-2xl font-semibold text-accent">
                                        {Math.round((amountCorrect / totalAmount) * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 p-8 border-t border-primary">
                            {isCustomQuiz && (
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading || loading}
                                    className="px-6 py-3 bg-[var(--neutral-200)] text-black rounded-lg font-medium transition-all duration-200 hover:bg-[var(--neutral-300)] hover:shadow-lg border border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? "Downloading..." : "Download Study Guide"}
                                </button>
                            )}

                            <Link to="/typeofquiz">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                                    onClick={() => isActive(false)}
                                >
                                    Take Another Quiz!
                                </button>
                            </Link>

                            <Link to="/dashboard">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-[var(--neutral-200)] text-black rounded-lg font-medium transition-all duration-200 hover:bg-[var(--neutral-300)] hover:shadow-lg border border-primary"
                                    onClick={() => isActive(false)}
                                >
                                    View Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DoneModal;
