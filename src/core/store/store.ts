import { useEffect } from "react";
import { create } from "zustand";

import {
  type ChatEvent,
  chatStream,
  queryTeamMembers,
  type TeamMember,
} from "../api";
import { chatStream as mockChatStream } from "../api/mock";
import {
  type WorkflowMessage,
  type Message,
  type TextMessage,
} from "../messaging";
import { clone } from "../utils";
import { WorkflowEngine } from "../workflow";

export const useStore = create<{
  teamMembers: TeamMember[];
  enabledTeamMembers: string[];
  messages: Message[];
  responding: boolean;
  state: {
    messages: { role: string; content: string }[];
  };
}>(() => ({
  teamMembers: [],
  enabledTeamMembers: [],
  messages: [],
  responding: false,
  state: {
    messages: [],
  },
}));

export function useInitTeamMembers() {
  useEffect(() => {
    const enabledTeamMembers = localStorage.getItem(
      "langmanus.config.enabledTeamMembers",
    );
    void queryTeamMembers().then((teamMembers) => {
      useStore.setState({
        teamMembers,
        enabledTeamMembers: enabledTeamMembers
          ? JSON.parse(enabledTeamMembers)
          : teamMembers.map((member) => member.name),
      });
    });
  }, []);
}

export function setEnabledTeamMembers(enabledTeamMembers: string[]) {
  useStore.setState({ enabledTeamMembers });
  localStorage.setItem(
    "langmanus.config.enabledTeamMembers",
    JSON.stringify(enabledTeamMembers),
  );
}

export function addMessage(message: Message) {
  useStore.setState((state) => ({ messages: [...state.messages, message] }));
  return message;
}

export function updateMessage(message: Partial<Message> & { id: string }) {
  useStore.setState((state) => {
    const index = state.messages.findIndex((m) => m.id === message.id);
    if (index === -1) {
      return state;
    }
    const newMessage = clone({
      ...state.messages[index],
      ...message,
    } as Message);
    return {
      messages: [
        ...state.messages.slice(0, index),
        newMessage,
        ...state.messages.slice(index + 1),
      ],
    };
  });
}

export async function sendMessage(
  message: Message,
  params: {
    deepThinkingMode: boolean;
    searchBeforePlanning: boolean;
  },
  options: { abortSignal?: AbortSignal } = {},
) {
  addMessage(message);
  let stream: AsyncIterable<ChatEvent>;
  if (window.location.search.includes("mock")) {
    stream = mockChatStream(message);
  } else {
    stream = chatStream(
      message,
      useStore.getState().state,
      {
        ...params,
        teamMembers: useStore.getState().enabledTeamMembers,
      },
      options,
    );
  }
  setResponding(true);

  let textMessage: TextMessage | null = null;
  try {
    for await (const event of stream) {
      switch (event.type) {
        case "start_of_agent":
          textMessage = {
            id: event.data.agent_id,
            role: "assistant",
            type: "text",
            content: "",
          };
          addMessage(textMessage);
          break;
        case "final_session_state":
          _setWorkflowFinalState({
            messages: event.data.messages,
          });
          break;
        case "message":
          if (textMessage) {
            textMessage.content += event.data.delta.content;
            updateMessage({
              id: textMessage.id,
              content: textMessage.content,
            });
          }
          break;
        case "end_of_agent":
          textMessage = null;
          break;
        case "start_of_workflow":
          const workflowEngine = new WorkflowEngine();
          const workflow = workflowEngine.start(event);
          const workflowMessage: WorkflowMessage = {
            id: event.data.workflow_id,
            role: "assistant",
            type: "workflow",
            content: { workflow: workflow },
          };
          addMessage(workflowMessage);
          for await (const updatedWorkflow of workflowEngine.run(stream)) {
            updateMessage({
              id: workflowMessage.id,
              content: { workflow: updatedWorkflow },
            });
          }
          _setWorkflowFinalState({
            messages: workflow.finalState?.messages ?? [],
          });
          break;
        default:
          break;
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return;
    }
    throw e;
  } finally {
    setResponding(false);
  }
  return message;
}

export function clearMessages() {
  useStore.setState({ messages: [] });
}

export function setResponding(responding: boolean) {
  useStore.setState({ responding });
}

export function _setWorkflowFinalState(state: {
  messages: { role: string; content: string }[];
}) {
  useStore.setState({ state });
}
