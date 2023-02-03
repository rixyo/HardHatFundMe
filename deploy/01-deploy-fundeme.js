const { network } = require("hardhat")
const {networkConfig,developmentChains}=require("../helper-hardhat-config")
const {verify}=require("../utils/verify")
/**@note: getNamedAccounts typically returns an object containing the Ethereum addresses and their corresponding named accounts.
 * deployments is a term used in smart contract development to refer to the process of uploading a smart contract to the Ethereum blockchain.
 *  This process involves compiling the contract code into machine-readable bytecode,
 *  and then sending a transaction to the Ethereum network to deploy the contract
 */
module.exports=async ({
    getNamedAccounts,
    deployments,
})=>{
    const {deploy,log}=deployments
    const {deployer}=await getNamedAccounts()
    const chainId=network.config.chainId
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        /**@note:The deployments.get()
         *  method is used to retrieve an instance of a smart contract that has already been deployed to a particular network or environment,
         *  based on its name.  */
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        /**@note:Once you have the deployed instance of the contract, you can interact with it using 
         * its methods and properties, such as ethUsdPriceFeedAddress.address */
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    /**In summary, this code is deploying a smart contract named FundMe using the deploy() function,
     *  specifying the deployment account, constructor arguments, logging, and block confirmation options.*/
    const FundMe= await deploy("FundMe",{
        from: deployer,
        args:[ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    },
    )
    log(`FundMe deployed at ${FundMe.address}`)
    if(  !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY){
       await verify(FundMe.address,[ethUsdPriceFeedAddress])
    }
    
}
module.exports.tags=["all","FundMe"]