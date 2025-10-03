#!/usr/bin/env node
/* eslint-env node */

/**
 * Feat System Test Script
 * Tests the feat tracking functionality in the game engine.
 */

import { FeatTrackingSystem } from '../src/engine/featTracking.js';

console.log('Testing Feat Tracking System...\n');

// Create a new feat tracker
const featTracker = new FeatTrackingSystem();

// Simulate some game actions
console.log('Initial session stats:', featTracker.getSessionStats());
console.log('Completed feats:', featTracker.getCompletedFeats());
console.log();

// Simulate moves
console.log('Simulating 10 moves...');
featTracker.updateStats('moves', 10);
featTracker.checkFeats({}); // Mock state

// Simulate foundation moves  
console.log('Simulating 5 foundation moves...');
featTracker.updateStats('foundationMoves', 5);
featTracker.checkFeats({});

// Simulate aces played
console.log('Simulating 3 aces played...');
featTracker.updateStats('acesPlayed', 3);
featTracker.checkFeats({});

// Check what feats were completed
console.log('\nFinal session stats:', featTracker.getSessionStats());
console.log('Completed feats:', featTracker.getCompletedFeats());

console.log('\nFeat system test completed!');