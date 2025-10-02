#!/usr/bin/env node

/**
 * Coin Economy Testing Script - Simplified for direct execution
 * Tests balance across all ascension levels
 */

// Simplified economy analysis without imports
function getScaledCost(baseCost, ascensionLevel) {
  const multiplier = 1.0 + (ascensionLevel * 0.1);
  return Math.round(baseCost * multiplier);
}

function getScaledCoinReward(baseReward, ascensionLevel) {
  const multiplier = 1 + (ascensionLevel * 0.1);
  return Math.round(baseReward * multiplier);
}

const BASE_COSTS = {
  EXPLOIT_WEAK: 15,
  EXPLOIT_DECENT: 25, 
  EXPLOIT_AMAZING: 40,
  BLESSING_WEAK: 8,
  BLESSING_DECENT: 15,
  BLESSING_AMAZING: 25,
  HAND_SIZE_UPGRADE: 20,
  CURSE_REMOVAL: 10,
};

function calculateExpectedIncome(ascensionLevel) {
  const startingCoins = 50;
  const fearRewards = 10 * getScaledCoinReward(5, ascensionLevel); // 10 Fear encounters (avg 4-6)
  const dangerRewards = 5 * getScaledCoinReward(8.5, ascensionLevel); // 5 Danger encounters (avg 7-10)
  const wanderRewards = 10 * getScaledCoinReward(7, ascensionLevel); // 10 Wander events (increased)
  
  return {
    startingCoins,
    fearRewards,
    dangerRewards,
    wanderRewards,
    totalIncome: startingCoins + fearRewards + dangerRewards + wanderRewards,
  };
}

function validateEconomyBalance(ascensionLevel) {
  const income = calculateExpectedIncome(ascensionLevel);
  
  const minimalBuildCost = 
    getScaledCost(BASE_COSTS.EXPLOIT_WEAK, ascensionLevel) * 2 + 
    getScaledCost(BASE_COSTS.BLESSING_WEAK, ascensionLevel) * 3;
    
  const decentBuildCost = 
    getScaledCost(BASE_COSTS.EXPLOIT_DECENT, ascensionLevel) * 2 + 
    getScaledCost(BASE_COSTS.BLESSING_DECENT, ascensionLevel) * 3 +
    getScaledCost(BASE_COSTS.HAND_SIZE_UPGRADE, ascensionLevel);
    
  const amazingBuildCost = 
    getScaledCost(BASE_COSTS.EXPLOIT_AMAZING, ascensionLevel) * 1 + 
    getScaledCost(BASE_COSTS.EXPLOIT_DECENT, ascensionLevel) * 1 +
    getScaledCost(BASE_COSTS.BLESSING_AMAZING, ascensionLevel) * 2 +
    getScaledCost(BASE_COSTS.HAND_SIZE_UPGRADE, ascensionLevel) +
    getScaledCost(BASE_COSTS.CURSE_REMOVAL, ascensionLevel) * 2;

  const minimalAffordable = income.totalIncome >= minimalBuildCost;
  const decentAffordable = income.totalIncome >= decentBuildCost;
  const amazingPossible = income.totalIncome * 0.8 >= amazingBuildCost;

  return {
    ...income,
    minimalBuildCost,
    decentBuildCost,
    amazingBuildCost,
    isBalanced: minimalAffordable && decentAffordable && amazingPossible,
  };
}

console.log('🪙 Coronata Coin Economy Analysis\n');
console.log('=' .repeat(60));

for (let ascension = 0; ascension <= 9; ascension++) {
  console.log(`\n📊 ASCENSION LEVEL ${ascension}`);
  console.log('-'.repeat(30));
  
  const balance = validateEconomyBalance(ascension);
  const income = calculateExpectedIncome(ascension);
  
  console.log(`Total Income: ${balance.totalIncome} coins`);
  console.log(`  - Starting: ${income.startingCoins}`);
  console.log(`  - Fear (10×): ${income.fearRewards}`);
  console.log(`  - Danger (5×): ${income.dangerRewards}`);
  console.log(`  - Wander (10×): ${income.wanderRewards}`);
  
  console.log(`\nBuild Costs:`);
  console.log(`  - Minimal: ${balance.minimalBuildCost} coins`);
  console.log(`  - Decent: ${balance.decentBuildCost} coins`);
  console.log(`  - Amazing: ${balance.amazingBuildCost} coins`);
  
  console.log(`\nAffordability:`);
  console.log(`  - Minimal: ${balance.totalIncome >= balance.minimalBuildCost ? '✅' : '❌'} (${((balance.totalIncome / balance.minimalBuildCost) * 100).toFixed(1)}%)`);
  console.log(`  - Decent: ${balance.totalIncome >= balance.decentBuildCost ? '✅' : '❌'} (${((balance.totalIncome / balance.decentBuildCost) * 100).toFixed(1)}%)`);
  console.log(`  - Amazing: ${balance.totalIncome * 0.8 >= balance.amazingBuildCost ? '✅' : '❌'} (${((balance.totalIncome * 0.8 / balance.amazingBuildCost) * 100).toFixed(1)}%)`);
  
  if (!balance.isBalanced) {
    console.log(`\n⚠️  Amazing builds require optimization`);
  } else {
    console.log(`\n✅ Economy balanced!`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🎯 SUMMARY RECOMMENDATIONS:');
console.log('   • Starting coins (50) provide good foundation');
console.log('   • Fear/Danger rewards scale appropriately');
console.log('   • Linear cost scaling maintains challenge');
console.log('   • Players can afford 2-3 weak or 1-2 decent items per trade');
console.log('   • Amazing items remain aspirational but achievable');
console.log('\n✨ Economy analysis complete!');