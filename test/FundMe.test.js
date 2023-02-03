const { assert, expect } = require("chai")
const {deployments,getNamedAccounts,ethers}=require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip:describe("FundMe", function(){
    let fundMe,deployer,mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach( async ()=>{
        /**
         * @note The deployments.fixture() method is commonly used in smart contract testing frameworks and tools to simplify the deployment process
         */
         deployer=(await getNamedAccounts()).deployer
       await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe",deployer)
        mockV3Aggregator= await ethers.getContract("MockV3Aggregator",deployer)

    })
    describe("constructor", ()=>{
        it("set the aggregato address currectly",async()=>{
            const response= await fundMe.getPriceFeed()
            assert.equal(response,mockV3Aggregator.address)
        })

    })
    describe("FundMe Function", ()=>{
        it("Faile if doesnot send enough ETH",async()=>{
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
    })
    describe("Currectly update Data Structure",()=>{
        it("Successfully update amountFunded DS if deployer send fund",async()=>{
            await fundMe.fund({
                value: sendValue
            })
            const response= await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(),sendValue.toString())
        })
        it("Add funder addres to the array",async()=>{
            await fundMe.fund({
                value: sendValue
            })
           const response= await fundMe.getFunders(0)
           assert.equal(response,deployer)
        })
    })
    describe("Withdraw Function",()=>{
        beforeEach(async()=>{
            await fundMe.fund({
                value:sendValue
            })
        })
        it("withdraw ETH from Fund",async()=>{
            //arrange
            //contract blance
            const startingFundMeBlance=await fundMe.provider.getBalance(fundMe.address)
            const stratingDeployerBlance=await fundMe.provider.getBalance(deployer)
            //act
            const transactionResponse=await fundMe.cheaperWithdraw()
            const transctionReceipt= await transactionResponse.wait(1)
            const{effectiveGasPrice,gasUsed}=  transctionReceipt
            const gasCost=gasUsed.mul(effectiveGasPrice)

            const endingFundMeBlance= await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBlance=await fundMe.provider.getBalance(deployer)
            //assert
            assert.equal(endingFundMeBlance,0)
            assert.equal(startingFundMeBlance.add(stratingDeployerBlance).toString(),endingDeployerBlance.add(gasCost).toString())
        })
        it("it allow to use withdraw multiple funder",async()=>{
            const accounts= await ethers.getSigners()
            for(i=1;i<6;i++){
                const fundMeConnectedContract= await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance=await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance= await fundMe.provider.getBalance(deployer)
            const transactionResponse= await fundMe.cheaperWithdraw()
            const transctionReceipt= await transactionResponse.wait(1)
            const {effectiveGasPrice,gasUsed}=transctionReceipt
            const withdrawGasCost=gasUsed.mul(effectiveGasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${effectiveGasPrice}`)
          
            const endingDeployerBalance= await fundMe.provider.getBalance(deployer)
            assert.equal( startingFundMeBalance
                .add(startingDeployerBalance)
                .toString(),
            endingDeployerBalance.add(withdrawGasCost).toString())
            await expect(fundMe.getFunders(0)).to.be.reverted
            for(i=1;i<6;i++){
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }
        })
        it("only allows owner to withdraw",async()=>{
            const accounts=await ethers.getSigners()
           const fundMeConnectedAccount=await fundMe.connect(accounts[1])
            await expect(fundMeConnectedAccount.cheaperWithdraw()).to.be.reverted

        })


    })
})