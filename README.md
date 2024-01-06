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

### Tailing logs

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

## License

This project is licensed under GPLv3 license. See [LICENSE](./LICENSE) for more details.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
