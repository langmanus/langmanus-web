import {
  ArrowUpOutlined,
  GlobalOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Atom } from "~/core/icons";
import { setEnabledTeamMembers, useStore } from "~/core/store";
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
  const teamMembers = useStore((state) => state.teamMembers);
  const enabledTeamMembers = useStore((state) => state.enabledTeamMembers);

  const [message, setMessage] = useState("");
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");

  const saveConfig = useCallback(() => {
    localStorage.setItem(
      "langmanus.config.inputbox",
      JSON.stringify({ deepThinkingMode, searchBeforePlanning }),
    );
  }, [deepThinkingMode, searchBeforePlanning]);

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

  return (
    <div className={cn(className)}>
      <div className="w-full">
        <textarea
          className={cn(
            "m-0 w-full resize-none border-none px-4 py-3 text-lg",
            size === "large" ? "min-h-32" : "min-h-4",
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
        <div className="flex grow items-center gap-2">
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("rounded-2xl px-4 text-sm", {
                      "border-blue-300 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600":
                        true,
                    })}
                  >
                    <RobotOutlined className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Agents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teamMembers.map((member) => (
                  <Tooltip key={member.name}>
                    <TooltipTrigger asChild>
                      <DropdownMenuCheckboxItem
                        key={member.name}
                        disabled={!member.is_optional}
                        checked={enabledTeamMembers.includes(member.name)}
                        onCheckedChange={() => {
                          setEnabledTeamMembers(
                            enabledTeamMembers.includes(member.name)
                              ? enabledTeamMembers.filter(
                                  (name) => name !== member.name,
                                )
                              : [...enabledTeamMembers, member.name],
                          );
                        }}
                      >
                        {member.name.charAt(0).toUpperCase() +
                          member.name.slice(1)}
                        {member.is_optional && (
                          <span className="text-xs text-gray-400">
                            (Optional)
                          </span>
                        )}
                      </DropdownMenuCheckboxItem>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{member.desc}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              <p>Enable or disable agents</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn("rounded-2xl px-4 text-sm", {
                  "border-blue-300 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600":
                    deepThinkingMode,
                })}
                onClick={() => {
                  setDeepThinkMode(!deepThinkingMode);
                }}
              >
                <Atom className="h-4 w-4" />
                <span>Deep Think</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Deep thinking mode. Think before planning.
                <br />
                <br />
                <span className="text-xs text-gray-300">
                  This feature may cost more tokens and time.
                </span>
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn("rounded-2xl px-4 text-sm", {
                  "border-blue-300 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600":
                    searchBeforePlanning,
                })}
                onClick={() => {
                  setSearchBeforePlanning(!searchBeforePlanning);
                }}
              >
                <GlobalOutlined className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search before planning</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  responding ? "bg-button-hover" : "bg-button",
                )}
                onClick={handleSendMessage}
              >
                {responding ? (
                  <div className="flex h-10 w-10 items-center justify-center">
                    <div className="h-4 w-4 rounded-sm bg-red-300" />
                  </div>
                ) : (
                  <ArrowUpOutlined />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{responding ? "Stop" : "Send"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
