

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {

            staleTime: 5 * 60 * 1000,
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (

    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}