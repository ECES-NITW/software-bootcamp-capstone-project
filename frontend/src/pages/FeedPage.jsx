import useUser from '../hooks/useUser'
import HomePage from './HomePage'
import Chat from '../components/Chat'


function FeedPage() {

  return (
    <div>
      <h1>Feed</h1>
      <Chat />
    </div>
  )
}

export default FeedPage
