import { ethers } from 'ethers';
import NonfungiblePositionManagerABI from '../abis/NonfungiblePositionManager.json';

const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

export async function getUserPositions(walletAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const positionManager = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    provider
  );

  console.log(walletAddress)
  const balance = await positionManager.balanceOf(walletAddress);
  const positions = [];

  for (let i = 0; i < balance; i++) {
    const tokenId = await positionManager.tokenOfOwnerByIndex(walletAddress, i);
    const pos = await positionManager.positions(tokenId);
    positions.push({
      tokenId: tokenId.toString(),
      tickLower: pos.tickLower,
      tickUpper: pos.tickUpper,
      liquidity: pos.liquidity.toString(),
    });
  }

  return positions;
}
