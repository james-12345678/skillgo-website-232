import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api";

interface CompletedTask {
  id?: string;
  aiTask?: string;
  userAnwer?: string;
  createdDate?: string;
}

const CompletedTasks: React.FC = () => {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalTasks, setTotalTasks] = useState(0);

  const fetchCompletedTasks = async (pageNumber: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });

      const url = `api/user-reflection/answers/user-past-answers?${params.toString()}`;
      console.log("🔵 CompletedTasks: Fetching from", url);

      const response = await apiFetch(url);
      console.log("🔵 CompletedTasks: Response status", response.status, "ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔴 CompletedTasks: Error response:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("🔵 CompletedTasks: Full API response:", JSON.stringify(data, null, 2));

      // Handle paginated response format
      let tasks = [];
      let total = 0;

      if (data?.items && Array.isArray(data.items)) {
        console.log("🔵 CompletedTasks: Response has items array with", data.items.length, "items, total:", data.totalItems);
        tasks = data.items;
        total = data.totalItems || data.items.length;
      } else if (Array.isArray(data)) {
        console.log("🔵 CompletedTasks: Response is array with", data.length, "items");
        tasks = data;
        total = data.length;
      } else {
        console.warn("🟡 CompletedTasks: Unknown response format:", Object.keys(data));
        tasks = [];
        total = 0;
      }

      console.log("🔵 CompletedTasks: First task sample:", tasks[0]);
      console.log("🔵 CompletedTasks: Setting", tasks.length, "tasks, total:", total);
      setCompletedTasks(tasks);
      setTotalTasks(total);
      setCurrentPage(pageNumber);
    } catch (err) {
      console.error("🔴 CompletedTasks: Fetch error:", err);
      setError(`Failed to fetch completed tasks: ${err instanceof Error ? err.message : "Unknown error"}`);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks(1);
  }, []);

  const totalPages = Math.ceil(totalTasks / pageSize);

  return (
    <TooltipProvider>
      <div className="space-y-3 max-w-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xs sm:text-sm font-semibold mb-0.5 bg-gradient-to-r from-logo-gold to-cyber-blue bg-clip-text text-transparent">
            Completed Tasks
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
            View all your completed answers and reflections.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center">
              <div className="inline-block">
                <div className="animate-spin h-6 w-6 border-2 border-logo-gold border-t-transparent rounded-full"></div>
              </div>
              <p className="text-xs text-foreground/70 mt-3">Loading your completed tasks...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
                We couldn't retrieve your completed tasks at this moment. Please try refreshing or check back in a moment.
              </div>
              <Button
                onClick={() => fetchCompletedTasks(1)}
                className="mt-3 text-xs"
                size="sm"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        {!loading && !error && completedTasks.length > 0 && (
          <div className="space-y-3">
            {completedTasks.map((task: CompletedTask, idx: number) => (
              <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    {/* AI Task/Question */}
                    {task.aiTask && (
                      <div>
                        <p className="text-[10px] font-semibold text-neural-blue mb-1">Task:</p>
                        <h3 className="text-xs font-semibold text-foreground mb-1">
                          {task.aiTask}
                        </h3>
                      </div>
                    )}

                    {/* User Answer */}
                    {task.userAnwer && (
                      <div className="p-2 rounded bg-logo-gold/5 border border-logo-gold/20">
                        <p className="text-[10px] font-semibold text-logo-gold mb-1">Your Answer:</p>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {task.userAnwer}
                        </p>
                      </div>
                    )}

                    {/* Empty State: Show when both are null */}
                    {!task.aiTask && !task.userAnwer && (
                      <div className="p-2 rounded bg-gray-100 dark:bg-gray-800">
                        <p className="text-xs text-foreground/60">
                          Additional details for this reflection are still being processed
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-foreground/60 pt-1">
                      {task.createdDate && (
                        <span>
                          {new Date(task.createdDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-3">
                <Button
                  onClick={() => fetchCompletedTasks(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Previous
                </Button>

                <div className="text-xs text-foreground/70">
                  Page {currentPage} of {totalPages}
                </div>

                <Button
                  onClick={() => fetchCompletedTasks(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && completedTasks.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-xs text-foreground/70">
                Your activity history is currently empty. Start building your portfolio by completing projects and tasks to see your journey recorded here!
              </p>
              <Button
                onClick={() => navigate('/forensic-app')}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CompletedTasks;
