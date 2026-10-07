# Putting the website on lelefilms.com

Edition 04, “LeLe in Motion”, is the chosen design for the public website. This page explains how it reaches lelefilms.com and who does what.

## How it fits together

| Part | What it is | Where it lives |
| --- | --- | --- |
| `site/` | The public website: Edition 04 at the root (`/`, `/works/`, `/works/goodbye-yiwu/`, `/contact/`), open to search engines, without the design-study links | Built by `npm run build`; published to GitHub Pages by `.github/workflows/publish-site.yml` on every change to `main` |
| `dist/` | The design preview with all four editions, hidden from search engines | The existing Site (`.openai/hosting.json`), unchanged |
| lelefilms.com | Elena’s domain, registered on 29 September 2026 through DomainRegistry.com LLC. Its DNS is run by Business Identity’s name servers (`ns1/ns2.hosting.businessidentity.llc`) | Elena’s account with the company she bought it from |

On 7 October 2026 the domain had no DNS records at all (no website, no email), so pointing it at the new site does not disturb anything.

## One-time steps, in order

1. **Turn on GitHub Pages (Conny).** In the GitHub repository: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. **Publish (Conny).** Merge the website branch into `main`. The “Publish lelefilms.com” workflow runs (Actions tab) and the site appears at **https://junyizhou-conny.github.io/ElenaWebsite/** within a few minutes. This link works on any phone or computer without logging in, so it is the easiest way for Elena to see the site now.
3. **Ask GitHub for a verification record (Conny).** GitHub profile → Settings → Pages → Add a domain → `lelefilms.com`. GitHub shows a TXT record named like `_github-pages-challenge-junyizhou-conny` with a code. Verifying the domain stops anyone else from claiming it on GitHub.
4. **Add DNS records (Elena, or Conny with Elena’s access).** In the domain company’s DNS settings for lelefilms.com:

   | Type | Name / Host | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `junyizhou-conny.github.io` |
   | TXT | the name from step 3 | the code from step 3 |

   If the company offers a “parked page”, “domain forwarding” or its own website builder for lelefilms.com or www, switch it off. Some panels write the root as blank instead of `@`.
5. **Connect the domain (Conny).** After the records are in place (minutes to a few hours), click Verify for the domain in GitHub. Then repository Settings → Pages → Custom domain: `lelefilms.com` → Save. When the DNS check passes, tick **Enforce HTTPS**, which can take up to 24 hours to become available. Do this step only after step 4: once a custom domain is set, the github.io link from step 2 forwards to lelefilms.com.
6. **Check (both).** Open https://lelefilms.com and https://www.lelefilms.com on a computer and a phone.

These DNS values come from GitHub’s documentation (“Managing a custom domain for your GitHub Pages site”), checked on 7 October 2026. If GitHub shows different values in its settings, use GitHub’s.

## What Elena needs to provide

- **Access to the DNS settings.** Either she enters the records above herself (about ten minutes, easiest on a call), or she gives Conny her own user or delegate access if the company offers it. Never send a password in chat or email.
- **Confirmation that nothing else should use the domain.** Today nothing does. If she later wants email at @lelefilms.com, its records are added next to the website records; nothing above needs removing.
- **Approval of the public content**, because the site becomes public and searchable: the introduction, the film text and Chinese title, the supported-by list and awards, the press links, the contact email and Instagram, and the use of the stills.
- **The address she prefers.** The default is lelefilms.com, with www.lelefilms.com forwarding to it.

## Ownership and renewal

- The domain is Elena’s. It renews on 29 September 2027; turning on auto-renew avoids losing it.
- The repository and the GitHub Pages hosting are on Conny’s GitHub account (free for a public repository). They can move to Elena’s account later. After a transfer, add and verify the domain again in the new owner’s Pages settings.

## Updating the site later

Edit `content/elena.json` (shared facts) or `src/motion.*` (Edition 04), run `npm run build` and `npm run check`, and merge into `main`. The workflow publishes the change within a few minutes. The design preview in `dist/` is updated by the same build and published separately to the existing Site.
