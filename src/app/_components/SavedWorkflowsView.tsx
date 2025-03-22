import { useState, useEffect } from "react";
import { type SavedWorkflow, getSavedWorkflows, deleteSavedWorkflow } from "~/core/store";
import { cn } from "~/core/utils";
import { WorkflowProgressView } from "./WorkflowProgressView";

export function SavedWorkflowsView({
  className,
  onSelectWorkflow,
}: {
  className?: string;
  onSelectWorkflow?: (workflow: SavedWorkflow) => void;
}) {
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SavedWorkflow | null>(null);

  // Load saved workflows on component mount
  useEffect(() => {
    const loadSavedWorkflows = () => {
      const workflows = getSavedWorkflows();
      setSavedWorkflows(workflows);
    };

    loadSavedWorkflows();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "langmanus.saved.workflows") {
        loadSavedWorkflows();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle workflow deletion
  const handleDeleteWorkflow = (id: string) => {
    deleteSavedWorkflow(id);
    setSavedWorkflows(getSavedWorkflows());
    if (selectedWorkflow && selectedWorkflow.id === id) {
      setSelectedWorkflow(null);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (savedWorkflows.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8", className)}>
        <p className="text-gray-500">No saved workflows yet</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <h2 className="mb-4 text-xl font-bold">Saved Workflows</h2>
      <div className="flex flex-col gap-4">
        {savedWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            className={cn(
              "flex cursor-pointer flex-col rounded-lg border p-4 hover:bg-gray-50",
              selectedWorkflow?.id === workflow.id && "border-primary bg-gray-50"
            )}
            onClick={() => {
              setSelectedWorkflow(workflow);
              if (onSelectWorkflow) {
                onSelectWorkflow(workflow);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{workflow.name}</h3>
              <button
                className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkflow(workflow.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Saved on {formatDate(workflow.timestamp)}
            </p>
          </div>
        ))}
      </div>

      {selectedWorkflow && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">{selectedWorkflow.name}</h3>
          <WorkflowProgressView
            className="max-h-[600px] min-h-[400px] min-w-[928px] max-w-[928px]"
            workflow={selectedWorkflow.workflow}
          />
        </div>
      )}
    </div>
  );
}