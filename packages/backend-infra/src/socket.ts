export type EmitSocketFunction = (companyId: string, event: string, payload: any) => void;

let socketProvider: EmitSocketFunction | null = null;

export function registerSocketProvider(provider: EmitSocketFunction) {
  socketProvider = provider;
}

export function emitSocket(companyId: string, event: string, payload: any): void {
  if (socketProvider) {
    try {
      socketProvider(companyId, event, payload);
    } catch (err) {
      console.error('[Socket] Error emitting event:', err);
    }
  }
}
