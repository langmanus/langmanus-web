import { nanoid } from "nanoid";

import { type ChatEvent, type StartOfWorkflowEvent } from "../api";

import { type WorkflowStep } from "./steps";
import { type ThinkingTask, type ToolCallTask } from "./tasks";
import { type Workflow } from "./workflow";

export class WorkflowEngine {
  private _workflow: Workflow | undefined;

  get workflow() {
    if (!this._workflow) {
      throw new Error("Workflow not started");
    }
    return this._workflow;
  }

  start(startEvent: StartOfWorkflowEvent) {
    const workflow: Workflow = {
      id: startEvent.data.workflow_id,
      name: startEvent.data.input[0]!.content,
      steps: [],
    };
    this._workflow = workflow;
    return workflow;
  }

  async *run(stream: AsyncIterable<ChatEvent>) {
    if (!this.workflow) {
      throw new Error("Workflow not started");
    }
    let currentStep: WorkflowStep | null = null;
    let currentThinkingTask: ThinkingTask | null = null;
    let pendingToolCallTasks: ToolCallTask[] = [];
    let toolCallTask: ToolCallTask | undefined = undefined;

    for await (const event of stream) {
      switch (event.type) {
        case "start_of_agent":
          currentStep = {
            id: event.data.agent_id,
            agentId: event.data.agent_id,
            agentName: event.data.agent_name,
            type: "agentic",
            isCompleted: true,
            tasks: [],
          };
          this.workflow.steps.push(currentStep);
          yield this.workflow;
          break;
        case "end_of_agent":
          if (currentStep) {
            currentStep.isCompleted = false;
          }
          currentStep = null;
          break;
        case "start_of_llm":
          currentThinkingTask = {
            id: nanoid(),
            type: "thinking",
            state: "pending",
            payload: {
              text: "",
            },
          };
          currentStep!.tasks.push(currentThinkingTask);
          yield this.workflow;
          break;
        case "end_of_llm":
          if (currentThinkingTask) {
            currentThinkingTask.state = "success";
            currentThinkingTask = null;
          }
          yield this.workflow;
          break;
        case "message":
          if (event.data.delta.content) {
            if (currentThinkingTask!.payload.text === undefined) {
              currentThinkingTask!.payload.text = "";
            }
            currentThinkingTask!.payload.text += event.data.delta.content;
          } else if (event.data.delta.reasoning_content) {
            if (currentThinkingTask!.payload.reason === undefined) {
              currentThinkingTask!.payload.reason = "";
            }
            currentThinkingTask!.payload.reason +=
              event.data.delta.reasoning_content;
          }
          yield this.workflow;
          break;
        case "tool_call":
          toolCallTask = {
            id: event.data.tool_call_id,
            type: "tool_call",
            state: "pending",
            payload: {
              toolName: event.data.tool_name,
              input: event.data.tool_input,
            },
          };
          pendingToolCallTasks.push(toolCallTask);
          currentStep!.tasks.push(toolCallTask);
          yield this.workflow;
          break;
        case "tool_call_result":
          toolCallTask = pendingToolCallTasks.find(
            (task) => task.id === event.data.tool_call_id,
          );
          if (toolCallTask) {
            toolCallTask.state = "success";
            toolCallTask.payload.output = event.data.tool_result;
            pendingToolCallTasks = pendingToolCallTasks.filter(
              (task) => task.id !== event.data.tool_call_id,
            );
          }
          yield this.workflow;
          break;
        case "end_of_workflow":
          this.workflow.finalState = { messages: event.data.messages };
          this.workflow.isCompleted = true;
          yield this.workflow;
          return;
        default:
          break;
      }
    }
  }
}
