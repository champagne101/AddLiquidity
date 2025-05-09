export function calculateExposureOverRange(position) {
    const { tickLower, tickUpper, liquidity } = position;
    const prices = [];
    const deltas = [];
  
    // Convert ticks to prices (simplified for illustration)
    const priceLower = Math.pow(1.0001, tickLower);
    const priceUpper = Math.pow(1.0001, tickUpper);
  
    const steps = 50;
    const stepSize = (priceUpper - priceLower) / steps;
  
    for (let i = 0; i <= steps; i++) {
      const price = priceLower + stepSize * i;
      const sqrtPrice = Math.sqrt(price);
      const sqrtPriceLower = Math.sqrt(priceLower);
      const sqrtPriceUpper = Math.sqrt(priceUpper);
  
      let amount0 = 0;
      let amount1 = 0;
  
      if (price <= priceLower) {
        amount0 = liquidity * (1 / sqrtPriceLower - 1 / sqrtPriceUpper);
      } else if (price < priceUpper) {
        amount0 = liquidity * (1 / sqrtPrice - 1 / sqrtPriceUpper);
        amount1 = liquidity * (sqrtPrice - sqrtPriceLower);
      } else {
        amount1 = liquidity * (sqrtPriceUpper - sqrtPriceLower);
      }
  
      const delta = amount0 - amount1 / price;
  
      prices.push(price.toFixed(2));
      deltas.push(delta);
    }
  
    return { prices, deltas };
  }
  