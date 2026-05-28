import React from 'react';

const Highlights = () => {
  return (
    <div className=" cursor-pointer flex gap-6 justify-start px-10 mt-12">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full border flex items-center justify-center text-3xl">
          +
        </div>
        <p className="text-sm">New</p>
      </div>
    </div>
  );
};

export default Highlights;
