import BASE_URL from "./HTTPService";
console.log("ChatService loaded");
// Gửi tin nhắn chat đến backend
export const sendMessage = (message) => {
    const response = BASE_URL.post("/chat", { message });
    return response;
};