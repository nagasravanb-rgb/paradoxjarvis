import React, { useState, useEffect } from 'react';
import { 
  Folder, Calendar, CheckSquare, Users, RefreshCw, ExternalLink, 
  Plus, Search, AlertCircle, FileText, Clock, Mail, Phone, Lock
} from 'lucide-react';
import { ToolId } from '../types';
import { 
  fetchDriveFiles, fetchCalendarEvents, fetchTasks, fetchContacts, 
  createTask, DriveFile, CalendarEvent, TaskItem, ContactItem 
} from '../lib/workspace';

interface WorkspaceViewProps {
  toolId: ToolId;
  token: string | null;
  onSignIn: () => void;
  onSendToChat: (text: string) => void;
}

export function WorkspaceView({ toolId, token, onSignIn, onSendToChat }: WorkspaceViewProps) {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      if (toolId === 'google_drive') {
        const files = await fetchDriveFiles(token);
        setDriveFiles(files);
      } else if (toolId === 'google_calendar') {
        const evs = await fetchCalendarEvents(token);
        setEvents(evs);
      } else if (toolId === 'google_tasks') {
        const t = await fetchTasks(token);
        setTasks(t);
      } else if (toolId === 'google_contacts') {
        const c = await fetchContacts(token);
        setContacts(c);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data from Google Workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toolId, token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const created = await createTask(token, newTaskTitle.trim());
      setTasks(prev => [created, ...prev]);
      setNewTaskTitle('');
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsAddingTask(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl m-4 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">Google Workspace Connection Required</h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-4">
          Connect your Google account to access your {toolId.replace('google_', '').toUpperCase()} directly in Paradox AI.
        </p>
        <button
          onClick={onSignIn}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl m-4 backdrop-blur-sm flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {toolId === 'google_drive' && <Folder className="w-4 h-4 text-emerald-400" />}
          {toolId === 'google_calendar' && <Calendar className="w-4 h-4 text-amber-400" />}
          {toolId === 'google_tasks' && <CheckSquare className="w-4 h-4 text-blue-400" />}
          {toolId === 'google_contacts' && <Users className="w-4 h-4 text-purple-400" />}
          <span className="text-sm font-medium text-zinc-200">
            {toolId === 'google_drive' && 'Your Google Drive Files'}
            {toolId === 'google_calendar' && 'Upcoming Calendar Events'}
            {toolId === 'google_tasks' && 'Google Tasks'}
            {toolId === 'google_contacts' && 'Google Contacts'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${toolId.replace('google_', '')}...`}
          className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Tool-specific view */}
      {toolId === 'google_drive' && (
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {driveFiles
            .filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(file => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span className="truncate text-zinc-200" title={file.name}>{file.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onSendToChat(`Can you summarize and analyze my Google Drive document "${file.name}"?`)}
                    className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] transition-colors"
                  >
                    Ask AI
                  </button>
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-zinc-500 hover:text-zinc-300"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          {driveFiles.length === 0 && !isLoading && (
            <div className="text-center py-4 text-xs text-zinc-500">No Drive files found</div>
          )}
        </div>
      )}

      {toolId === 'google_calendar' && (
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {events
            .filter(e => !searchQuery || e.summary.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(event => {
              const startStr = event.start.dateTime 
                ? new Date(event.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                : event.start.date || '';
              return (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors text-xs group"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="truncate text-zinc-200 font-medium">{event.summary || 'Untitled Event'}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{startStr}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSendToChat(`Tell me about my upcoming event "${event.summary}" at ${startStr} and prepare talking points or schedule adjustments.`)}
                    className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] transition-colors flex-shrink-0"
                  >
                    Plan with AI
                  </button>
                </div>
              );
            })}
          {events.length === 0 && !isLoading && (
            <div className="text-center py-4 text-xs text-zinc-500">No upcoming calendar events</div>
          )}
        </div>
      )}

      {toolId === 'google_tasks' && (
        <div className="flex flex-col gap-2">
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-2.5 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAddingTask || !newTaskTitle.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {tasks
              .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate text-zinc-200">{task.title}</span>
                  </div>
                  <button
                    onClick={() => onSendToChat(`Help me break down and complete this task: "${task.title}". Provide an actionable step-by-step checklist.`)}
                    className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] transition-colors flex-shrink-0"
                  >
                    Break Down
                  </button>
                </div>
              ))}
            {tasks.length === 0 && !isLoading && (
              <div className="text-center py-4 text-xs text-zinc-500">No tasks in default list</div>
            )}
          </div>
        </div>
      )}

      {toolId === 'google_contacts' && (
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {contacts
            .filter(c => 
              !searchQuery || 
              c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(contact => (
              <div 
                key={contact.resourceName}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors text-xs group"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <div className="truncate text-zinc-200 font-medium">{contact.displayName}</div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-0.5">
                    {contact.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-2.5 h-2.5" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onSendToChat(`Draft a polite follow-up email to ${contact.displayName}${contact.email ? ` (${contact.email})` : ''} regarding our upcoming collaboration.`)}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] transition-colors flex-shrink-0"
                >
                  Draft Email
                </button>
              </div>
            ))}
          {contacts.length === 0 && !isLoading && (
            <div className="text-center py-4 text-xs text-zinc-500">No contacts found</div>
          )}
        </div>
      )}
    </div>
  );
}
