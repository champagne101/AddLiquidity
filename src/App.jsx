// src/App.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConnectWallet from './components/ConnectWallet';
import PositionList from './components/PositionList';
import ExposureChart from './components/ExposureChart';
import LiquidityPositions from './components/LiquidityPositions';
import { getUserPositions } from './utils/uniswap';
import './index.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const scrollProvider = new ethers.providers.JsonRpcProvider(
    'https://endpoints.omniatech.io/v1/scroll/sepolia/public',
    534351
  );

  useEffect(() => {
    let interval;
    if (walletAddress) {
      const fetchPositions = async () => {
        const pos = await getUserPositions(walletAddress);
        setPositions(pos);
        if (pos.length > 0) setSelectedPosition(pos[0]);
      };
      fetchPositions();
      interval = setInterval(fetchPositions, 30000);
    }
    return () => clearInterval(interval);
  }, [walletAddress]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">V3 LP Dashboard</h1>
      <ConnectWallet setWalletAddress={setWalletAddress} />

      {walletAddress && (
        <>
          <PositionList
            positions={positions}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
          />
          {selectedPosition && <ExposureChart position={selectedPosition} />}
          <LiquidityPositions
            userAddress={walletAddress}
            provider={scrollProvider}
            pairAddresses={[
              '0x7B49ECd2B4c3Cfe3dbB15CaeEC9CA971c6d50bF2',
              '0xF54bfD96bF95E647d53A594d848A9A3eAE44f268',
            ]}
          />
        </>
      )}
    </div>
  );
}

export default App;
