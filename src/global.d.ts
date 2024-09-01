interface ElectronAPI {
  loadUrl: (url: string) => void;
  saveHighlightFromPage: () => void;
  loadHighlights: () => Promise<{
    title: string;
    text: string;
    url: string;
  }[]>;
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

interface Window {
  electronAPI: ElectronAPI;
}
