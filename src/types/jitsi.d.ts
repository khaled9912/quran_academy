export interface JitsiExternalApiOptions {
  roomName: string;
  parentNode: HTMLElement;
  width?: string | number;
  height?: string | number;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: { displayName?: string; email?: string };
}

export interface JitsiExternalApi {
  dispose: () => void;
  addListener: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  isAudioMuted: () => Promise<boolean>;
  executeCommand: (command: string, ...args: unknown[]) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: JitsiExternalApiOptions
    ) => JitsiExternalApi;
  }
}
