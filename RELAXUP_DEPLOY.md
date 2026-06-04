# relaxup.ru deployment

The Docker production stack is prepared for `https://relaxup.ru` and `https://www.relaxup.ru`.

## VPS deployment

Use this path for a normal VPS with a public IPv4 address.

1. Point DNS records to the VPS:

```text
relaxup.ru      A  195.208.118.38
www.relaxup.ru  A  195.208.118.38
```

2. Copy `.env.vps.example` to `.env` and replace every `change_me_*` value. For Yandex ID login, create an OAuth app and fill `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, and `YANDEX_REDIRECT_URI=https://relaxup.ru/account`.

3. Start the VPS stack:

```bash
npm run docker:up:vps
```

Caddy publishes ports `80` and `443` and issues Let's Encrypt certificates automatically.
The internal web container is expected to be bound to localhost with:

```env
WEB_PORT=127.0.0.1:8080
POSTGRES_PORT=127.0.0.1:5432
```

## Cloudflare Tunnel

Use this path only if the project must run behind Cloudflare Tunnel instead of a public VPS.

1. In Cloudflare Zero Trust, create or open a tunnel for this project.
2. Add public hostnames:
   - `relaxup.ru` -> `http://web:80`
   - `www.relaxup.ru` -> `http://web:80`
3. Copy the tunnel token into `.env`:

```env
CLOUDFLARE_TUNNEL_TOKEN=your_cloudflare_tunnel_token
```

4. Start the domain stack:

```bash
npm run docker:up:relaxup
```

Cloudflare currently returns `530` when the DNS record exists but no healthy tunnel or origin is connected.

## Local Docker

For local-only Docker without the tunnel profile:

```bash
npm run docker:up
```

The local web container is still published on `WEB_PORT`, which defaults to `8080`.
