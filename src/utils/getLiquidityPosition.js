import { ethers } from 'ethers';
import UniverselPair from '../abis/UniverselPair.json';

export async function getLiquidityPosition(pairAddress, userAddress, provider) {
  const pair = new ethers.Contract(pairAddress, UniverselPair, provider);

  const [balance, totalSupply, [reserve0, reserve1], token0, token1] = await Promise.all([
    pair.balanceOf(userAddress),
    pair.totalSupply(),
    pair.getReserves(),
    pair.token0(),
    pair.token1()
  ]);

  const share = balance.mul(ethers.constants.WeiPerEther).div(totalSupply);
  const amount0 = share.mul(reserve0).div(ethers.constants.WeiPerEther);
  const amount1 = share.mul(reserve1).div(ethers.constants.WeiPerEther);

  return {
    pairAddress,
    token0,
    token1,
    amount0: ethers.utils.formatUnits(amount0, 18),
    amount1: ethers.utils.formatUnits(amount1, 18),
    share: share.toString()
  };
}
