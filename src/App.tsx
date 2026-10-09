/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { TOOLS } from './data/tools';
import { ToolId, GeminiConfig } from './types';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [activeToolId, setActiveToolId] = useState<ToolId>('general');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setUser(user);
        setToken(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Load config from localStorage or use default
  const [config, setConfig] = useState<GeminiConfig>(() => {
    const saved = localStorage.getItem('paradox-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.model === 'llama3' || parsed.model === 'gemini-3.5-flash') {
          parsed.model = 'gemini-3.8-flash';
        }
        return parsed;
      } catch (e) {
        // ignore
      }
    }
    return {
      baseUrl: '',
      model: 'gemini-3.8-flash',
      apiKey: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('paradox-config', JSON.stringify(config));
  }, [config]);

  const activeTool = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 text-zinc-100">
      {needsAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="flex flex-col items-center gap-6 max-w-md w-full p-8 border border-zinc-800 rounded-3xl bg-zinc-900/95 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.253 5.253 4 4 0 0 0 5.873 5.873 3 3 0 1 0 5.38-2.625M12 5v14M12 5h7a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-7M12 19h7a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-7"/></svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold tracking-tight mb-2">Connect Google Workspace</h1>
              <p className="text-zinc-400 text-sm">
                Sign in to link Google Drive, Calendar, Tasks, and Contacts with Paradox AI.
              </p>
            </div>
            
            <div className="w-full space-y-3">
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-black font-medium rounded-xl transition-all disabled:opacity-50 shadow-md text-sm"
              >
                {isLoggingIn ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                )}
                Sign in with Google
              </button>

              <button
                onClick={() => setNeedsAuth(false)}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl text-xs transition-colors"
              >
                Skip for now (Continue to Chat)
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        activeTool={activeToolId}
        onSelectTool={setActiveToolId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onSignIn={handleLogin}
        onSignOut={handleLogout}
      />
      
      <ChatArea 
        tool={activeTool} 
        config={config} 
        token={token}
        onSignIn={handleLogin}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={setConfig}
      />
    </div>
  );
}
