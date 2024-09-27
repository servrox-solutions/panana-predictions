
<div align="center" style="background-color: #ffcd0a;">
  <img src="./public/pp-preview-yellow.jpg" alt="Sublime's custom image" style="margin-bottom: -7px" />
</div>

## Panana Predictions

Panana Predictions is a **decentralized prediction market** platform built on the Aptos blockchain. Designed as a **Telegram app** for ease of use and to attract new users, it allows participants to predict future asset prices in a user-friendly environment.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
## Introduction

Panana Predictions is a decentralized platform that enables users to create their own markets and bet on the future prices of various assets. By offering a simple and engaging way for users to participate in prediction markets directly through Telegram, we aim to make decentralized finance accessible to everyone.

## Key Features

- **Decentralized Prediction Markets**: Participate in markets predicting future asset prices.
- **Marketplace and Market Move Modules**: Built for decentralized security, ensuring transparent and secure transactions.
- **State-of-the-Art Next.js Web App**: Provides an intuitive and seamless user interface.
- **Telegram Bot Integration**: Interact with Panana Predictions directly within Telegram for ease of use.
- **Automation**: A backend server responsible for creating and auto-resolving markets.
- **Reliable Price Feeds with Switchboard Oracles**: Ensures accurate and up-to-date asset price data.
- **User-Friendly Design**: Crafted by our expert UX designer for intuitive engagement.
- **Secure Smart Contracts**: Built on the Aptos blockchain for robust security.

## Project Information

Panana Predictions was built from the ground up exclusively for the **Aptos Code Collision Hackathon**. Within the hackathon period, we developed the entire platform, including smart contracts, web application, and Telegram integration. Our goal is to continue developing Panana Predictions beyond the hackathon, expanding its features and user base.

- **Commits**: Over 100 commits
- **Lines of Code**: Over 10,000 lines of code

## Tech Stack

Panana Predictions leverages a modern and robust tech stack to provide a seamless user experience:

- **Aptos Move**: Provides the decentralized platform for our smart contracts.
- **Next.js**: A state-of-the-art React framework for building the web application.
- **React**: For building interactive user interfaces.
- **TypeScript**: Ensuring type safety and code reliability.
- **Bun**: Powers the backend server.
- **Switchboard Oracles**: Used for fetching reliable asset price data.
- **Telegram Bot API**: Integrates the platform into Telegram for easy user access.

Our marketplace and market move modules are designed for decentralized security, ensuring that all transactions are transparent and secure.

## Architecture Overview

Panana Predictions consists of three fundamental parts:

### 1. Marketplace and Market Move Modules

At the heart of Panana Predictions are the **Marketplace** and **Market Move Modules**.

**Technical Details:**
- The **Marketplace Module** manages all markets for a specific asset (i.e. APT or BTC)
- The **Market Module** handles the interactions for placing bets, transferring assets, and distributing winnings based on market outcomes.
- Contracts are written in **Move**, a blockchain-specific programming language optimized for the Aptos ecosystem.
- All modules are designed in a way that allows an **easy extension** to add new Markets and asset types.
- **Switchboard Oracles** ensure a trusted and decentralized resolution of markets.

### 2. Telegram App & Web Application (Next.js)

To interact with the prediction markets, users access the platform via Telegram or the web. Built as a cutting-edge **Next.js** web application optimzed for mobile and desktop, the front-end provides a seamless and intuitive interface for users to:

- **Create new markets:** Every user can create new markets. 
- **Browse available markets:** See what prediction opportunities are currently open.
- **Place predictions:** Easily select and place a prediction on asset price movements.
- **Track market outcomes:** View the status of open and resolved markets.
- **Track personal success:** View personal statistics, such as how many markets a user has participated in.
- **Live Data:** All markets are showing live data from the Aptos blockchain.


### 3. Server for Auto-Resolving Markets

The third component is a **server** that is responsible for automatically resolving prediction markets when they close. The server polls for new markets and is responsible for their resolution. Once a market is created, the server:

- **Schedules the resolution**: The server schedules a new job to resolve the market at a specific time.

Once a market reaches its resolution time, the server:

- **Triggers market resolution:** The server calls the Market module to retrieve the final price data on-chain via a Switchboard Oracle and distribute the rewards.
- **Ensures eventual resolution:** By implementing a retry-mechanism in case the initial resolution failed, an eventual resolution is guaranteed.

### Architecture Diagram
The following diagram shows the interaction between all above mentioned components.
<div align="center">
  <img src="./public/pp-architecture.png" alt="Sublime's custom image" style="margin-bottom: -7px" />
</div>

## Installation and Setup

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/servrox-solutions/panana-predictions.git
   ```

2. Navigate into the directory:
   ```bash
   cd panana-predictions
   ```

3. Install dependencies for the Next.js web application:
   ```bash
   pnpm install
   ```

4. Publish the move package and make the types available (requires a pre-funded wallet)
   ```bash
   pnpm run move:publish && pnpm run move:types
   ```

5. Run the Next.js web application:
   ```bash
   pnpm run dev
   ```

6. Run the Next.js web application:
   ```bash
   npm run dev
   ```

7. Launch the server (requires bun):
   ```bash
   cd ./server && pnpm install && cd - && pnpm run server
   ```

## Usage

Once the platform is running:

1. Open the web app by navigating to `http://localhost:3000`.
2. Browse the available markets or create a new one.
3. Place your predictions on the future prices of various assets.
4. Track your predictions and see how the markets evolve in real-time.
5. Wait for the server to auto-resolve the markets and receive your rewards!

## Vision and Roadmap

Panana Predictions aims to become the leading prediction market platform on the Aptos blockchain, offering not only asset prices but real-world events, such as **sport events, elections, and many more**. Our future plans include:

- **Milestone 1 - Mainnet Launch (Q4 2024)**: Launch Panana on Aptos mainnet, allowing users to predict the prices of crypto assets with full WebApp and Telegram Bot functionality.
- **Milestone 2 - Expansion to Sports & Events (Q1 2025)**: Introduce prediction markets for live sports and other real-world events, using oracles for real-time data.
- **Milestone 3 - Community Market Creation (Q2 2025)**: Enable users to create custom prediction markets with community governance and advanced analytics.
- **Milestone 4 - Global Prediction Platform (Q3 2025+)**: Expand to a global platform supporting cross-chain betting, multi-currency markets, and a user reputation system.

## Team

Panana Predictions is built by a dedicated team with a diverse set of skills and extensive experience in software development, design, and blockchain technology.

- **Marcel Mayer**: With over 9 years of experience in software development and a strong track record in Customer Innovation and New Business at Porsche Digital, Marcel brings a wealth of expertise in software architecture, development, and blockchain technology.
- **Aaron Röhl**: With over 7 years of software engineering experience across various industries, Aaron specializes in infrastructure design for high scalability and availability. He has a proven track record of leading technological growth and winning multiple hackathons.
- **Marco Lechner**: The designer and UX artist behind Panana Predictions, Marco ensures that the user experience is intuitive and engaging.
- **Mr. Peeltos**: The mascot and spirit of Panana Predictions, Mr. Peeltos brings a fun and friendly face to our platform.

Our team's combined expertise makes us well-suited to build and sustain a prediction market platform on Aptos.

---

Thank you for using the Aptos Prediction Market! If you have any questions, feel free to open an issue or contribute to improving the platform.

<div align="center" style="background-color: #ffcd0a;">
  <img src="./public/brain.png" alt="Sublime's custom image" style="margin-bottom: -7px" />
</div>
