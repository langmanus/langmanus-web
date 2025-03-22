export function AppHeader() {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="text-xl font-bold">LangManus</div>
      <nav className="flex items-center gap-4">
        <a href="/" className="text-gray-600 hover:text-gray-900">
          Home
        </a>
        <a href="/saved-workflows" className="text-gray-600 hover:text-gray-900">
          Saved Workflows
        </a>
      </nav>
    </div>
  );
}
