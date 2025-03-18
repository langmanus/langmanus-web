import { ArrowUpOutlined, GlobalOutlined } from "@ant-design/icons";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { Atom } from "~/core/icons";
import { cn } from "~/core/utils";

export function InputBox({
  className,
  size,
  responding,
  onSend,
  onCancel,
}: {
  className?: string;
  size?: "large" | "normal";
  responding?: boolean;
  onSend?: (
    message: string,
    options: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => void;
  onCancel?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto adjust height function
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (capped at ~5 lines)
    const maxHeight = size === "large" ? 256 : 128; // 32px * 8 for large, 32px * 4 for normal
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
  }, [size]);

  // Adjust height on content change
  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  const saveConfig = useCallback(() => {
    localStorage.setItem(
      "langmanus.config.inputbox",
      JSON.stringify({ deepThinkingMode, searchBeforePlanning }),
    );
  }, [deepThinkingMode, searchBeforePlanning]);
  useEffect(() => {
    const config = localStorage.getItem("langmanus.config.inputbox");
    if (config) {
      const { deepThinkingMode, searchBeforePlanning } = JSON.parse(config);
      setDeepThinkMode(deepThinkingMode);
      setSearchBeforePlanning(searchBeforePlanning);
    }
  }, []);
  useEffect(() => {
    saveConfig();
  }, [deepThinkingMode, searchBeforePlanning, saveConfig]);
  const handleSendMessage = useCallback(() => {
    if (responding) {
      onCancel?.();
    } else {
      if (message.trim() === "") {
        return;
      }
      if (onSend) {
        onSend(message, { deepThinkingMode, searchBeforePlanning });
        setMessage("");
      }
    }
  }, [
    responding,
    onCancel,
    message,
    onSend,
    deepThinkingMode,
    searchBeforePlanning,
  ]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (responding) {
        return;
      }
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        imeStatus === "inactive"
      ) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [responding, imeStatus, handleSendMessage],
  );
  return (
    <div className={cn(className)}>
      <div className="w-full">
        <textarea
          ref={textareaRef}
          className={cn(
            "m-0 w-full resize-none border-none px-4 py-3 text-lg transition-[height] duration-200 ease-in-out",
            size === "large" ? "min-h-32" : "min-h-4",
            "max-h-[128px] overflow-y-auto",
            size === "large" && "max-h-[256px]"
          )}
          placeholder="What can I do for you?"
          value={message}
          onCompositionStart={() => setImeStatus("active")}
          onCompositionEnd={() => setImeStatus("inactive")}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
      </div>
      <div className="flex items-center px-4 py-2">
        <div className="flex flex-grow items-center gap-2">
          <button
            className={cn(
              "flex h-8 items-center gap-2 rounded-2xl border px-4 text-sm transition-shadow hover:shadow",
              deepThinkingMode
                ? "border-primary bg-primary/15 text-primary"
                : "text-button hover:bg-button-hover hover:text-button-hover",
            )}
            onClick={() => {
              setDeepThinkMode(!deepThinkingMode);
            }}
          >
            <Atom className="h-4 w-4" />
            <span>Deep Think</span>
          </button>
          <button
            className={cn(
              "flex h-8 items-center rounded-2xl border px-4 text-sm transition-shadow hover:shadow",
              searchBeforePlanning
                ? "border-primary bg-primary/15 text-primary"
                : "text-button hover:bg-button-hover hover:text-button-hover",
            )}
            onClick={() => {
              setSearchBeforePlanning(!searchBeforePlanning);
            }}
          >
            <GlobalOutlined className="h-6 w-6" />
            <span>Search</span>
          </button>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            className={cn(
              "h-10 w-10 rounded-full text-button transition-shadow hover:bg-button-hover hover:text-button-hover hover:shadow",
              responding ? "bg-button-hover" : "bg-button",
            )}
            title={responding ? "Cancel" : "Send"}
            onClick={handleSendMessage}
          >
            {responding ? (
              <div className="flex h-10 w-10 items-center justify-center">
                <div className="h-4 w-4 rounded bg-red-300" />
              </div>
            ) : (
              <ArrowUpOutlined />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
