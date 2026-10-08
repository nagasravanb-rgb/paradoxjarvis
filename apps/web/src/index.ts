import { AnalysisResult, JarvisPresenceState, JarvisResponse } from '@paradox/shared';

export interface JarvisUIState {
  presence: JarvisPresenceState;
  query: string;
  response: string;
  activeTab: 'JARVIS' | 'VERIFY' | 'RESEARCH' | 'SITUATION' | 'DECISION' | 'CASES' | 'TRACE' | 'GRAPH' | 'SETTINGS';
  analysis?: AnalysisResult;
  isListening: boolean;
}

export class CinematicJarvisInterface {
  private state: JarvisUIState = {
    presence: 'STANDBY',
    query: '',
    response: 'JARVIS Online. Awaiting evidence verification or situation command.',
    activeTab: 'JARVIS',
    isListening: false
  };

  public getVisualCoreStyles(): { animation: string; color: string } {
    switch (this.state.presence) {
      case 'STANDBY':
        return { animation: 'pulse-slow', color: '#00f0ff' };
      case 'LISTENING':
        return { animation: 'expand-ring', color: '#00ff66' };
      case 'THINKING':
      case 'RESEARCHING':
        return { animation: 'spin-fast', color: '#ffaa00' };
      case 'EXECUTING':
        return { animation: 'glow-intense', color: '#7000ff' };
      case 'SPEAKING':
        return { animation: 'waveform-active', color: '#00f0ff' };
      case 'ERROR':
        return { animation: 'shake-alert', color: '#ff0055' };
    }
  }

  public setTab(tab: JarvisUIState['activeTab']): void {
    this.state.activeTab = tab;
  }

  public handleResponse(res: JarvisResponse): void {
    this.state.presence = res.presence;
    this.state.response = res.responseText;
    this.state.analysis = res.analysisResult;
  }

  public render(): string {
    const styles = this.getVisualCoreStyles();
    return `
      <div class="cinematic-container" data-tab="${this.state.activeTab}">
        <header class="jarvis-header">
          <div class="logo">PARADOX / JARVIS</div>
          <nav class="nav-links">
            <button class="${this.state.activeTab === 'JARVIS' ? 'active' : ''}">JARVIS Presence</button>
            <button class="${this.state.activeTab === 'VERIFY' ? 'active' : ''}">Verify</button>
            <button class="${this.state.activeTab === 'RESEARCH' ? 'active' : ''}">Research</button>
            <button class="${this.state.activeTab === 'SITUATION' ? 'active' : ''}">Situation</button>
            <button class="${this.state.activeTab === 'DECISION' ? 'active' : ''}">Decision</button>
            <button class="${this.state.activeTab === 'TRACE' ? 'active' : ''}">Trace</button>
          </nav>
        </header>
        <main class="jarvis-core-view">
          <div class="core-symbol" style="border-color: ${styles.color}; animation: ${styles.animation}">
            <div class="inner-orb"></div>
          </div>
          <div class="presence-badge">${this.state.presence}</div>
          <div class="response-overlay">${this.state.response}</div>
        </main>
      </div>
    `;
  }
}

console.log('PARADOX Cinematic Web Application Bundle Ready.');
