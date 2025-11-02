import { SquareX } from "../icons/index.jsx";
import Modal from "react-modal";

const HelpModal = ({ isActive, active, amount, duration }) => (
    <Modal
        isOpen={active}
        contentLabel="Help Modal"
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
                            Welcome to the Quiz!
                        </h2>
                        <button
                            type="button"
                            className="text-secondary hover:text-accent transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--neutral-200)]"
                            onClick={() => isActive(false)}
                        >
                            <SquareX className="w-8 h-8" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 space-y-6">
                        <p className="text-lg leading-7 text-secondary">
                            Welcome to your quiz activity! Here's what you need to know:
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                                <p className="text-base text-secondary">
                                    <span className="font-semibold text-accent">Questions:</span> You have {amount} questions to complete
                                </p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                                <p className="text-base text-secondary">
                                    <span className="font-semibold text-accent">Time Limit:</span> You have {duration} minutes to finish all questions
                                </p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                                <p className="text-base text-secondary">
                                    <span className="font-semibold text-accent">Answer Types:</span> Questions may be multiple choice, fill-in-the-blank, or drag-and-drop
                                </p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                                <p className="text-base text-secondary">
                                    <span className="font-semibold text-accent">Progress:</span> Track your progress with the progress bar at the top
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-[var(--neutral-200)] rounded-lg p-4 border border-primary">
                            <p className="text-base text-black">
                                <span className="font-semibold">💡 Tip:</span> Read each question carefully and select the best answer. You can change your answers before submitting!
                            </p>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-center p-8 border-t border-primary">
                        <button
                            type="button"
                            className="px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                            onClick={() => isActive(false)}
                        >
                            Let's Get Started!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
);

export default HelpModal;