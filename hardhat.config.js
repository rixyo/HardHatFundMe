require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY=process.env.PRIVATE_KEY || " ";
const GOERLI_RPC_URL=process.env.GOERLI_RPC_URL|| " ";
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY||"";
const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY;
module.exports = {
  defaultNetwork: "hardhat",
  networks:{
    hardhat:{
      chainId:31337,
    },
    goerli:{
      url:GOERLI_RPC_URL,
      chainId:5,
      accounts:[PRIVATE_KEY],
      blockConfirmatons:6,
    },
  },
  solidity: {
    compilers: [
        {
            version: "0.8.9",
        },
        {
            version: "0.6.6",
        },
        {
          version: "0.8.0"
        }
    ],
},
  etherscan:{
    apiKey:ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
},
  namedAccounts:{
    deployer:{
      default:0,
      1:0,
    },
  },
  mocha:{
    timeout: 500000,
  },
 
};
