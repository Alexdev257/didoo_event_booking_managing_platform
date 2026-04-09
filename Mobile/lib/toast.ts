import Toast from "react-native-toast-message";

export const toast = {
  success: (message: string, title?: string) =>
    Toast.show({ type: "success", text1: title ?? "Thành công", text2: message }),
  error: (message: string, title?: string) =>
    Toast.show({ type: "error", text1: title ?? "Lỗi", text2: message }),
  info: (message: string, title?: string) =>
    Toast.show({ type: "info", text1: title ?? "Thông báo", text2: message }),
};
