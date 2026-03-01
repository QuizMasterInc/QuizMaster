import React, { useState } from "react";
import cloudFunctionsAPI from "../../../services/api/cloudFunctions";
import { toast } from 'react-toastify';

/**
 * Delete button for a single custom quiz card.
 *
 * Props:
 * - quizId: Firestore document ID of the quiz to delete.
 * - creatorId: UID of the user who originally created the quiz.
 * - currentUserId: UID of the currently logged-in user.
 * - onDeleted: optional callback to let the parent know this quiz was successfully deleted.
 *
 * Behavior:
 * - Button only renders if currentUserId === creatorId (owner-only control).
 * - On click, confirms with the user, calls the deleteCustomQuiz Cloud Function,
 *   and then notifies the parent via onDeleted so the UI list can update.
 */

const DeleteQuizButton = ({ quizId, creatorId, currentUserId, onDeleted }) => {
    const [loading, setLoading] = useState(false);

  // Guard: only render the button for the quiz owner. Everyone else sees nothing.
    if (!currentUserId || currentUserId !== creatorId) {
    return null;
    }

    const handleDelete = async () => {
    // Ask for a final confirmation so deletes are intentional.
    const confirmed = window.confirm(
    "Are you sure you want to delete this quiz? This action cannot be undone."
    );
    if (!confirmed) return;

    // Perform the delete via the Cloud Function API and update local state.
    try {
        setLoading(true);

        await cloudFunctionsAPI.deleteCustomQuiz(quizId);

      // Inform the parent list that this quiz is gone so it can be removed from the UI.
        if (onDeleted) {
        onDeleted(quizId);
        }
    } catch (error) {
        console.error("Failed to delete quiz:", error);
        toast.error("Error deleting quiz. Please try again.");
    } finally {
      // Always clear the loading state, even if something failed.
        setLoading(false);
    }
    };

  // Owner-only delete button styled as a small, subtle control in the bottom-left of the card.
    return (
    <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="
            absolute bottom-2 left-2
            inline-block px-2 py-0.5
            bg-[var(--primary-400)]
            rounded-md font-medium text-xs
            transition-all duration-200 shadow-md
            hover:shadow-lg transform hover:scale-105
            border border-[var(--primary-500)]
            text-[var(--neutral-900)]
            disabled:opacity-60 disabled:cursor-not-allowed
        "
    >
        {loading ? "Deleting..." : "Delete"}
    </button>
    );
};

export default DeleteQuizButton;