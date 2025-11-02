const FilterSelect = ({
  type,
  label,
  value,
  onChange,
  options = [],
  placeholder = "",
  className = "",
  inputClassName = "text-black ml-1 p-1",
  selectName = ""
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className={className}>
      {label}
      {type === 'search' ? (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={inputClassName}
        />
      ) : (
        <select
          name={selectName}
          value={value}
          onChange={handleChange}
          className={inputClassName}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </label>
  );
};

export default FilterSelect;