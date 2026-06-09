import { useChat } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Dashboard = () => {
  const { activeChat } = useChat();

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Sidebar — hidden on mobile when chat is active */}
      <div className={`h-full flex-shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[360px]`}>
        <Sidebar />
      </div>

      {/* Chat window — hidden on mobile when no active chat */}
      <div className={`h-full flex-1 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
        <ChatWindow />
      </div>
    </div>
  );
};

export default Dashboard;
