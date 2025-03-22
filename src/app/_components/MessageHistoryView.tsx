import Markdown from "react-markdown";

import { type Message } from "~/core/messaging";
import { cn } from "~/core/utils";

import { LoadingAnimation } from "./LoadingAnimation";
import { WorkflowProgressView } from "./WorkflowProgressView";

export function MessageHistoryView({
  className,
  messages,
  loading,
}: {
  className?: string;
  messages: Message[];
  loading?: boolean;
}) {
  return (
    <div className={cn(className)}>
      {messages.map((message) => (
        <MessageView key={message.id} message={message} />
      ))}
      {loading && <LoadingAnimation className="mt-8" />}
    </div>
  );
}

function MessageView({ message }: { message: Message }) {
  if (message.type === "text" && message.content) {
    return (
      <div className={cn("flex", message.role === "user" && "justify-end")}>
        <div
          className={cn(
            "relative mb-8 w-fit max-w-[560px] rounded-2xl px-4 py-3 shadow-xs",
            message.role === "user" && "rounded-ee-none bg-blue-500 text-white",
            message.role === "assistant" && "rounded-es-none bg-white",
          )}
        >
          <Markdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </Markdown>
        </div>
      </div>
    );
  } else if (message.type === "workflow") {
    return (
      <WorkflowProgressView
        className="mb-8 max-h-[400px] min-h-[400px] max-w-[928px] min-w-[928px]"
        workflow={message.content.workflow}
      />
    );
  }
  return null;
}
