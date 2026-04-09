"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type RefetchButtonProps = {
  /** Query keys để invalidate (vd: KEY.users, KEY.events) */
  queryKeys: readonly (readonly string[])[];
  className?: string;
};

export function RefetchButton({ queryKeys, className }: RefetchButtonProps) {
  const queryClient = useQueryClient();
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    if (isRefetching) return;
    setIsRefetching(true);
    try {
      await Promise.all(
        queryKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: [...key] })
        )
      );
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`rounded-xl ${className ?? ""}`}
      onClick={handleRefetch}
      disabled={isRefetching}
    >
      <RefreshCw
        className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
      />
      Làm mới
    </Button>
  );
}
