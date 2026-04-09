import * as signalR from "@microsoft/signalr";
import { envconfig } from "../config";
import { useSessionStore } from "../stores/sesionStore";

/**
 * Lấy URL gốc (xóa /api ở cuối) để tạo Hub URL
 */
const getBaseUrl = () => {
    return envconfig.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
};

/**
 * Tạo kết nối SignalR tới TicketHub (giữ vé real-time)
 */
export const createTicketHubConnection = () => {
    const hubUrl = `${getBaseUrl()}/hubs/ticket`;

    return new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => {
                const token = useSessionStore.getState().accessToken;
                return token || "";
            },
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
                if (retryContext.elapsedMilliseconds < 60000) {
                    return 2000;
                }
                return 10000;
            },
        })
        .configureLogging(createSilentLogger())
        .build();
};

// Create a silent logger that suppresses all SignalR logs
function createSilentLogger(): signalR.ILogger {
    return {
        log: (logLevel, message) => {
            // Only log connected/closed events, suppress all errors
            const msg = message?.toLowerCase() || "";

            if (msg.includes("connected")) {
                console.log("[SignalR] Connected successfully");
            } else if (msg.includes("closed")) {
                console.log("[SignalR] Connection closed");
            }
            // Suppress all error/failed/start messages
        },
    };
}

