import { type Workflow } from "../workflow";

// Define the structure for saved workflow entries
export interface SavedWorkflow {
  id: string;
  name: string;
  timestamp: number;
  workflow: Workflow;
}

// Key for localStorage
const SAVED_WORKFLOWS_KEY = "langmanus.saved.workflows";

/**
 * Save a workflow to localStorage
 * If a workflow with the same ID already exists, it will be updated
 */
export function saveWorkflow(workflow: Workflow): void {
  // Get existing saved workflows
  const savedWorkflows = getSavedWorkflows();
  
  // Create a new saved workflow entry
  const savedWorkflow: SavedWorkflow = {
    id: workflow.id,
    name: workflow.name,
    timestamp: Date.now(),
    workflow,
  };
  
  // Check if a workflow with the same ID already exists
  const existingIndex = savedWorkflows.findIndex((sw) => sw.id === workflow.id);
  
  if (existingIndex !== -1) {
    // Update the existing workflow
    savedWorkflows[existingIndex] = savedWorkflow;
  } else {
    // Add to the list of saved workflows
    savedWorkflows.push(savedWorkflow);
  }
  
  // Save back to localStorage
  localStorage.setItem(SAVED_WORKFLOWS_KEY, JSON.stringify(savedWorkflows));
}

/**
 * Get all saved workflows from localStorage
 */
export function getSavedWorkflows(): SavedWorkflow[] {
  try {
    const savedWorkflowsJson = localStorage.getItem(SAVED_WORKFLOWS_KEY);
    if (!savedWorkflowsJson) {
      return [];
    }
    return JSON.parse(savedWorkflowsJson) as SavedWorkflow[];
  } catch (error) {
    console.error("Error loading saved workflows:", error);
    return [];
  }
}

/**
 * Delete a saved workflow by ID
 */
export function deleteSavedWorkflow(id: string): void {
  const savedWorkflows = getSavedWorkflows();
  const filteredWorkflows = savedWorkflows.filter((workflow) => workflow.id !== id);
  localStorage.setItem(SAVED_WORKFLOWS_KEY, JSON.stringify(filteredWorkflows));
}

/**
 * Clear all saved workflows
 */
export function clearSavedWorkflows(): void {
  localStorage.removeItem(SAVED_WORKFLOWS_KEY);
}