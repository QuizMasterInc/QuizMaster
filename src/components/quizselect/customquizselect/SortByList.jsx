import React from "react";

const SortByList = ({ value, onChange, className = "" }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className={className}>
      Sort by:
      <select
        name="listSortMethod"
        value={value}
        onChange={handleChange}
        className="text-black ml-1 p-1"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title, A→Z</option>
        <option value="titleReverse">Title, Z→A</option>
        <option value="shortest">Shortest</option>
        <option value="longest">Longest</option>
      </select>
    </label>
  );
};

export default SortByList;