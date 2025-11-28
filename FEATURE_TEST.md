# Click-to-Elect Feature Test Guide

## Overview
This document describes how to test the new click-to-elect feature for the Bully Algorithm simulator.

## Test Scenarios

### 1. Basic Click-to-Elect
**Steps:**
1. Start the simulation (click play button)
2. Click on any active (green) node
3. Observe the election process

**Expected Results:**
- Clicked node glows gold briefly
- Election status appears in top-right showing "ELECTION (PX initiated)"
- ELECTION messages (gold) flow from clicked node to higher-ID nodes
- OK messages (orange, dashed) flow back from higher-ID nodes
- Cascading elections occur as higher processes start their own elections
- **The highest-numbered active node always becomes leader** (blue outline + star)
- COORDINATOR messages (blue) flow from the new leader to all other nodes

### 2. Click on Failed Node
**Steps:**
1. Toggle a node to failed state (red)
2. Try clicking on the failed node

**Expected Results:**
- No election starts
- Log message: "Cannot start election from failed Process PX"

### 3. Click During Ongoing Election
**Steps:**
1. Start an election (click a node or use Start Election button)
2. While election is in progress, click another node

**Expected Results:**
- No new election starts
- Log message: "Election already in progress - please wait"

### 4. Visual Feedback
**Steps:**
1. Hover over active nodes
2. Click on an active node

**Expected Results:**
- Hovered active nodes show green glow and "Click to start election" text
- Clicked nodes show gold glow for 1 second
- Election status banner shows which process initiated the election

### 5. Different Initiators
**Steps:**
1. Click on different nodes (P1, P3, P5, etc.)
2. Observe different election flows

**Expected Results:**
- Lower-ID nodes send more ELECTION messages (to all higher-ID nodes)
- Higher-ID nodes send fewer ELECTION messages
- **Regardless of initiator, the highest-numbered active node always becomes leader**
- Election shows cascading pattern as higher processes take over the election

## Animation Details

### Message Types and Colors:
- **ELECTION** (Gold): Sent from lower-ID to higher-ID processes
- **OK** (Orange, dashed): Sent from higher-ID to lower-ID processes
- **COORDINATOR** (Blue): Sent from new leader to all other processes
- **HEARTBEAT** (Green, ♥): Sent from leader every 2 seconds

### Visual Indicators:
- **Active nodes**: Green circles
- **Failed nodes**: Red circles
- **Leader**: Blue outline + star (★)
- **Hovered active nodes**: Green glow + instruction text
- **Clicked nodes**: Gold glow (1 second)
- **Election in progress**: Gold banner in top-right corner

## Performance Notes
- Elections have a 4-second timeout
- Messages are staggered for better visualization
- Multiple elections cannot run simultaneously
- System prevents elections from failed nodes