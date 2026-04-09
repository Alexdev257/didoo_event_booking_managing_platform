import React, { useState } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface Props {
    children: React.ReactNode;
}

export default function QueryClientProviderWrapper({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: 2,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
