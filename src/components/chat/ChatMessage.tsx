import React, { useEffect, useState } from "react";
import {
  User,
  Check,
  Image as ImageIcon,
  Trash2,
  ReplyIcon,
} from "lucide-react";
import { useSupabase } from "../../contexts/SupabaseContext";
import { PlayerProfileModal } from "../dashboard/rank/PlayerProfileModal";
import type { ChatMessage as ChatMessageType } from "../../types/chat";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import { LeaderboardEntry } from "../../types/community";
import { getChatId } from "../../lib/utils/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  onDelete?: (message: ChatMessageType) => void;
  className?: string;
  challengeId: string | undefined;
  onReply?: (message: ChatMessageType) => void;
}

export function ChatMessage({
  message,
  onDelete,
  className,
  challengeId,
  onReply,
}: ChatMessageProps) {
  const { user } = useSupabase();
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [repliedToMessages, setRepliedToMessages] = useState<
    Map<string, ChatMessageType>
  >(new Map());
  const isOwnMessage = user?.id === message.userId;
  console.log("replied to message:", repliedToMessages);

  useEffect(() => {
    const fetchReplyMessage = async () => {
      const reply_to_id = message?.reply_to_id;
      if (reply_to_id) {
        // Fetch the replied message from Supabase
        const { data, error } = await supabase.rpc("get_challenge_message", {
          p_chat_id: getChatId(challengeId),
          p_message_id:reply_to_id
        });

        if (error) {
          console.error("Error fetching replied message:", error);
          return;
        }

        if (data) {
          // Update the Map with the new replied message
          setRepliedToMessages((prev) => {
            const newMap = new Map(prev); // Create a new Map from the previous state
            newMap.set(message.id, data[0] as ChatMessageType); // Set the replied message with the message.id as the key
            return newMap;
          });
        }
      } else {
        // If there's no reply_to_id, remove the entry from the Map
        setRepliedToMessages((prev) => {
          const newMap = new Map(prev); // Create a new Map from the previous state
          newMap.delete(message.id); // Remove the entry for this message.id
          return newMap;
        });
      }
    };

    fetchReplyMessage();
  }, [message?.reply_to_id, message.id]);
  // Get the replied message for the current message (if it exists)
  const currentRepliedMessage = repliedToMessages.get(message.id);
  const handleProfileClick = async (e: React.MouseEvent,replier:boolean) => {
    e.stopPropagation();
    const { data, error } = await supabase.rpc("test_challenge_players", {
      p_challenge_id: challengeId,
    });
    const mappedEntries: LeaderboardEntry[] = data.map((row) => ({
      userId: row.user_id,
      name: row.name,
      createdAt: row.created_at,
      level: row.level,
      burnStreak: row.burn_streak,
      avatarUrl: row.avatar_url,
      healthScore: Number(row.health_score),
      healthspanYears: Number(row.healthspan_years),
      plan: row.plan,
    }));

    // Set user's rank if they're in the list
    const userEntry = replier? mappedEntries.find(
      (entry) => entry.userId === message.userId
    ):mappedEntries.find((entry)=> entry?.userId === currentRepliedMessage?.user_id);
    setUserData(userEntry);
    setShowProfile(true);
  };

  // Handle "Reply" action
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1 mb-4", className)}>
      {/* Message Container */}
      <div
        className={cn(
          "flex items-end gap-2",
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar - only show for other users */}
        {!isOwnMessage &&
          (message.user_avatar_url ? (
            <img
              onClick={(e)=>handleProfileClick(e,true)}
              src={message.user_avatar_url}
              alt={message.user_name}
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
            />
          ) : (
            <div
              onClick={(e)=>handleProfileClick(e,true)}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
            >
              <User className="text-gray-400" size={16} />
            </div>
          ))}

        {/* Message Content */}
        <div className="max-w-[75%] space-y-1">
          {/* Content */}
          <div
            className={cn(
              "px-3 py-2 rounded-lg break-words relative border border-orange-500/20",
              isOwnMessage
                ? "bg-gray-800 text-white rounded-tr-none"
                : "bg-gray-700 text-white rounded-tl-none"
            )}
          >
            {currentRepliedMessage && (
              <div>
                {/* Name */}
                
                  <div
                    onClick={(e)=>handleProfileClick(e,false)}
                    className="text-xs text-orange-500 font-bold mb-1 cursor-pointer hover:underline"
                  >
                    {currentRepliedMessage?.user_name || "Unknown User"}
                  </div>
                

                {/* Media */}
                {currentRepliedMessage.mediaUrl && (
                  <div className="mt-2">
                    {repliedToMessage.mediaType === "image" ? (
                      <img
                        src={repliedToMessage.mediaUrl}
                        alt="Message attachment"
                        className="max-w-sm max-h-[200px] object-contain rounded-lg"
                        loading="lazy"
                      />
                    ) : repliedToMessage.mediaType === "video" ? (
                      <video
                        src={repliedToMessage.mediaUrl}
                        controls
                        className="max-w-sm max-h-[200px] object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ImageIcon size={16} />
                        <span>Media attachment</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-400">{currentRepliedMessage?.content}</div>
              </div>
            )}
            <div>
              {/* Verification Badge */}
              {message.isVerification && (
                <div
                  className={cn(
                    "absolute -top-2 right-2 bg-lime-500/20 text-lime-500 px-1.5 py-0.5 rounded text-[10px] font-medium",
                    isOwnMessage ? "-right-2" : "-left-2"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <Check size={10} />
                    <span>Verification</span>
                  </div>
                </div>
              )}

              {/* Name and Verification Badge */}
              {!isOwnMessage && (
                <div
                  onClick={(e)=>handleProfileClick(e,true)}
                  className="text-xs text-orange-500 font-bold mb-1 cursor-pointer hover:underline"
                >
                  {message.user_name || "Unknown User"}
                </div>
              )}

              {/* Media */}
              {message.mediaUrl && (
                <div className="mt-2">
                  {message.mediaType === "image" ? (
                    <img
                      src={message.mediaUrl}
                      alt="Message attachment"
                      className="max-w-sm max-h-[200px] object-contain rounded-lg"
                      loading="lazy"
                    />
                  ) : message.mediaType === "video" ? (
                    <video
                      src={message.mediaUrl}
                      controls
                      className="max-w-sm max-h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <ImageIcon size={16} />
                      <span>Media attachment</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm">{message.content}</div>
              {/* Reply Icon */}
              {!isOwnMessage && (
                <ReplyIcon onClick={handleReply} className="cursor-pointer" />
              )}
              {/* Timestamp and Actions */}
              <div
                className={cn(
                  "flex items-center gap-2 mt-1",
                  isOwnMessage ? "justify-end" : "justify-start"
                )}
              >
                <span className="text-[10px] text-gray-400">
                  {new Date(message.createdAt).toLocaleString([], {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
                {isOwnMessage && onDelete && (
                  <button
                    onClick={() => onDelete(message)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Player Profile Modal */}
      {showProfile && (
        <PlayerProfileModal
          player={{
            userId: userData.userId,
            name: userData?.name || "Unknown User",
            avatarUrl: userData?.avatarUrl ||"",
            level: userData?.level || 1,
            healthScore: userData?.healthScore || 7.8,
            healthspanYears: userData?.healthspanYears || 0,
            createdAt: userData?.createdAt || message.createdAt,
            plan: userData?.plan || "Pro Plan",
          }}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
