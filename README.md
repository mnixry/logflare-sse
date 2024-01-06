# logflare-sse

A Cloudflare Worker transforming logflare.app logs to SSE/JSON Stream/WebSocket for easy self-hosted logging.

## Deploy

Clone the repository and run `pnpm install` to install dependencies.

Run `wrangler dev` to start a local server.

Run `wrangler publish` to deploy the worker to Cloudflare.

Or you can use `pnpm build` to build the worker script to `dist/index.js` and deploy it manually.

## Usage

First, you should obtain a share link for your site in `logflare.app`:

### Get a share link

- Go to your site's dashboard
- Select your site
- Click the "Edit" button on the top right corner
- Find the "Public Access" section
- Generate a share link:
  - It should be something like `https://logflare.app/sources/public/<some-id>`
  - Copy the `<some-id>` part

### Get logs

#### SSE

```shell
$ curl "https://domain-for-your-worker.workers.dev/?id=<some-id>" -H "Accept: text/event-stream"
event: data
data: {"body": ..., "source": ..., "timestamp": ...}
[...]
```

#### JSON Stream

```shell
$ curl "https://domain-for-your-worker.workers.dev/?id=<some-id>"
{"body": ..., "source": ..., "timestamp": ...}
[...]
```

#### WebSocket

```javascript
const ws = new WebSocket("wss://domain-for-your-worker.workers.dev/?id=<some-id>");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  // { body: ..., source: ..., timestamp: ... }
};
```
