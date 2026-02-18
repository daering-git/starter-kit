"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  debounce?: number;
  onSearch: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  defaultValue = "",
  debounce = 300,
  onSearch,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, debounce);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip calling onSearch on mount for the default value
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div
      data-slot="search-input"
      className={cn("relative", className)}
    >
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-8 pr-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 size-full w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setValue("")}
        >
          <X className="size-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
