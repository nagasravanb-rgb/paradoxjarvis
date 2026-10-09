export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface GeminiConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export type ToolId = 
  | "general"
  | "google_drive"
  | "google_calendar"
  | "google_tasks"
  | "google_contacts"
  | "code"
  | "image_prompt"
  | "email"
  | "letter"
  | "social"
  | "planner"
  | "map"
  | "voice"
  | "scheduler"
  | "reminder"
  | "contact"
  | "email_sender"
  | "message_sender";

export interface Tool {
  id: ToolId;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
}
