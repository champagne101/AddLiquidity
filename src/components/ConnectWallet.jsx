/* eslint-disable react/prop-types */
import { useState } from 'react';
import { ethers } from 'ethers';
import UniverselPair from '../abis/UniverselPair.json';
import UniverselRouter from '../abis/UniverselRouter.json';

const pairAddress = '0xa4CbDF6CD523770D323A134330289A357f7A14bf';
const TOKEN_ADDRESS0 = '0x7B49ECd2B4c3Cfe3dbB15CaeEC9CA971c6d50bF2';
const TOKEN_ADDRESS1 = '0xF54bfD96bF95E647d53A594d848A9A3eAE44f268';
const ROUTER_ADDRESS = '0x2dD937c0c94c099F8C392686eCAD49210bCA102F';

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];

function ConnectWallet({ setWalletAddress }) {
  const [connectedAddress, setConnectedAddress] = useState('');
  const [balance0, setBalance0] = useState(null);
  const [balance1, setBalance1] = useState(null);
  const [symbol0, setSymbol0] = useState('');
  const [symbol1, setSymbol1] = useState('');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [lpShare, setLpShare] = useState(null);
  const [lpTokens, setLpTokens] = useState('');
  const [removalAmount, setRemovalAmount] = useState('');

  const [liquidityData, setLiquidityData] = useState(null);
  

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    setWalletAddress(address);
    setConnectedAddress(address);

    const token0 = new ethers.Contract(TOKEN_ADDRESS0, TOKEN_ABI, signer);
    const token1 = new ethers.Contract(TOKEN_ADDRESS1, TOKEN_ABI, signer);

    const [bal0, sym0] = await Promise.all([
      token0.balanceOf(address),
      token0.symbol(),
    ]);
    const [bal1, sym1] = await Promise.all([
      token1.balanceOf(address),
      token1.symbol(),
    ]);

    setBalance0(parseFloat(ethers.utils.formatUnits(bal0, 18)).toFixed(2));
    setBalance1(parseFloat(ethers.utils.formatUnits(bal1, 18)).toFixed(2));
    setSymbol0(sym0);
    setSymbol1(sym1);

    // Pair contract
          const pair = new ethers.Contract(pairAddress, UniverselPair, signer);
    
          const [lpBalance, totalSupply, reserves, token0Addr, token1Addr] = await Promise.all([
            pair.balanceOf(address),
            pair.totalSupply(),
            pair.getReserves(),
            pair.token0(),
            pair.token1(),
          ]);
    
          const share = lpBalance.mul(ethers.constants.WeiPerEther).div(totalSupply);
          const amount0 = share.mul(reserves[0]).div(ethers.constants.WeiPerEther);
          const amount1 = share.mul(reserves[1]).div(ethers.constants.WeiPerEther);
    
          setLiquidityData({
            lpBalance: ethers.utils.formatUnits(lpBalance, 18),
            totalSupply: ethers.utils.formatUnits(totalSupply, 18),
            reserves: {
              [token0Addr]: ethers.utils.formatUnits(reserves[0], 18),
              [token1Addr]: ethers.utils.formatUnits(reserves[1], 18),
            },
            token0: token0Addr,
            token1: token1Addr,
            amount0: ethers.utils.formatUnits(amount0, 18),
            amount1: ethers.utils.formatUnits(amount1, 18),
            share: (Number(share) / 1e18 * 100).toFixed(4) + '%',
          });

    await getLiquidityPosition(signer, address);
  };

  const getLiquidityPosition = async (signer, address) => {
    const pair = new ethers.Contract(pairAddress, UniverselPair, signer);
    const [balance, totalSupply, [reserve0, reserve1], reserves, token0Addr, token1Addr] = await Promise.all([
      pair.balanceOf(address),
      pair.totalSupply(),
      pair.getReserves()
    ]);

    if (totalSupply.isZero()) {
      setLpShare('0.00');
      setLpTokens('0.00');
      return;
    }

    const share = balance.mul(ethers.constants.WeiPerEther).div(totalSupply);
    const amount0 = share.mul(reserve0).div(ethers.constants.WeiPerEther);
    const amount1 = share.mul(reserve1).div(ethers.constants.WeiPerEther);

    setLiquidityData({
      balance: ethers.utils.formatUnits(balance, 18),
      totalSupply: ethers.utils.formatUnits(totalSupply, 18),
      reserves: {
        [token0Addr]: ethers.utils.formatUnits(reserves[0], 18),
        [token1Addr]: ethers.utils.formatUnits(reserves[1], 18),
      },
      token0: token0Addr,
      token1: token1Addr,
      amount0: ethers.utils.formatUnits(amount0, 18),
      amount1: ethers.utils.formatUnits(amount1, 18),
      share: (Number(share) / 1e18 * 100).toFixed(4) + '%',
    });

    setLpTokens(parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(4));
    setLpShare(parseFloat(ethers.utils.formatUnits(share, 18) * 100).toFixed(2));
  };

  const addLiquidity = async () => {
    console.log("deadline")
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const token0 = new ethers.Contract(TOKEN_ADDRESS0, TOKEN_ABI, signer);
    const token1 = new ethers.Contract(TOKEN_ADDRESS1, TOKEN_ABI, signer);
    const router = new ethers.Contract(ROUTER_ADDRESS, UniverselRouter, signer);

    const a0 = ethers.utils.parseUnits(amount0 || '0', 18);
    const a1 = ethers.utils.parseUnits(amount1 || '0', 18);
    console.log("hello")
    const [allowance0, allowance1] = await Promise.all([
      token0.allowance(address, ROUTER_ADDRESS),
      token1.allowance(address, ROUTER_ADDRESS),
    ]);
    console.log("hello")

    if (allowance0.lt(a0)) await (await token0.approve(ROUTER_ADDRESS, a0)).wait();
    if (allowance1.lt(a1)) await (await token1.approve(ROUTER_ADDRESS, a1)).wait();

    const deadline = Math.floor(Date.now() / 1000) + 600;
    console.log(deadline)
    await (await router.addLiquidity(
      TOKEN_ADDRESS0, TOKEN_ADDRESS1, a0, a1, 0, 0, address, deadline
    )).wait();

    await getLiquidityPosition(signer, address);
    alert('Liquidity added!');
  };

  const removeLiquidity = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const router = new ethers.Contract(ROUTER_ADDRESS, UniverselRouter, signer);
    const pair = new ethers.Contract(pairAddress, TOKEN_ABI, signer);
    const liquidity = ethers.utils.parseUnits(removalAmount || '0', 18);

    const allowance = await pair.allowance(address, ROUTER_ADDRESS);
    if (allowance.lt(liquidity)) {
      await (await pair.approve(ROUTER_ADDRESS, liquidity)).wait();
    }

    const deadline = Math.floor(Date.now() / 1000) + 600;

    await (await router.removeLiquidity(
      TOKEN_ADDRESS0,
      TOKEN_ADDRESS1,
      liquidity,
      0,
      0,
      address,
      deadline
    )).wait();

    await getLiquidityPosition(signer, address);
    alert('Liquidity removed!');
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-3)}` : '';

  return (
    <div className="flex flex-col items-start gap-4">
      <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow">
        {connectedAddress ? 'Connected' : 'Connect MetaMask'}
      </button>

      {connectedAddress && (
        <>
          <span className="text-sm text-gray-800">Address: {formatAddress(connectedAddress)}</span>
          <span className="text-sm text-gray-800">
            Balances: {balance0} {symbol0} | {balance1} {symbol1}
          </span>
          {lpShare && (
            <span className="text-sm text-green-700">
              LP Tokens: {lpTokens}, Share: {lpShare}%
            </span>
          )}

{liquidityData && (
            <div className="mt-2 text-sm text-gray-800 space-y-1">
              <div>LP Balance: {liquidityData.lpBalance}</div>
              <div>Total Supply: {liquidityData.totalSupply}</div>
              <div>Reserves:</div>
              <div> - Token0: {liquidityData.reserves[liquidityData.token0]}</div>
              <div> - Token1: {liquidityData.reserves[liquidityData.token1]}</div>
              <div>Your Pool Share: {liquidityData.share}</div>
              <div>Underlying: {liquidityData.amount0} + {liquidityData.amount1}</div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <input
              type="number"
              placeholder={`Amount ${symbol0}`}
              value={amount0}
              onChange={(e) => setAmount0(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder={`Amount ${symbol1}`}
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button onClick={addLiquidity} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Add Liquidity
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <input
              type="number"
              placeholder="LP Tokens to remove"
              value={removalAmount}
              onChange={(e) => setRemovalAmount(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button onClick={removeLiquidity} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Remove Liquidity
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ConnectWallet;
