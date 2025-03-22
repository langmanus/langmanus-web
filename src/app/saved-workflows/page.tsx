"use client";

import { SavedWorkflowsView } from "../_components/SavedWorkflowsView";

export default function SavedWorkflowsPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex min-h-screen min-w-page flex-col items-center">
        <header className="fixed left-0 right-0 top-0 flex h-16 w-full items-center px-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">LangManus</h1>
            <nav className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a
                href="/saved-workflows"
                className="font-medium text-primary"
              >
                Saved Workflows
              </a>
            </nav>
          </div>
        </header>
        <main className="mb-8 mt-24 px-4">
          <div className="w-page">
            <SavedWorkflowsView className="w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}