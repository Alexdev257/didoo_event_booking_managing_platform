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
 * Tạo kết nối SignalR tới NotificationHub (thông báo real-time)
 */
export const createNotificationHubConnection = () => {
    const hubUrl = `${getBaseUrl()}/hubs/notification`;

    return new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => {
                const token = useSessionStore.getState().accessToken;
                if (!token) {
                    console.log("[SignalR] No token yet, connection will wait");
                }
                return token || "";
            },
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
                if (retryContext.elapsedMilliseconds < 120000) {
                    return 5000;
                }
                return 30000;
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
