import React from 'react';

const DateFilter = ({ date, onChange }) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 ml-2">التاريخ:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-1 text-sm"
      />
    </div>
  );
};

export default DateFilter;
