// ── PostMessage API for SpectaSnap embeddable widget ──

/** Messages sent FROM the host page TO the embed iframe. */
export type EmbedInboundMessage =
  | { type: 'spectasnap:selectFrame'; frameId: string }
  | { type: 'spectasnap:getSnapshot' }
  | { type: 'spectasnap:getPD' };

/** Messages sent FROM the embed iframe TO the host page. */
export type EmbedOutboundMessage =
  | { type: 'spectasnap:frameChanged'; frameId: string; frameName: string }
  | { type: 'spectasnap:snapshot'; dataUrl: string }
  | { type: 'spectasnap:pd'; pdMm: number | null; stable: boolean }
  | { type: 'spectasnap:ready' }
  | { type: 'spectasnap:error'; message: string };

/** Post a message from the embed iframe to the parent window. */
export function postToParent(msg: EmbedOutboundMessage): void {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

/** Handler map for inbound messages from the host page. */
export interface EmbedHandlers {
  onSelectFrame?: (frameId: string) => void;
  onGetSnapshot?: () => void;
  onGetPD?: () => void;
}

/**
 * Creates a message event listener for inbound embed messages.
 * Returns a cleanup function that removes the listener.
 */
export function createEmbedListener(handlers: EmbedHandlers): () => void {
  function handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
    if (!data.type.startsWith('spectasnap:')) return;

    switch (data.type) {
      case 'spectasnap:selectFrame': {
        const msg = data as EmbedInboundMessage & { type: 'spectasnap:selectFrame' };
        handlers.onSelectFrame?.(msg.frameId);
        break;
      }
      case 'spectasnap:getSnapshot': {
        handlers.onGetSnapshot?.();
        break;
      }
      case 'spectasnap:getPD': {
        handlers.onGetPD?.();
        break;
      }
    }
  }

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}
