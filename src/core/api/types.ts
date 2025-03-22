export interface GenericChatEvent<T extends string, D extends object> {
  type: T;
  data: D;
}

export interface StartOfReportEvent
  extends GenericChatEvent<"start_of_report", { report_id: string }> {}

export interface EndOfReportEvent
  extends GenericChatEvent<"end_of_report", { report_id: string }> {}

export interface StartOfWorkflowEvent
  extends GenericChatEvent<
    "start_of_workflow",
    { workflow_id: string; input: { content: string }[] }
  > {}

export interface EndOfWorkflowEvent
  extends GenericChatEvent<
    "end_of_workflow",
    { workflow_id: string; messages: { role: string; content: string }[] }
  > {}

export interface FinalSessionStateEvent
  extends GenericChatEvent<
    "final_session_state",
    { messages: { role: string; content: string }[] }
  > {}

export interface StartOfAgentEvent
  extends GenericChatEvent<
    "start_of_agent",
    { agent_id: string; agent_name: string }
  > {}

export interface EndOfAgentEvent
  extends GenericChatEvent<"end_of_agent", { agent_id: string }> {}

export interface ToolCallEvent
  extends GenericChatEvent<
    "tool_call",
    { tool_call_id: string; tool_name: string; tool_input: Record<string, any> }
  > {}

export interface ToolCallResultEvent
  extends GenericChatEvent<
    "tool_call_result",
    { tool_call_id: string; tool_result: string }
  > {}

export interface StartOfLLMEvent
  extends GenericChatEvent<"start_of_llm", { agent_name: string }> {}

export interface EndOfLLMEvent
  extends GenericChatEvent<"end_of_llm", { agent_name: string }> {}

export interface MessageEvent
  extends GenericChatEvent<
    "message",
    {
      message_id: string;
      delta: { content?: string; reasoning_content?: string };
    }
  > {}

export type ChatEvent =
  | StartOfReportEvent
  | EndOfReportEvent
  | StartOfWorkflowEvent
  | EndOfWorkflowEvent
  | StartOfAgentEvent
  | EndOfAgentEvent
  | FinalSessionStateEvent
  | ToolCallEvent
  | ToolCallResultEvent
  | StartOfLLMEvent
  | EndOfLLMEvent
  | MessageEvent;

export type TeamMember = {
  name: string;
  desc: string;
  is_optional: boolean;
};
