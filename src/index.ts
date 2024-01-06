import * as cheerio from 'cheerio';
import { Socket } from 'phoenix';

export interface Env {
  PUBLIC_ID?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const id = new URL(request.url).searchParams.get('id') ?? env.PUBLIC_ID;
    if (!id) {
      return new Response('Missing id', { status: 400 });
    }

    const $ = cheerio.load(
      await fetch(`https://logflare.app/sources/public/${id}`).then((res) => res.text())
    );
    const sourceToken = $('#__phx-assigns__').first().attr()?.['data-source-token'];
    if (!sourceToken) {
      return new Response('Missing source id', { status: 500 });
    }

    let publicToken = '';
    for (const script of $('script')) {
      const content = $(script).html();
      if (!content) continue;
      const matched = content.match(/window\.publicToken\s*=\s*"(?<token>.*?)"/);
      if (!matched) continue;
      publicToken = matched.groups?.['token'] ?? '';
    }
    if (!publicToken) {
      return new Response('Missing public token', { status: 500 });
    }

    const socket = new Socket('wss://logflare.app/socket', {
      params: { token: undefined, public_token: publicToken },
    });
    socket.connect();

    const channel = socket.channel(`source:${sourceToken}`, {});

    try {
      await new Promise((resolve, reject) =>
        channel.join().receive('ok', resolve).receive('error', reject)
      );
    } catch (e) {
      return new Response(`Error joining channel, ${JSON.stringify(e)}`, { status: 500 });
    }

    const isSSE = !!request.headers.get('accept')?.includes('text/event-stream'),
      isWebSocket = request.headers.get('upgrade') === 'websocket';

    if (isWebSocket) {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();
      channel.on(`source:${sourceToken}:new`, (payload) =>
        server.send(JSON.stringify(payload))
      );

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    const { readable, writable } = new TransformStream(),
      encoder = new TextEncoder();
    const writer = writable.getWriter();

    channel.on(`source:${sourceToken}:new`, (payload) => {
      const data = JSON.stringify(payload);
      writer.write(
        encoder.encode(isSSE ? `event: data\ndata: ${data}\n\n` : `${data}\n`)
      );
    });

    const headers = new Headers();
    headers.set('cache-control', 'no-cache');
    headers.set('connection', 'keep-alive');
    headers.set('access-control-allow-origin', '*');
    headers.set('content-type', isSSE ? 'text/event-stream' : 'text/plain');

    return new Response(readable, { headers });
  },
};
