/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { getLiquidityPosition } from '../utils/getLiquidityPosition';
import { ethers } from 'ethers';

const LiquidityPositions = ({ userAddress, provider, pairAddresses }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const loadPositions = async () => {
      const data = await Promise.all(
        pairAddresses.map((pair) => getLiquidityPosition(pair, userAddress, provider))
      );
      setPositions(data);
    };

    if (userAddress && provider) {
      loadPositions();
    }
  }, [userAddress, provider, pairAddresses]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Your Liquidity Positions</h2>
      {positions.map((pos, idx) => (
        <div key={idx} className="border p-4 mb-2 rounded-md bg-gray-100">
          <p>Pair: {pos.token0} / {pos.token1}</p>
          <p>Amount Token0: {pos.amount0}</p>
          <p>Amount Token1: {pos.amount1}</p>
          <p>Share: {ethers.utils.formatUnits(pos.share, 18)}</p>
        </div>
      ))}
    </div>
  );
};

export default LiquidityPositions;
