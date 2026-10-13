# Organizational self-hosting

The application is static. Serving it locally does not upload manifests or create a shared project database. Each browser origin stores its own work; organizations control JSON exchange, engineering files, backups and any derived synchronization service.

## Portable file

Build with `npm ci && npm run validate`, then distribute `dist/open-eskd.html` or `dist/open-eskd-offline.zip`. The standalone HTML embeds scripts, styles and icon. It works without a server or internet. Some browsers restrict persistent storage for local files; follow the visible session-only/export notices. Keep engineering data outside the application distribution.

## Static web server

Serve the complete `dist/` directory at a stable HTTPS address. Use correct MIME types for JavaScript, CSS, JSON and the web manifest. Serve `sw.js` without long-lived caching. No rewrite-to-index fallback or application API is required. Static directory/subpath hosting works because application asset URLs are relative.

For a workstation preview, `npm run preview` binds to loopback at `http://localhost:8080`. This is a development preview, not an authenticated organizational service. A LAN HTTP address may not provide service-worker or cryptography APIs; use HTTPS or the portable HTML rather than instructing users to weaken browser settings.

## Optional container

```sh
docker build -t open-eskd:local .
docker run --rm -p 127.0.0.1:8080:8080 open-eskd:local
```

The multi-stage image builds static artifacts with Node 24 and serves them using nginx on port 8080. It permits GET/HEAD and does not accept engineering uploads. Put an organization-managed HTTPS/authentication gateway in front if serving beyond a workstation. For reproducible organizational deployments, pin reviewed base-image digests and retain the package lockfile and source revision.

Container execution requires a local Docker installation. Automated build tests verify the static artifacts; they do not replace testing the chosen hosting infrastructure.

## Operational checks

Before distributing a release, run `npm run validate`, inspect both interface languages, import a representative manifest, export JSON, generate a creation/check script and open a report beside its relative files. Test offline reload at the actual HTTPS address and portable-file behavior in supported browsers. Keep previous application distributions and owner-exported JSON backups under your organization's retention policy.

Changing host/domain/browser changes the storage origin. Export JSON before moving and import it at the new address. Hosting access controls do not encrypt local browser storage or engineering files. A shared backend, approval service or production ERP integration is a derived system and must retain core conformance, provenance and immutable configuration records.
