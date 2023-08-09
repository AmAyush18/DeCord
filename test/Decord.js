const { expect } = require('chai')

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether');
}

describe('Decord', () => {
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

    describe('Deployment', () => {
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

    describe('Joining Channels', () => {
        const ID = 1
        const AMOUNT = ethers. parseUnits('1', 'ether')

        beforeEach(async () => {
            const transaction = await decord.connect(user).mint(ID, { value: AMOUNT })
            await transaction.wait()
        })

        it('joins the user', async () => {
            const result = await decord.hasJoined(ID, user.address)
            expect(result).to.be.equal(true)
        })

        it('increases total Supply', async () => {
            const result = await decord.totalSupply()
            expect(result).to.be.equal(ID)
        })

        it('updates the contract balance', async () => {
            const result = await ethers.provider.getBalance(decord.getAddress())
            expect(result).to.be.equal(AMOUNT)
        }) 
    })

    describe('Withdrawing', () => {
        const ID = 1;
        const AMOUNT = ethers.parseUnits('10', 'ether')
        let balanceBefore

        beforeEach(async () => {
            balanceBefore = await ethers.provider.getBalance(deployer.address)

            let transaction = await decord.connect(user).mint(ID, { value: AMOUNT })
            await transaction.wait()

            transaction = await decord.connect(deployer).withdraw()
            await transaction.wait()
        })

        it('updates the owner balance', async () => {
            const balanceAfter = await ethers.provider.getBalance(deployer.address)
            expect(balanceAfter).to.be.greaterThan(balanceBefore)
        })

        it('updates the contract balance', async () => {
            const result = await ethers.provider.getBalance(decord.getAddress())
            expect(result).to.equal(0)
        })
    })
})
