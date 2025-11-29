import React from 'react';
import { jsPDF } from 'jspdf';

const DownloadQuiz = ({ questions, userAnswers, correctCount, category }) => {
  const handleDownload = () => {
    const doc = new jsPDF();
    const totalQuestions = questions.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(1);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to wrap text
    const wrapText = (text, maxWidth) => {
      return doc.splitTextToSize(text, maxWidth);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Quiz Results', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Category
    doc.setFontSize(16);
    doc.text(category, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Score and Date
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Score: ${correctCount}/${totalQuestions} (${percentage}%)`, margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Questions
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = question.correctAnswer;
      const isCorrect = (() => {
        if (!userAnswer) return false;
        const correctAns = String(correctAnswer).trim().toLowerCase();
        const userAns = Array.isArray(userAnswer)
          ? userAnswer.map(a => a.toLowerCase().trim())
          : [String(userAnswer).toLowerCase().trim()];

        if (question.type === 'multiple') {
          const correctAnswers = correctAns.split('||').map(a => a.trim().toLowerCase());
          return userAns.length === correctAnswers.length &&
          userAns.every(ans => correctAnswers.includes(ans));
        } else {
          return userAns[0] === correctAns;
        }
      })();

      // Check if we need a new page for this question
      checkPageBreak(40);

      // Question number and text
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      const questionLines = wrapText(`Question ${index + 1}: ${question.questionText}`, maxWidth);
      questionLines.forEach((line, i) => {
        if (i > 0) checkPageBreak(6);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 2;

      // User answer
      doc.setFont(undefined, 'normal');
      const userAnswerText = Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || 'No answer');
      const userAnswerLines = wrapText(`Your Answer: ${userAnswerText}`, maxWidth);
      userAnswerLines.forEach((line, i) => {
        if (i > 0) checkPageBreak(6);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Correct answer
      const correctAnswerLines = wrapText(`Correct Answer: ${correctAnswer}`, maxWidth);
      correctAnswerLines.forEach((line, i) => {
        if (i > 0) checkPageBreak(6);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Status with color
      doc.setFont(undefined, 'bold');
      if (isCorrect) {
        doc.setTextColor(0, 128, 0); // Green
        doc.text('✓ Correct', margin, yPosition);
      } else {
        doc.setTextColor(255, 0, 0); // Red
        doc.text('✗ Incorrect', margin, yPosition);
      }
      doc.setTextColor(0, 0, 0); // Reset to black
      yPosition += 6;

      // Options if available
      if (question.choices && question.choices.length > 0) {
        doc.setFont(undefined, 'italic');
        doc.setFontSize(9);
        const optionsLines = wrapText(`Options: ${question.choices.join(', ')}`, maxWidth);
        optionsLines.forEach((line, i) => {
          if (i > 0) checkPageBreak(5);
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
        doc.setFontSize(11);
      }

      // Divider line
      yPosition += 3;
      checkPageBreak(5);
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    });

    // Save the PDF
    doc.save(`${category}_quiz_results_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download Results
    </button>
  );
};

export default DownloadQuiz;

