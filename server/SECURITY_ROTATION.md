# Secret Rotation & Security Steps

This document lists recommended immediate steps to rotate and secure secrets that were exposed in the repository history.

1. Rotate credentials immediately
   - MongoDB Atlas: change the database user's password and update `MONGO_URI` in Vercel/Render and local `.env`.
     - Atlas UI: Security → Database Access → Edit user → Change password.
   - Cloudinary: Revoke and create new API keys.
     - Cloudinary Dashboard → Settings → Security → API Key → Revoke / Generate.
   - JWT secret: generate a new `JWT_SECRET` value and update server envs.
   - Any other API keys (e.g. third-party): revoke and regenerate.

2. Update deployment environment variables
   - Vercel: Project → Settings → Environment Variables → Update values.
   - Render: Dashboard → Services → Environment → Update values.
   - GitHub Actions / Repo secrets: Settings → Secrets and variables → Actions → Add/Update secrets.

3. Revoke old tokens and invalidate sessions
   - If you store long-lived tokens, revoke them where possible (Cloudinary, 3rd-party APIs).
   - Consider forcing password resets or token invalidation for users if relevant.

4. Remove secrets from git history (optional, disruptive)
   - If you want to purge secrets from history, use the BFG or git filter-repo and force-push the rewritten history.
   - WARNING: this rewrites history and requires collaborators to re-clone or rebase.
   - Example (BFG):
     - Install BFG and run:
       ```bash
       bfg --delete-files .env
       git reflog expire --expire=now --all
       git gc --prune=now --aggressive
       git push --force
       ```

5. Add protections
   - Ensure `.gitignore` contains `server/.env` (already added).
   - Add `server/.env.example` (already present) and do not commit real secrets.
   - Consider enabling branch protection and requiring signed commits for sensitive branches.

6. Verification
   - After updating secrets, test deployments and local servers.
   - Verify no services are using old keys.

If you want, I can (pick one):
- Help rotate specific secrets (prepare new values you want set in deployments).
- Run BFG to remove secrets from git history (I will draft the exact commands and perform them, but this requires force-pushing).
- Automate updating GitHub Actions secrets via the `gh` CLI (requires authentication).
