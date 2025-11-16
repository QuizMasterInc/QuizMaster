/**
 * Custom hook for managing quiz form state (metadata)
 */

import { useState, useEffect } from 'react';
import { tagsToString } from '../utils/tagProcessor';

export const useQuizForm = (initialTags = []) => {
  const [quizName, setQuizName] = useState('');
  const [privateQuiz, setPrivateQuiz] = useState(false);
  const [privateQuizPassword, setPrivateQuizPassword] = useState('');
  const [quizTags, setQuizTags] = useState([]);
  const [rawTagsInput, setRawTagsInput] = useState('');
  const [teacherQuiz, setTeacherQuiz] = useState(false);

  // Initialize raw tags input from existing quizTags
  useEffect(() => {
    if (initialTags.length > 0) {
      setRawTagsInput(tagsToString(initialTags));
      setQuizTags(initialTags);
    }
  }, []); // Only run on mount

  // Reset password when switching from private to public
  useEffect(() => {
    if (!privateQuiz) {
      setPrivateQuizPassword('');
    }
  }, [privateQuiz]);

  const handlePrivateQuizChange = (isPrivate) => {
    if (!teacherQuiz) {
      setPrivateQuiz(isPrivate);
    }
  };

  const handleTeacherQuizChange = (isTeacher) => {
    setTeacherQuiz(isTeacher);
    if (isTeacher) {
      setPrivateQuiz(true);
      // Allow teachers to set their own password
      if (!privateQuizPassword || privateQuizPassword === 'teacherOnly') {
        setPrivateQuizPassword('');
      }
    } else {
      setPrivateQuiz(false);
      setPrivateQuizPassword('');
    }
  };

  return {
    // State
    quizName,
    privateQuiz,
    privateQuizPassword,
    quizTags,
    rawTagsInput,
    teacherQuiz,

    // Setters
    setQuizName,
    setPrivateQuiz,
    setPrivateQuizPassword,
    setQuizTags,
    setRawTagsInput,
    setTeacherQuiz,

    // Handlers
    handlePrivateQuizChange,
    handleTeacherQuizChange
  };
};
