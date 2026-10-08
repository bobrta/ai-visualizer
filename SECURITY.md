# Security

Visual Canvas is a static, local-first browser application. It does not provide server-side authentication and should not be used as a vault for secrets or confidential records.

## Trust model

- Recommended runtime: `http://127.0.0.1:4173` through `tools/local_server.py`.
- The local server binds only to `127.0.0.1`, not the LAN.
- Chart/project data is stored in browser `localStorage` unless explicitly exported.
- The password screen is a convenience gate only. Its hash and salt are public client assets and it can be bypassed by someone with file access.
- Plotly, ECharts and Mermaid are fixed-version third-party dependencies. Offline setup verifies downloaded bundles before installing them.

## Data safety

- Do not store passwords, API keys, medical records, financial secrets, or other sensitive information in project JSON or localStorage.
- Back up important projects with the JSON export. Clearing browser site data removes localStorage.
- localStorage is origin-specific. `127.0.0.1:4173` and `127.0.0.1:4174` have separate stores.

## Browser protections

The bundled local server sends restrictive headers including CSP, frame blocking, MIME sniffing protection, no-referrer and a limited Permissions Policy. The CSP still permits inline scripts/styles because the current static app architecture uses them; removing that allowance would require a larger refactor.

## Reporting

If you find a security issue, avoid posting private data or exploit payloads in a public issue. Describe the affected file/function and the observable impact with minimal reproduction details.
