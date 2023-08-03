const { expect } = require('chai')

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether');
}

describe('Decord', function() {
    let decord
    let deployer, user 

    const NAME = 'Decord'
    const SYMBOL = 'DC'

    beforeEach(async () => {
        // Setup accounts
        [deployer, user] = await ethers.getSigners()

        // Deploy contract
        const Decord = await ethers.getContractFactory('Decord');
        decord = await Decord.deploy(NAME, SYMBOL)

        // Create a channel
        const transaction = await decord.connect(deployer).createChannel('general', tokens(1));
        await transaction.wait()
    })

    describe('Deployment', function () {
        it('sets the name & symbol', async () => {
            // Fetch name
            let result = await decord.name()
            // Check name
            expect(result).to.equal(NAME)
        })
        
        it('sets the symbol', async () => {
            // Fetch symbol
            let result = await decord.symbol()
            // Check symbol
            expect(result).to.equal(SYMBOL)
        })

        it('sets the owner', async () => {
            let result = await decord.owner()
            expect(result).to.equal(deployer.address)
        })
    })

    describe('Creating Channels', () => {
        it('returns total channels', async () => {
            const result = await decord.totalChannels()
            expect(result).to.be.equal(1)
        })

        it('return channels attribute', async () => {
            const channel = await decord.getChannel(1);
            expect(channel.id).to.be.equal(1)
            expect(channel.name).to.be.equal('general')
            expect(channel.cost).to.be.equal(tokens(1))
        })
    })

})
