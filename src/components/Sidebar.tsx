import React from 'react';
import * as LucideIcons from 'lucide-react';
import { TOOLS } from '../data/tools';
import { Tool, ToolId } from '../types';
import { cn } from '../lib/utils';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  onOpenSettings: () => void;
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Sidebar({ 
  activeTool, 
  onSelectTool, 
  onOpenSettings,
  user,
  onSignIn,
  onSignOut
}: SidebarProps) {
  return (
    <div className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <LucideIcons.BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none text-zinc-100 tracking-tight">Paradox AI</h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono mt-0.5">Gemini Engine</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          title="Engine Settings"
        >
          <LucideIcons.Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {TOOLS.map((tool) => {
          const Icon = LucideIcons[tool.icon as keyof typeof LucideIcons] as React.ElementType;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md transition-colors",
                isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300"
              )}>
                {Icon && <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{tool.name}</div>
                <div className="text-xs opacity-60 truncate">{tool.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Account / Google Workspace Integration Status */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/80">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-zinc-200 truncate">{user.displayName || 'Google User'}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Workspace Active
                </div>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
              title="Sign Out"
            >
              <LucideIcons.LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-medium text-zinc-200 transition-all shadow-sm"
          >
            <LucideIcons.Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connect Google Account</span>
          </button>
        )}
      </div>
    </div>
  );
}
