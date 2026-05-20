import type { AiMessage } from "../types";

export function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "end" : "start" }}>
      <article
        style={{
          maxWidth: "78%",
          padding: "10px 12px",
          borderRadius: 10,
          background: isUser ? "#2563eb" : "#f1f5f9",
          color: isUser ? "#ffffff" : "#172033",
        }}
      >
        <p style={{ margin: 0 }}>{message.content}</p>
        {message.redacted ? <small>Contains redactions</small> : null}
      </article>
    </div>
  );
}
