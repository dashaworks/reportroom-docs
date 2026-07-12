# Submitting ReportRoom to MCP registries

Canonical descriptor: [`server.json`](./server.json) · endpoint `https://mcp.reportroom.io/mcp` (Streamable HTTP).

## 1. Official MCP Registry (registry.modelcontextprotocol.io)
DNS-authenticated publish (we control `reportroom.io`), using the `mcp-publisher` CLI:
```bash
# install
brew install mcp-publisher   # or: go install github.com/modelcontextprotocol/registry/cmd/mcp-publisher@latest
# authenticate the io.reportroom namespace via DNS
mcp-publisher login dns --domain reportroom.io
#   -> prints a TXT record to add to reportroom.io; add it, then:
mcp-publisher publish   # reads ./server.json
```
Namespace `io.reportroom` = reverse of the domain we own (DNS auth proves control).

## 2. Anthropic Directory (claude.ai/directory)
Submit the remote connector so it's addable in claude.ai and via `claude mcp add`.
- Endpoint: `https://mcp.reportroom.io/mcp`
- Requires: Dynamic Client Registration + OAuth (tracked as DAS-26). Until then, API-key (`--header`) works in Claude Code.

## 3. Glama (glama.ai)
Auto-indexes public GitHub repos. This repo is public — claim/verify the listing at glama.ai once indexed.

## 4. Smithery (smithery.ai)
Publish via CLI with a manifest (tools + auth = API key / OAuth). Optional managed-auth layer for clients lacking OAuth.

## 5. PulseMCP + mcp.so
Hand-reviewed directories — submit via their "Submit a server" forms with the endpoint + `server.json`.

## Listing hygiene (raises adoption)
- 9 focused tools, each with a crisp "when to use" description and a `message` field. ✓
- Docs: https://docs.reportroom.io · agent index: https://docs.reportroom.io/llms.txt ✓
- One-liner: `claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp` ✓
