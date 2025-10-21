import React from "react";

const PrivacyList = ({ value, onChange, className = "" }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className={className}>
      Display:
      <select
        name="listPrivacyFilter"
        value={value}
        onChange={handleChange}
        className="text-black ml-1 p-1"
      >
        <option value="All">All Quizzes</option>
        <option value="Public">Public Quizzes</option>
        <option value="Private">Private Quizzes</option>
      </select>
    </label>
  );
};

export default PrivacyList;