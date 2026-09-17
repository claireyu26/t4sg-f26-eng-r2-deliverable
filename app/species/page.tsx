"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypographyH2 } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function SpeciesChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! Ask me anything about animal or plant species." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

const data = (await res.json()) as { response?: string };
setMessages((prev) => [...prev, { role: "bot", content: data.response ?? "No response received." }]);    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error getting response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[80vh] max-w-2xl flex-col p-4">
      <TypographyH2>Species Chatbot</TypographyH2>
      <Separator className="my-3" />

      {/* Chat Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded border p-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                m.role === "user" ? "bg-black text-white" : "bg-white border text-slate-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs italic text-slate-400">Thinking...</p>}
      </div>

      {/* Paste Form Here: Submits when pressing Enter inside Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a species..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
