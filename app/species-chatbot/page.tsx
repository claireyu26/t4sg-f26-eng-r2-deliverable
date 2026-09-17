"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function SpeciesChatbot() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    console.log("Submitting chatbot message:", trimmedMessage);
    setChatLog((currentLog) => [...currentLog, { role: "user", content: trimmedMessage }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const data = (await response.json()) as { response?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to get a chatbot response.");
      }

      setChatLog((currentLog) => [
        ...currentLog,
        { role: "bot", content: data.response ?? "No response generated." },
      ]);
    } catch (error) {
      console.error("Chatbot request failed:", error);
      setChatLog((currentLog) => [
        ...currentLog,
        { role: "bot", content: "Sorry, I could not answer that right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TypographyH2>Species Chatbot</TypographyH2>
      <div className="mt-4 flex gap-4">
        <div className="mt-4 rounded-lg bg-foreground p-4 text-background">
          <TypographyP>
            The Species Chatbot is a feature to be implemented that is specialized to answer questions about animals.
            Ideally, it will be able to provide information on various species, including their habitat, diet,
            conservation status, and other relevant details. Any unrelated prompts will return a message to the user
            indicating that the chatbot is specialized for species-related queries only.
          </TypographyP>
          <TypographyP>
            To use the Species Chatbot, simply type your question in the input field below and hit enter. The chatbot
            will respond with the best available information.
          </TypographyP>
        </div>
      </div>
      {/* Chat UI, ChatBot to be implemented */}
      <div className="mx-auto mt-6">
        {/* Chat history */}
        <div className="h-[400px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted p-4">
          {chatLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start chatting about a species!</p>
          ) : (
            chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none border border-border bg-foreground text-primary-foreground"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isLoading && <p className="text-sm text-muted-foreground">Thinking...</p>}
        </div>
        {/* Input and submission */}
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 flex items-center gap-2">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about a species..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </>
  );
}
