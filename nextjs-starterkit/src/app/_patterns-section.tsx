"use client";

import { InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useToast } from "@/hooks/useToast";

export function PatternsSection() {
  const toast = useToast();

  return (
    <Section
      title="Common Patterns (Layer 3)"
      description="Domain-agnostic composite components built from Layer 1 primitives"
      centered
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            EmptyState
          </h3>
          <EmptyState
            icon={<InboxIcon className="size-7" />}
            title="No items yet"
            description="Items you add will appear here. Get started by creating your first item."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("Item created!", "Your new item has been added.")
                }
              >
                Create item
              </Button>
            }
          />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            LoadingSpinner
          </h3>
          <div className="flex flex-col items-center gap-8 py-4">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-xs text-muted-foreground">sm</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="md" />
                <span className="text-xs text-muted-foreground">md</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="lg" />
                <span className="text-xs text-muted-foreground">lg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
