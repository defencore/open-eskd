# GitHub Pages deployment

The production hostname is `eskd.defencore.com`. The repository is `defencore/open-eskd`.
The build outputs static files only. Project data never enters the build or the deployment artifact.

The hosted and portable HTML include a Content Security Policy that permits the application bundle, inline portable code and its own service worker, while blocking third-party scripts and application network connections. A reverse proxy may inject analytics markup; the application policy prevents those external scripts from running. Prefer disabling automatic analytics injection at the proxy as well. The offline ZIP preserves the original distribution bytes when a proxy transforms HTML responses.

## Repository configuration

1. Push the source and lockfile to the `main` branch of the GitHub repository.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. In **Settings → Pages → Custom domain**, enter `eskd.defencore.com` and save.
4. At the DNS provider for `defencore.com`, create a **CNAME** record with host **eskd** and target **defencore.github.io**. Do not include the repository name or a URL scheme.
5. Run the **Deploy GitHub Pages** workflow, or push a change to `main`. Check that the deployment environment succeeds.
6. When GitHub finishes domain validation and certificate provisioning, enable **Enforce HTTPS**. Open the site and check JSON/metadata-ZIP import, JSON export, filesystem scripts, HTML reports and offline reload.

The build includes `CNAME` as a record of the intended hostname. **For an Actions deployment, the file does not configure the domain:** the repository Pages setting above is required. DNS changes and repository settings are external steps and are not performed by the local build.

The deployment workflow uploads only `dist/`, requires the reusable Windows filesystem checks and the local quality/build checks before publishing, and uses the `github-pages` environment. Pull requests run CI without deploying. An organization requiring approval for the environment may hold a deployment until an administrator approves it.

`public/CNAME` declares the intended hostname and `public/.nojekyll` is copied into the artifact. The generated directory contains only the hosted application, local icon/manifest, service worker, portable HTML, offline ZIP, license notices and versioned JSON Schema. Source code, tests, dependencies and developer documentation are excluded. The offline ZIP contains an engineer-oriented README, workflow/format guides and a stable example project.

## Local production preview

```sh
npm ci
npm run validate
npm run preview
```

Open `http://localhost:8080/`. The preview server exposes only `dist/`. `PORT=8090 npm run preview` changes the port.

## Browser storage and offline use

The service worker caches a complete application build. Its cache key changes with asset content and worker logic, and caches from previous builds are removed after a successful installation. It does not cache or transmit project documents. Refresh after an application update. Localhost previews prefer the network while retaining an offline fallback.

Storage belongs to a browser origin. Data on `localhost`, the GitHub default URL, the custom domain and a local HTML file are separate workspaces. Export a project ZIP before changing the address and import it at the new address.

`dist/open-eskd.html` embeds the application, styles and icon for portable use without network dependencies. Browser restrictions can prevent persistent storage for local files; the app then shows a session-only notice and supports exporting the current work.

## Official references

- [GitHub custom deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Managing a GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
