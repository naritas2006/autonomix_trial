import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

console.log("SEPOLIA_RPC:", process.env.ALCHEMY_API_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Loaded" : "Missing");

export default {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
