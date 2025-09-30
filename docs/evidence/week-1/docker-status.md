✅ Docker Containers & Image Build Verified
- Services up via `docker compose up -d postgres redis` (Sep 30)
- Backend production image builds locally: `docker build --target production -t ncs-backend-local backend/`

### CI Artifact Publishing (Sep 30, 2025)
- Backend CI workflow now pushes `ncs-backend-ci` builds to `ghcr.io/ncs-networks-communication-solution/ncs-ecom-backend` on main branch runs only (`.github/workflows/ci.yml:55`).
- Image tag uses the commit SHA; GitHub Actions job summary records the pushed digest for traceability.
- Pull example: `docker pull ghcr.io/ncs-networks-communication-solution/ncs-ecom-backend:<commit-sha>` then `docker run ghcr.io/ncs-networks-communication-solution/ncs-ecom-backend:<commit-sha>`.
- PR runs continue to build for validation but skip registry login to avoid publishing review images.
