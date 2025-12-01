import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isThinking?: boolean; // Show inline "Thinking..." bubble while waiting for LLM response
}

// ChatInterface component
const ChatInterface = (props: { prediction?: { disease: string; confidence: number; description: string } | null }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I\'m your dermatology AI assistant. You can ask me questions about skin conditions, treatments, or general dermatology topics. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add refs to control scrolling to specific messages
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingScrollToMessageId = useRef<string | null>(null);

  // Scroll to the start of the target message when messages change
  useEffect(() => {
    if (pendingScrollToMessageId.current) {
      const container = messagesContainerRef.current;
      const targetEl = messageRefs.current[pendingScrollToMessageId.current];
      if (container && targetEl) {
        const top = targetEl.offsetTop - container.offsetTop;
        container.scrollTo({ top, behavior: 'smooth' });
      }
      pendingScrollToMessageId.current = null;
    }
  }, [messages]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Ensure we scroll to the start of the new user query bubble
    pendingScrollToMessageId.current = userMessage.id;

    // Add user message and inline "Thinking..." placeholder
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'bot',
      content: 'Thinking...',
      timestamp: new Date(),
      isThinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include prediction context if present
        body: JSON.stringify({ message: userMessage.content, prediction: props.prediction ?? undefined }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat API');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.reply || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date(),
      };

      // Replace "Thinking..." with the real response
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat(botMessage));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please ensure the backend is running.');

      // Replace "Thinking..." with an error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `I apologize, but I'm having trouble connecting to the server. Please make sure the backend is reachable at ${BACKEND_URL}`,
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat(errorMessage));
    } finally {
      setIsLoading(false);
      // Avoid auto-focus to prevent viewport jumping
      // inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[65vh] md:h-[75vh] lg:h-full flex flex-col bg-card border-border overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground">Medical Assistant</h2>
        <p className="text-xs md:text-sm text-muted-foreground">Ask me anything about dermatology</p>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 chat-scroll min-h-0"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            ref={(el) => { messageRefs.current[message.id] = el; }}
            className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'bot' && (
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
            )}

            {/* Bubble */}
            {message.isThinking ? (
              <div
                className="bg-chat-bot-bg text-chat-bot-fg rounded-2xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-2"
                role="status"
                aria-live="polite"
                aria-label="Assistant is thinking"
              >
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                <span className="text-xs md:text-sm">Thinking...</span>
              </div>
            ) : (
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                  message.role === 'user'
                    ? 'bg-chat-user-bg text-chat-user-fg'
                    : 'bg-chat-bot-bg text-chat-bot-fg'
                }`}
              >
                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className={`text-[10px] md:text-xs mt-1 ${
                  message.role === 'user' ? 'text-chat-user-fg/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            {message.role === 'user' && (
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Removed the separate isLoading bubble to avoid duplication */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 bg-muted border-border focus-visible:ring-primary text-sm md:text-base"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9 md:h-10 md:w-10"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </Card>
  );
};

export default ChatInterface;
