import React, { useState } from "react";
import cloudFunctionsAPI from "../../../services/api/cloudFunctions";

/**
 * Delete button for a single custom quiz.
 * - Only renders if currentUserId === creatorId
 * - Calls Cloud Function: deleteCustomQuiz(quizId)
 */
const DeleteQuizButton = ({ quizId, creatorId, currentUserId, onDeleted }) => {
    const [loading, setLoading] = useState(false);


    // If user is not logged in or not the creator, hide the button completely
    if (!currentUserId || currentUserId !== creatorId) {
        return null;
    }


    const handleDelete = async () => {
        const confirmed = window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
        );
        if (!confirmed) return;

        try {
        setLoading(true);

        // Using API from cloudFunctions.js
        await cloudFunctionsAPI.deleteCustomQuiz(quizId);

        // Let the parent (QuizList) know this quiz is gone
        if (onDeleted) {
            onDeleted(quizId);
        }
        } catch (error) {
        console.error("Failed to delete quiz:", error);
        alert("Error deleting quiz. Please try again.");
        } finally {
        setLoading(false);
        }
    };

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