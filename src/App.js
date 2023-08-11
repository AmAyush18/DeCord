import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { io } from "socket.io-client"

// Components
import Navigation from './components/Navigation'
import Servers from './components/Servers'
import Channels from './components/Channels'
import Messages from './components/Messages'

// ABIs
import Decord from './abis/Decord.json'

// Config
import config from './config.json';

// Socket
const socket = io('ws://localhost:3030');

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)

  const [decord, setDecord] = useState(null)
  const [channels, setChannels] = useState([])

  const [currentChannel, setCurrentChannel] = useState(null)
  const [messages, setMessages] = useState([])

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    
    const network = await provider.getNetwork()
    const decord = new ethers.Contract( config[network.chainId].Decord.address, Decord , provider)
    setDecord(decord)

    const totalChannels = await decord.totalChannels()
    const channels = []

    for(var i = 1; i <= totalChannels; i++){
      const channel = await decord.getChannel(i)
      channels.push(channel)
    }

    setChannels(channels)

    await window.ethereum.on( 'accountsChanged', async () => {
      window.location.reload();
    })
  }

  useEffect(() => {
    loadBlockchainData()

    socket.on("connect", () => {
      socket.emit('get messages')
    })

    socket.on('new message', (messages) => {
      setMessages(messages)
    })

    socket.on('get messages', (messages) => {
      setMessages(messages)
    })

    return () => {
      socket.off('connect')
      socket.off('new message')
      socket.off('get messages')
    }
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <main>
        <Servers />
        <Channels 
          provider={provider}
          account={account}
          decord={decord}
          channels={channels}
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
        />
        <Messages 
          account={account}
          messages={messages}
          currentChannel={currentChannel}
        />
      </main>
    </div>
  );
}

export default App;
