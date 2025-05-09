/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

 
function PositionList({ positions, selectedPosition, setSelectedPosition }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Your Positions</h2>
      <ul className="space-y-2">
        {positions.map((pos) => (
          <li
            key={pos.tokenId}
            onClick={() => setSelectedPosition(pos)}
            className={`p-2 border rounded cursor-pointer ${
              selectedPosition?.tokenId === pos.tokenId
                ? 'bg-blue-100'
                : 'bg-white'
            }`}
          >
            <p>
              <strong>Token ID:</strong> {pos.tokenId}
            </p>
            <p>
              <strong>Range:</strong> {pos.tickLower} - {pos.tickUpper}
            </p>
            <p>
              <strong>Liquidity:</strong> {pos.liquidity}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PositionList;
