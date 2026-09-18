# AI Insight worker

A tiny Cloudflare Worker that holds your Anthropic API key server-side and
proxies requests from the "Get AI Insight" button on the Programme tab. This
has to be a separate small server because GitHub Pages only serves static
files — it cannot hide a secret key, and putting the key directly in the
site's JavaScript would let anyone viewing the page steal it.

Cost: Cloudflare Workers' free tier covers 100,000 requests/day — you will
never pay for hosting this. The only real cost is Claude API usage itself,
at Haiku 4.5 pricing (~$0.001 per click — a few hundred clicks costs cents).

## One-time setup (about 10 minutes)

1. **Get an Anthropic API key** (if you don't have one):
   - Go to [console.anthropic.com](https://console.anthropic.com), sign up
   - Add a small amount of billing credit (there's no permanent free tier,
     but usage here will cost fractions of a cent per use)
   - Create an API key under **Settings → API Keys**, copy it

2. **Create a free Cloudflare account** at
   [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) if you
   don't have one.

3. **Install the Cloudflare CLI** (`wrangler`) — needs Node.js installed:
   ```
   npm install -g wrangler
   wrangler login
   ```
   This opens a browser to authorize your Cloudflare account.

4. **From this `worker/` folder**, deploy:
   ```
   cd worker
   wrangler deploy
   ```
   This prints a URL like `https://true-strength-ai-insight.<your-subdomain>.workers.dev`.

5. **Store your Anthropic API key as a secret** (never goes in the code or git):
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
   Paste your key when prompted.

6. **Update the site** to point at your Worker URL: open `js/programme.js`,
   find the `AI_INSIGHT_ENDPOINT` constant near the top, and replace the
   placeholder with the URL from step 4. Commit and push.

That's it — the "Get AI Insight" button will now work for every visitor to
your site, at your expense (a fraction of a cent per click), through your
key.

## Updating later

If you change `index.js`, redeploy with `wrangler deploy` from this folder.
The secret you set in step 5 stays in place across deploys.

## If you'd rather not run a server at all

You can skip all of this — the button is designed to fail gracefully with a
clear message if the endpoint isn't configured, and everything else in the
app works exactly the same without it.
