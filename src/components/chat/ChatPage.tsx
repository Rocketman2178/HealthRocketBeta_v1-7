import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft, Users } from "lucide-react";
import { getChatId } from "../../lib/utils/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatService } from "../../lib/chat/ChatService";
import { supabase } from "../../lib/supabase";
import type { ChatMessage as ChatMessageType } from "../../types/chat";
import type { LeaderboardEntry } from "../../types/community";
import { useSupabase } from "../../contexts/SupabaseContext";
import { ChallengePlayerList } from "./ChallengePlayerList";
import { PlayerProfileModal } from "../dashboard/rank/PlayerProfileModal";

export function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const challengeId = chatId?.startsWith("c_")
    ? chatId.replace("c_", "")
    : chatId;
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [replyMessage, setReplyMessage] = useState<ChatMessageType>();
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(
    null
  );
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isVerification, setIsVerification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const messageSubscriptionRef = useRef<{ unsubscribe: () => void }>();
  const { user } = useSupabase();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  // Redirect if not authenticated or missing challenge ID
  useEffect(() => {
    if (!loading && (!user || !challengeId)) {
      console.warn("Redirecting to home: missing user or challenge ID");
      navigate("/");
      return;
    }
  }, [user, loading, navigate, challengeId]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Get user's join date for this challenge
  useEffect(() => {
    if (!challengeId || !user) return;

    const getJoinDate = async () => {
      try {
        const { data } = await supabase
          .from("challenges")
          .select("started_at")
          .eq("challenge_id", challengeId)
          .eq("user_id", user.id)
          .single();

        if (data?.started_at) {
          setJoinDate(new Date(data.started_at));
        }
      } catch (err) {
        console.error("Error getting join date:", err);
      }
    };

    getJoinDate();
  }, [challengeId, user]);

  // Fetch initial messages
  const fetchMessages = async (retryCount = 0) => {
    if (!challengeId || !user) return;

    try {
      setError(null);
      setLoading(true);

      // Get player count
      const { data: count, error: countError } = await supabase.rpc(
        "get_challenge_players_count",
        { p_challenge_id: challengeId }
      );

      if (countError) throw countError;
      setPlayerCount(count || 0);

      // Get messages
      const { data: messages, error } = await supabase.rpc(
        "get_challenge_messages",
        {
          p_chat_id: getChatId(challengeId),
        }
      );

      if (error) throw error;

      // Transform messages to match ChatMessage type
      const transformedMessages =
        messages
          ?.map((msg) => ({
            id: msg.id,
            chatId: msg.chat_id || `c_${chatId}`,
            userId: msg.user_id || user.id,
            content: msg.content,
            mediaUrl: msg.media_url,
            mediaType: msg.media_type,
            isVerification: msg.is_verification,
            reply_to_id: msg.reply_to_id,
            createdAt: new Date(msg.created_at),
            updatedAt: new Date(msg.updated_at),
            user_name: msg.user_name,
            user_avatar_url: msg.user_avatar_url,
          }))
          // Filter messages to only show those within 3 days before join date or after
          .filter((msg) => {
            if (!joinDate) return true;
            const messageDate = new Date(msg.createdAt);
            const cutoffDate = new Date(joinDate);
            cutoffDate.setDate(cutoffDate.getDate() - 3);
            return messageDate >= cutoffDate;
          }) || [];

      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch messages")
      );

      // Retry logic
      if (retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          fetchMessages(retryCount + 1);
        }, retryDelay * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [chatId, user]);

  // Fetch players when player list is opened
  const fetchPlayers = async () => {
    if (!chatId || !user) return;
    const challengeId = chatId.replace("c_", "");
    setLoading(true);

    try {
      // Use the test_challenge_players function
      const { data: userData, error } = await supabase.rpc(
        "test_challenge_players",
        {
          p_challenge_id: challengeId,
        }
      );

      if (error) throw error;

      if (!userData?.length) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      // Map results to LeaderboardEntry format
      const mappedPlayers: LeaderboardEntry[] = userData.map((user: any) => ({
        userId: user.user_id,
        name: user.name,
        avatarUrl: user.avatar_url,
        level: user.level,
        plan: user.plan,
      }));

      setPlayers(mappedPlayers);
    } catch (err) {
      console.error("Error fetching players:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch players when opening player list
  useEffect(() => {
    if (showPlayerList) {
      fetchPlayers();
    }
  }, [showPlayerList]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user || !chatId) return;
    messageSubscriptionRef.current = ChatService.subscribeToMessages(
      `c_${chatId}`,
      (message) => {
        setMessages((prev) => [...prev, message]);
      }
    );

    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe();
      }
    };
  }, [chatId, user]);

  // Update read status when window is focused
  useEffect(() => {
    if (!user || !chatId) return;

    const updateReadStatus = () => {
      ChatService.updateReadStatus(user.id, chatId);
    };

    // Update on mount and window focus
    updateReadStatus();
    window.addEventListener("focus", updateReadStatus);

    return () => {
      window.removeEventListener("focus", updateReadStatus);
    };
  }, [chatId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      const messageEnd = messagesEndRef.current;
      if (messageEnd) {
        // Use instant scroll for initial load
        const behavior = loading ? "auto" : "smooth";
        messageEnd.scrollIntoView({ behavior, block: "end" });

        // Double-check scroll position after a short delay
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          messageEnd.scrollIntoView({ behavior: "auto", block: "end" });
        }, 150);
      }
    };

    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string, mediaFile?: File) => {
    if (!user || !chatId) return;

    const now = new Date();
    try {
      // Create optimistic message
      const optimisticMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        chatId: getChatId(challengeId),
        userId: user.id,
        content,
        isVerification,
        reply_to_id: replyMessage?.id,
        createdAt: now,
        updatedAt: now,
        user_name: user.user_metadata?.name || user.email,
        user_avatar_url: user.user_metadata?.avatar_url,
        mediaUrl: undefined,
        mediaType: undefined,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      let mediaUrl;
      let mediaType;

      if (mediaFile) {
        // Upload media file
        const path = `${user.id}/c_${chatId}/${Date.now()}_${mediaFile.name}`;
        const { data: uploadData, error } = await ChatService.uploadMedia(
          path,
          mediaFile
        );
        if (error) throw error;
        mediaUrl = uploadData.publicUrl;
        mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";
      }
      // Send message through ChatService
      await ChatService.sendMessage(
        user.id,
        content,
        getChatId(challengeId),
        replyMessage?.id,
        isVerification,
        mediaUrl,
        mediaType
      );

      // Update optimistic message with media info if needed
      if (mediaUrl) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, mediaUrl, mediaType }
              : msg
          )
        );
      }

      setIsVerification(false); // Reset verification flag after sending
      setReplyMessage(null);
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setReplyMessage(null);
    }
  };

  const handleDelete = async (message: ChatMessageType) => {
    if (!user) return;
    try {
      await ChatService.deleteMessage(user.id, message.id);
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };
  const handleReply = (message: ChatMessageType) => {
    // Create a new reply message object
    const replyMessage: ChatMessageType = {
      id: message?.id,
      content: `Replying to: ${message.content}`,
      user_name: message?.user_name,
      createdAt: message?.createdAt,
      reply_to_id: message?.reply_to_id,
      isVerification: message?.isVerification,
      chatId: message?.chatId,
      userId: message?.userId,
      updatedAt: message?.updatedAt,
    };
    setReplyMessage(replyMessage);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle className="text-orange-500" size={20} />
                <h1 className="text-lg font-semibold text-white">
                  Challenge Chat
                </h1>
                <button
                  onClick={() => setShowPlayerList(true)}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Users size={14} />
                  <span>{playerCount} Players</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex-1">
        <div className="bg-gray-800/80 rounded-lg shadow-xl">
          <div className="h-[calc(100vh-13rem)] overflow-y-auto p-4 space-y-4 flex flex-col bg-gray-600/20">
            <div className="flex-1" />
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-red-400 mb-4">{error.message}</p>
                <button
                  onClick={() => fetchMessages()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageCircle className="mx-auto mb-2" size={24} />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onDelete={handleDelete}
                  challengeId={challengeId}
                  onReply={handleReply}
                />
              ))
            )}
            <div ref={messagesEndRef} className="h-0" />
          </div>

          {/* Input */}
          <ChatInput
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            onSend={handleSend}
            isVerification={isVerification}
            onVerificationChange={setIsVerification}
            disabled={loading}
          />
        </div>
      </div>

      {showPlayerList && (
        <ChallengePlayerList
          players={players}
          loading={loading}
          onClose={() => setShowPlayerList(false)}
          onPlayerSelect={(player) => {
            setSelectedPlayer(player);
            setShowPlayerList(false);
          }}
        />
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
