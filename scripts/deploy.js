const hre = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts & variables
  const [ deployer ] = await ethers.getSigners()
  const NAME = 'Decord'
  const SYMBOL = 'DC'

  // Deploy contract
  const Decord = await ethers.getContractFactory('Decord');
  const decord = await Decord.deploy(NAME, SYMBOL)
  const decordAddress = await decord.getAddress();
  // await decord.deployed()

  console.log(`Deployed Decord Contract at: ${decordAddress}`)

  // Create 3 channels
  const CHANNEL_NAMES = ["Announcements", "Discussion", "Resources"]
  const COSTS = [tokens(0.20), tokens(0), tokens(0.10)]


  for(var i = 0; i < 3; i++) {
    const transaction = await decord.connect(deployer).createChannel(CHANNEL_NAMES[i], COSTS[i]);
    await transaction.wait()

    console.log(`Created text channel #${CHANNEL_NAMES[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
