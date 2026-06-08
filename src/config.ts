// Single source of truth for the model id.
//
// A bare "provider/model" string routes through the Vercel AI Gateway when
// AI_GATEWAY_API_KEY is set — no provider package needed. Swap this constant
// to A/B different models in the eval harness and compare per-field accuracy.
//
// NOTE: verify the exact gateway slug for your account; model ids change.
export const MODEL = 'anthropic/claude-sonnet-4.5';

// Lower temperature = more deterministic extraction. Extraction is not a
// creative task; we want the same document to yield the same fields.
export const TEMPERATURE = 0;
