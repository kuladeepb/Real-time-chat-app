import { Check, CheckCheck, Heart } from 'lucide-react';
import { formatMessageTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isSelf = String(message.senderId) === String(user?._id);
  const [liked, setLiked] = useState(false);

  // Detect emoji-only messages for big rendering
  const isOnlyEmojis = (str) => {
    const trimmed = str.trim();
    const emojiRegex = /^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83d\udfff\ud83e\ud000-\ud83e\udfff\s]+$/;
    return emojiRegex.test(trimmed) && trimmed.length <= 8;
  };

  const emojiOnly = isOnlyEmojis(message.content);

  return (
    <div className={`flex w-full mb-1 group ${isSelf ? 'justify-end' : 'justify-start'}`}>

      {/* Wrapper with heart reaction on hover */}
      <div className={`flex items-end gap-1.5 max-w-[70%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Bubble */}
        <div className="relative">
          {emojiOnly ? (
            /* Emoji-only: just big text, no bubble */
            <div className="px-1 py-0.5">
              <p className="text-4xl leading-tight">{message.content}</p>
            </div>
          ) : isSelf ? (
            /* Self: Instagram blue gradient bubble */
            <div
              className="px-4 py-2 rounded-[22px] rounded-br-[4px] text-white text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3797F0, #0056cc)' }}
            >
              {message.content}
            </div>
          ) : (
            /* Other: light grey bubble */
            <div className="px-4 py-2 rounded-[22px] rounded-bl-[4px] bg-[#efefef] dark:bg-[#262626] text-[#262626] dark:text-[#f5f5f5] text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm">
              {message.content}
            </div>
          )}

          {/* Like heart reaction (hover) */}
          {!emojiOnly && (
            <button
              onClick={() => setLiked(!liked)}
              className={`absolute ${isSelf ? '-left-8' : '-right-8'} bottom-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1`}
              title="React with heart"
            >
              <Heart
                className={`h-4 w-4 transition-all duration-150 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-[#8e8e8e] hover:text-red-400'}`}
              />
            </button>
          )}
        </div>

        {/* Timestamp + read receipt (shown on hover or for self) */}
        <div className={`flex items-center gap-1 text-[10px] text-[#8e8e8e] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pb-0.5 ${isSelf ? 'flex-row-reverse' : ''}`}>
          <span className="whitespace-nowrap">{formatMessageTime(message.createdAt)}</span>

          {/* Read receipt — only for self-sent */}
          {isSelf && !emojiOnly && (
            <span>
              {message.readStatus === 'seen' ? (
                <CheckCheck className="h-3.5 w-3.5 text-[#3797F0]" />
              ) : message.readStatus === 'delivered' ? (
                <CheckCheck className="h-3.5 w-3.5 text-[#8e8e8e]" />
              ) : (
                <Check className="h-3.5 w-3.5 text-[#8e8e8e]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
