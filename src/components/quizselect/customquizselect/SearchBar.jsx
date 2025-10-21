import React from "react";

const SearchBar = ({ value, onChange, className = "" }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className={className}>
      Search:
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={handleChange}
        className="w-[150px] p-1 ml-1 text-black"
      />
    </label>
  );
};

export default SearchBar;