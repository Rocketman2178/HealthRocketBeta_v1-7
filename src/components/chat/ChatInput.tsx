import React, {
  useState,
  useRef,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { Send, Image as ImageIcon, X, Check, XIcon } from "lucide-react";
import { ChatMessage } from "../../types/chat";
interface ChatInputProps {
  onSend: (content: string, mediaFile?: File) => void;
  isVerification?: boolean;
  replyMessage: ChatMessage;
  setReplyMessage: Dispatch<SetStateAction<ChatMessage>>;
  onVerificationChange?: (isVerification: boolean) => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  isVerification,
  replyMessage,
  setReplyMessage,
  onVerificationChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !mediaFile) return;

    // Pass the current verification state
    onSend(message, mediaFile || undefined);
    setMessage("");
    setMediaFile(null);
    setMediaPreview(null);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setMessage((prevMessage) => prevMessage + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Only image and video files are supported");
      return;
    }

    setMediaFile(file);

    // Create object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);

    // Clean up object URL when preview changes
    return () => URL.revokeObjectURL(previewUrl);
  };

  return (
    <form
      className="border-t border-gray-700 bg-gray-800"
      onSubmit={handleSubmit}
    >
      {/* Verification Checkbox */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={isVerification || false}
            onChange={(e) => onVerificationChange?.(e.target.checked)}
            className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
          />
          <span className="flex items-center gap-1 text-lime-500">
            <div className="w-4 h-4 rounded-full border border-lime-500 flex items-center justify-center">
              <Check size={12} className="text-lime-500" />
            </div>
            Verification Post
          </span>
        </label>
        <span className="text-xs text-gray-500">(Max 50MB)</span>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="relative w-32 h-32 mx-4 my-2">
          {mediaFile?.type.startsWith("image/") ? (
            <img
              src={mediaPreview}
              alt="Upload preview"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <video
              src={mediaPreview}
              className="w-full h-full object-contain rounded-lg"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setMediaFile(null);
              setMediaPreview(null);
              if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
              }
            }}
            className="absolute -top-2 -right-2 bg-gray-800 text-gray-400 hover:text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col">
        {replyMessage && (
          <div className="px-3 py-2 rounded-lg break-words relative border border-orange-500/20 bg-gray-800 text-white rounded-tr-none">
            <div className="flex gap-4 ">
              <div>
                <div className="text-xs text-orange-500 font-bold mb-1 cursor-pointer hover:underline">
                  {replyMessage?.user_name || ""}
                </div>
                <div className="text-sm">{replyMessage?.content || ""}</div>

                {/* Timestamp and Actions */}
                <div className={"flex items-center gap-2 mt-1"}>
                  <span className="text-[10px] text-gray-400">
                    {new Date(replyMessage?.createdAt || "").toLocaleString(
                      [],
                      {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </span>
                </div>
              </div>
              <XIcon onClick={()=>setReplyMessage(null)} className="cursor-pointer"/>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 p-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50"
            disabled={disabled}
          >
            <ImageIcon size={20} />
          </button>
          <textarea
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || (!message.trim() && !mediaFile)}
            className="p-2 text-orange-500 hover:text-orange-400 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </form>
  );
}
