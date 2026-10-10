/**
 * True Strength AI - insight endpoint.
 *
 * Tiny Cloudflare Worker that proxies a summary of the user's logged
 * programme history to Claude and returns a short coaching note. This
 * exists ONLY because a static site (GitHub Pages) can't safely hold an
 * API key - anyone viewing page source could steal it. The key lives here
 * instead, as a Worker secret, never sent to the browser.
 *
 * Deploy steps: see README.md in this folder.
 */

const ALLOWED_ORIGIN = 'https://bat007ninja.github.io';
const MODEL = 'claude-haiku-4-5';
const MAX_SUMMARY_LENGTH = 4000; // characters, keeps requests small & cheap

const WORKOUT_SYSTEM_PROMPT =
  'You are a concise, encouraging strength-training coach. You will be given ' +
  "a lifter's logged workout history (exercise names, target rep ranges, and " +
  'what they actually logged, with dates). Rep-range notation like "5x3" ' +
  'means SETS x REPS - 5 sets of 3 reps each - not 5 reps done 3 times; read ' +
  'all such notation that way. All weights are in KILOGRAMS (kg) - the ' +
  'logged numbers often have no unit written (e.g. "60x3-4" means 60kg for ' +
  '3-4 reps); always write weights with "kg", and never say or imply "lbs" ' +
  'or "pounds" under any circumstances, even if you are unsure of the unit. ' +
  'Write a short note (120 words max, plain text, no markdown headers) ' +
  'covering: whether they seem to be progressing, plateaued, or should ' +
  'consider a deload on any specific lift, and one concrete, encouraging ' +
  "suggestion. If there isn't enough logged history yet to say anything " +
  'meaningful, say so briefly and encourage them to keep logging.';

const WEIGHT_SYSTEM_PROMPT =
  'You are a concise, encouraging training assistant. You will be given a ' +
  "person's logged bodyweight history (dates and kg, most recent last), and " +
  'sometimes a goal weight. All weights are in KILOGRAMS (kg) - never say or ' +
  'imply "lbs" or "pounds" under any circumstances. Write a short note (120 ' +
  'words max, plain text, no markdown headers) covering: the trend direction ' +
  '(gaining, losing, or stable) and roughly how fast, progress toward the ' +
  'goal if one is given (do not assume whether the goal is to gain or lose - ' +
  'read that from the data), and one concrete, encouraging observation or ' +
  'suggestion. Do not give medical advice or specific calorie/macro targets. ' +
  "If there isn't enough logged history yet to say anything meaningful, say " +
  'so briefly and encourage them to keep logging.';

function systemPromptFor(kind) {
  return kind === 'weight' ? WEIGHT_SYSTEM_PROMPT : WORKOUT_SYSTEM_PROMPT;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Use POST.' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    if (!summary) {
      return jsonResponse({ error: 'Missing "summary" field.' }, 400);
    }
    if (summary.length > MAX_SUMMARY_LENGTH) {
      return jsonResponse({ error: 'Summary too long.' }, 400);
    }

    const kind = typeof body.kind === 'string' ? body.kind : 'workout';

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'Server is missing its API key.' }, 500);
    }

    let anthropicRes;
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          system: systemPromptFor(kind),
          messages: [{ role: 'user', content: summary }],
        }),
      });
    } catch (e) {
      return jsonResponse({ error: 'Could not reach Claude API.' }, 502);
    }

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return jsonResponse({ error: `Claude API error: ${errText}` }, 502);
    }

    const data = await anthropicRes.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    const insight = textBlock ? textBlock.text : '';

    if (!insight) {
      return jsonResponse({ error: 'Claude returned no text.' }, 502);
    }

    return jsonResponse({ insight });
  },
};
