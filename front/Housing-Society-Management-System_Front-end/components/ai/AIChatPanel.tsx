"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAIChat, useAIConversation } from "@/lib/hooks/entities/useAI";
import { useAuth } from "@/lib/hooks/useAuth";
import { AIMessage } from "@/lib/types/ai";
import { Loader2, Send, Bot, User } from "lucide-react";

const AGENT_TYPES = [
  { value: "resident-assistant", label: "Resident Assistant" },
  { value: "committee-advisor", label: "Committee Advisor" },
  { value: "financial-analyst", label: "Financial Analyst" },
  { value: "compliance-monitor", label: "Compliance Monitor" },
];

interface AIChatPanelProps {
  conversationId?: string;
  agentType?: string;
}

export function AIChatPanel({
  conversationId: initialConversationId,
  agentType: initialAgentType,
}: AIChatPanelProps) {
  const { user } = useAuth();
  const chatMutation = useAIChat();

  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [agentType, setAgentType] = useState(
    initialAgentType || "resident-assistant"
  );
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<AIMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: conversation,
    isLoading: conversationLoading,
    isError: conversationError,
  } = useAIConversation(conversationId || "");

  // Sync messages from fetched conversation
  useEffect(() => {
    if (conversation?.messages && conversation.messages.length > 0) {
      setLocalMessages(conversation.messages);
      if (conversation.agentType) {
        setAgentType(conversation.agentType);
      }
    }
  }, [conversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, chatMutation.isPending]);

  const handleSend = () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage: AIMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage("");

    chatMutation.mutate(
      {
        agentType,
        message: currentMessage,
        conversationId,
        societyId: (user as Record<string, string>)?.societyId || "",
      },
      {
        onSuccess: (data) => {
          if (data.conversationId && !conversationId) {
            setConversationId(data.conversationId);
          }
          const assistantMessage: AIMessage = {
            role: "assistant",
            content: data.response,
            timestamp: new Date().toISOString(),
          };
          setLocalMessages((prev) => [...prev, assistantMessage]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isNewConversation = !initialConversationId;

  if (initialConversationId && conversationLoading) {
    return (
      <Card className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (initialConversationId && conversationError) {
    return (
      <Card className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center justify-center flex-1">
          <p className="text-muted-foreground">
            Failed to load conversation. Please try again.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <CardHeader className="border-b shrink-0 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            {conversation?.title || "New Conversation"}
          </CardTitle>
          {isNewConversation && localMessages.length === 0 && (
            <Select value={agentType} onValueChange={setAgentType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENT_TYPES.map((at) => (
                  <SelectItem key={at.value} value={at.value}>
                    {at.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!isNewConversation && (
            <span className="text-sm text-muted-foreground capitalize">
              {AGENT_TYPES.find((at) => at.value === agentType)?.label ||
                agentType}
            </span>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-4">
            {localMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Start a conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select an agent type and send a message to begin. The AI
                  assistant will help you with your query.
                </p>
              </div>
            )}

            {localMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[75%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user"
                          ? "text-blue-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[75%]">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="border-t p-4 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || chatMutation.isPending}
            size="sm"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
