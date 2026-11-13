/** When an island hydrates. `load`: at once. `idle`: requestIdleCallback. `visible`: first intersection. `interaction`: first pointer, touch or focus. */
type HydrateStrategy = 'load' | 'idle' | 'visible' | 'interaction';

export type { HydrateStrategy as H };
