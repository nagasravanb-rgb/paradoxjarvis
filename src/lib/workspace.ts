// Client-side Google Workspace API integration for Google Drive, Calendar, Tasks, and Contacts

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  location?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  status: string;
  due?: string;
  updated?: string;
}

export interface ContactItem {
  resourceName: string;
  displayName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export async function fetchDriveFiles(accessToken: string): Promise<DriveFile[]> {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,modifiedTime,webViewLink,size)&orderBy=modifiedTime desc',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Drive files: ${res.status}`);
  }
  const data = await res.json();
  return data.files || [];
}

export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      now
    )}&maxResults=25&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Calendar events: ${res.status}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function createCalendarEvent(
  accessToken: string,
  summary: string,
  startDateTime: string,
  endDateTime: string,
  description?: string
): Promise<CalendarEvent> {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Calendar event: ${res.status}`);
  }
  return await res.json();
}

export async function fetchTasks(accessToken: string): Promise<TaskItem[]> {
  // First get default tasklist
  const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch task lists: ${listRes.status}`);
  }
  const listData = await listRes.json();
  const taskListId = listData.items?.[0]?.id || '@default';

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks?maxResults=50`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch tasks: ${res.status}`);
  }
  const data = await res.json();
  return (data.items || []).map((t: any) => ({
    id: t.id,
    title: t.title || 'Untitled Task',
    notes: t.notes,
    status: t.status,
    due: t.due,
    updated: t.updated,
  }));
}

export async function createTask(
  accessToken: string,
  title: string,
  notes?: string,
  due?: string
): Promise<TaskItem> {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      notes,
      due,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create task: ${res.status}`);
  }
  return await res.json();
}

export async function fetchContacts(accessToken: string): Promise<ContactItem[]> {
  const res = await fetch(
    'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=50',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch contacts: ${res.status}`);
  }
  const data = await res.json();
  return (data.connections || []).map((p: any) => {
    const name = p.names?.[0]?.displayName || 'Unnamed Contact';
    const email = p.emailAddresses?.[0]?.value;
    const phone = p.phoneNumbers?.[0]?.value;
    const photoUrl = p.photos?.[0]?.url;
    return {
      resourceName: p.resourceName,
      displayName: name,
      email,
      phone,
      photoUrl,
    };
  });
}
