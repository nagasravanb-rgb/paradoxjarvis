import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Bot, User, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Tool, GeminiConfig } from '../types';
import { cn } from '../lib/utils';
import { WorkspaceView } from './WorkspaceView';

interface ChatAreaProps {
  tool: Tool;
  config: GeminiConfig;
  token: string | null;
  onSignIn: () => void;
}

export function ChatArea({ tool, config, token, onSignIn }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when tool changes
  useEffect(() => {
    setMessages([
      {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: `**${tool.name} Activated.**\n\n${tool.description}\n\n*How can I help you?*`,
        timestamp: Date.now(),
      }
    ]);
    setError(null);
  }, [tool.id]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    setInput('');
    setError(null);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMsgId = (Date.now() + 1).toString();
    
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      
      chatHistory.push({ role: 'user', content: userText });

      const targetUrl = '/api/chat';

      const payload = {
        apiKey: config.apiKey,
        model: config.model,
        messages: [
          { role: 'system', content: tool.systemPrompt },
          ...chatHistory
        ],
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // The last element is incomplete until the next newline or stream end
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.message && data.message.content) {
              fullContent += data.message.content;
              
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === assistantMsgId 
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          } catch (e: any) {
            if (e.message && e.message !== 'Unexpected end of JSON input') {
              console.error('Error parsing JSON chunk', e, trimmed);
            }
          }
        }
      }

      // Process any remaining bytes flushed from decoder
      buffer += decoder.decode();
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer.trim());
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.message && data.message.content) {
            fullContent += data.message.content;
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === assistantMsgId 
                  ? { ...msg, content: fullContent }
                  : msg
              )
            );
          }
        } catch (e) {
          console.error('Error parsing trailing JSON chunk', e, buffer);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(`Connection failed: ${err.message}. Please check your Gemini API key in settings.`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Simple Web Speech API implementation for Voice tool
  const startVoiceInput = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
    };
    
    recognition.start();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        {tool.id.startsWith('google_') && (
          <div className="max-w-4xl mx-auto w-full">
            <WorkspaceView 
              toolId={tool.id} 
              token={token} 
              onSignIn={onSignIn} 
              onSendToChat={(text) => setInput(text)} 
            />
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-4xl mx-auto w-full group",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1",
              msg.role === 'user' 
                ? "bg-zinc-700" 
                : msg.role === 'system'
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "bg-indigo-600"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-zinc-300" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={cn(
              "flex flex-col gap-1 max-w-[80%]",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className="text-xs text-zinc-500 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.role === 'user' ? 'You' : 'Paradox AI'}
              </div>
              <div className={cn(
                "px-5 py-3 rounded-2xl",
                msg.role === 'user' 
                  ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                  : msg.role === 'system'
                    ? "bg-transparent border border-indigo-500/30 text-indigo-200"
                    : "bg-zinc-950/50 border border-zinc-800 text-zinc-300 rounded-tl-sm shadow-sm"
              )}>
                {msg.content === '' && isGenerating ? (
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {error && (
          <div className="max-w-4xl mx-auto w-full p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm whitespace-pre-wrap font-mono leading-relaxed shadow-lg">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg"
          >
            {tool.id === 'voice' && (
              <button
                type="button"
                onClick={startVoiceInput}
                className="pl-4 pr-2 text-zinc-400 hover:text-indigo-400 transition-colors"
                title="Use microphone"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.id === 'voice' ? "Speak or type your message..." : `Message ${tool.name}...`}
              className="flex-1 bg-transparent py-4 px-4 text-zinc-100 placeholder-zinc-500 focus:outline-none"
              disabled={isGenerating}
            />
            
            <div className="pr-3 flex items-center">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2 rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 disabled:bg-zinc-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
          <div className="text-center mt-2 text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
            Powered by {config.model} (Gemini Engine)
          </div>
        </div>
      </div>
    </div>
  );
}
