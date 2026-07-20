# Gateway — Documentation

**Project:** Beautinique (BQ-Microservices)
**Service:** Gateway
**Author:** Nageshwar Pawar
**Version:** 1.0.0
**Port:** configured via `PORT` (see [§4](#4-environment-variables))

---

## 1. Overview

The Gateway is the single public entry point for the **Beautinique** platform's microservices (`user-service`, `product-service`, `media-service` — plus `mail-service` indirectly, since nothing here calls it directly). It owns the browser-facing session: issuing/verifying short-lived JWT `access_token`/`refresh_token` cookies, and translating that cookie session into the `X-Service-Secret`/`X-User-Id`/`X-User-Role` headers every downstream service actually trusts. It has **no database of its own** — every request either gets forwarded to a downstream service via a typed Axios wrapper, or streamed through untouched via a raw HTTP proxy (media uploads). It also serves its own documentation: `GET /` renders this README as HTML, and `GET /docs` serves an interactive Swagger UI.

---

## 2. Technology Stack

| Layer                      | Technology                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime                    | Node.js (ES2025, ESM)                                                                                                                                        |
| Language                   | TypeScript 6.x (`strict`, `noUncheckedIndexedAccess`, `noEmitOnError`)                                                                                       |
| Framework                  | Express.js 5.x                                                                                                                                               |
| Outbound HTTP (typed)      | Axios (`classes/ApiRequest.ts`), one instance per downstream service                                                                                         |
| Outbound HTTP (raw stream) | `http-proxy` — used only for `media-service` (file uploads)                                                                                                  |
| Session                    | `jsonwebtoken` (access/refresh JWTs) + `cookie-parser` — **no database or Redis anywhere in this service**                                                   |
| API docs                   | OpenAPI 3.0.3 spec (hand-written, `src/docs/openapi.ts`) + `swagger-ui-express`, tags grouped per downstream service — see [§5.6](#56-interactive-docs-docs) |
| README rendering           | `@beautinique/shared-markdown-to-html` (markdown → HTML)                                                                                                     |
| Shared error/response      | `@beautinique/backend-classes`, `@beautinique/backend-response`                                                                                              |
| Shared request middleware  | `@beautinique/backend-request` (`checkEmptyRequest`)                                                                                                         |
| Shared validation          | `@beautinique/backend-zod` (schemas + `validateZod`, same package `user-service` uses)                                                                       |
| Shared utilities           | `@beautinique/backend-utils`, `@beautinique/shared-utils`                                                                                                    |
| Shared constants/types     | `@beautinique/shared-constants`, `@beautinique/backend-types`                                                                                                |
| Logging                    | Pino, via `@beautinique/backend-logger`                                                                                                                      |
| Code quality               | ESLint (flat config, type-checked + strict), Prettier                                                                                                        |

---

## 3. Project Structure

```
gateway/
├── src/
│   ├── index.ts                       # Entry point: loads env, wires SIGINT/SIGTERM, calls startup()
│   ├── app.ts                         # Express app: middleware chain, routes, error handlers
│   ├── bootstrap/                     # Startup/shutdown orchestration
│   │   ├── startup.ts                 #   Starts the HTTP server (no DB/Redis/queue to connect first)
│   │   ├── shutdown.ts                #   Stops the HTTP server → destroys sockets, in order
│   │   └── server.ts                  #   Low-level HTTP server lifecycle + connection tracking
│   ├── classes/
│   │   ├── index.ts                   #   BaseUserService / BaseProductService (ApiRequest subclasses, one per downstream service)
│   │   └── ApiRequest.ts              #   Axios wrapper: header injection, response unwrapping, AppError translation
│   ├── configs/
│   │   └── index.ts                   #   Singleton: logger
│   ├── constants/
│   │   └── index.ts                   #   METHODS_AND_PATHS, API_METHODS_AND_URLS, SERVICES_BASE_URLS, SERVICE_SECRET_MAP, COOKIES_DATA
│   ├── controllers/
│   │   └── index.ts                   #   wakeUpController, refreshAccessTokenController
│   ├── docs/
│   │   └── openapi.ts                 #   Hand-written OpenAPI 3.0 spec, served at /docs
│   ├── envs/
│   │   └── index.ts                   #   process.env → typed envs, fail-fast on missing/invalid vars
│   ├── middlewares/
│   │   ├── index.ts                   #   Re-exports
│   │   ├── auth.middleware.ts         #   authenticate, authorize — verify the access_token cookie
│   │   └── proxy.middleware.ts        #   mediaServiceProxy — raw http-proxy stream to media-service
│   ├── modules/
│   │   ├── user/                      #   Everything proxied to user-service
│   │   │   ├── index.ts               #     Re-exports the router
│   │   │   ├── constants/index.ts     #     CLIENT_OAUTH_REDIRECT_URL
│   │   │   ├── routes/                #     auth-routes/{login,register,password}.route.ts, user-routes
│   │   │   ├── controllers/           #     auth-controllers, user-controllers — set/clear auth cookies here
│   │   │   └── services/              #     AuthService, UserService (ApiRequest subclasses)
│   │   └── product/                   #   Everything proxied to product-service
│   │       ├── index.ts               #     Re-exports the router
│   │       ├── routes/                #     category.routes.ts, product.routes.ts
│   │       ├── controllers/           #     category.controller.ts, product.controller.ts
│   │       └── services/              #     CategoryService, ProductService (ApiRequest subclasses)
│   ├── routes/
│   │   └── index.ts                   #   Root router (/api/v1): refresh-access-token + mounts user/product module routers
│   ├── types/
│   │   ├── index.ts                   #   IJwtPayload/TUser, ICreateHeaders, TApiResponse, route-typing machinery (TGenerateRoutes)
│   │   └── express.d.ts               #   Request.user augmentation
│   └── utils/
│       └── index.ts                   #   JWT/cookie helpers, createHeaders, createRouteHelper (route-config → typed {method,url} tree)
├── scripts/
│   └── generate-html.mjs              # Renders README.md → public/index.html, runs via "postbuild"
├── public/
│   └── index.html                     # Pre-rendered README, served by GET /
├── dist/                              # Compiled JavaScript output (git-ignored)
├── logs/                              # Pino log output
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── .env
```

---

## 4. Environment Variables

All environment variables are loaded via `dotenv` and validated in `src/envs/index.ts` — every one is checked with `requireEnv`/`requirePort` at startup, so a missing value throws a clear `Missing required environment variable: X` error immediately instead of failing confusingly later. There is no fallback/default for any of these — every one is required.

### 4.1 Server & App

| Variable   | Description                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`     | HTTP port to listen on                                                                                                                         |
| `NODE_ENV` | `"development"` enables pretty logging and stack traces in error responses; also relaxes cookie options (see [§8](#8-authentication--cookies)) |

### 4.2 JWT

| Variable             | Description                                   |
| -------------------- | --------------------------------------------- |
| `JWT_ACCESS_SECRET`  | Signing secret for the 15-minute access token |
| `JWT_REFRESH_SECRET` | Signing secret for the 7-day refresh token    |

### 4.3 Downstream Service URLs & Secrets

| Variable                   | Description                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER_SERVICE_BASE_URL`    | Base URL of `user-service`                                                                                                                                      |
| `USER_SERVICE_SECRET`      | Value sent as `X-Service-Secret` on every request to `user-service`                                                                                             |
| `PRODUCT_SERVICE_BASE_URL` | Base URL of `product-service`                                                                                                                                   |
| `PRODUCT_SERVICE_SECRET`   | Value sent as `X-Service-Secret` on every request to `product-service`                                                                                          |
| `MEDIA_SERVICE_BASE_URL`   | Base URL of `media-service`                                                                                                                                     |
| `MEDIA_SERVICE_SECRET`     | Value sent as `X-Service-Secret` on every proxied media-service request                                                                                         |
| `MAIL_SERVICE_BASE_URL`    | Base URL of `mail-service`                                                                                                                                      |
| `MAIL_SERVICE_SECRET`      | Reserved — nothing in this gateway currently calls `mail-service` directly (OTP email is enqueued by `user-service` onto `mail-queue`, not routed through here) |

### 4.4 Frontend Origins

| Variable          | Description                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLIENT_BASE_URL` | Customer-facing frontend origin — also the base for the OAuth redirect landing page (`{CLIENT_BASE_URL}/auth/oauth`, see [§10.2](#102-oauth-login-google--linkedin--github)) |
| `ADMIN_BASE_URL`  | Admin dashboard origin                                                                                                                                                       |
| `SELLER_BASE_URL` | Seller dashboard origin                                                                                                                                                      |
| `MASTER_BASE_URL` | Master/super-admin dashboard origin                                                                                                                                          |

`ORIGINS` (`constants/index.ts`) collects all four into a single array — declared for CORS configuration, but **no CORS middleware is currently wired up in `app.ts`** (see [§14](#14-design-notes--known-trade-offs)).

### 4.5 Gateway's Own URL

| Variable           | Description                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GATEWAY_BASE_URL` | This service's own public URL — loaded into `envs.url.gateway` but not currently read anywhere else in the codebase (kept for parity with the other services' env shape / future use) |

---

## 5. API Routes

Every route below either terminates in this service (home/docs/health/wake-up/refresh) or is a thin pass-through to a downstream service — the Gateway does no business-logic validation of its own beyond auth/role checks; request bodies are validated by the same `@beautinique/backend-zod` schemas the downstream services use (imported directly into this repo, see [§9](#9-request-validation)), so a bad request is rejected here rather than wasting a downstream round trip.

### 5.1 Home, Docs, Health & Wake-up

| Method | Path       | Auth | Description                                                                                                                                                                |
| ------ | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`        | None | This README, pre-rendered to HTML by `scripts/generate-html.mjs`                                                                                                           |
| GET    | `/docs`    | None | Interactive Swagger UI (spec in `src/docs/openapi.ts`)                                                                                                                     |
| GET    | `/health`  | None | Liveness only — this service has no DB/Redis to report on                                                                                                                  |
| GET    | `/wake-up` | None | Pings `{service}/health` on all four downstream services in parallel; returns `UP`/`DEGRADED` based on the results (see [§11](#11-wake-up--downstream-health-aggregation)) |

### 5.2 Gateway's Own — `/api/v1`

| Method | Path                           | Auth                 | Description                                               |
| ------ | ------------------------------ | -------------------- | --------------------------------------------------------- |
| POST   | `/api/v1/refresh-access-token` | Refresh token cookie | Reads `refresh_token`, issues a new `access_token` cookie |

### 5.3 Media — `/api/v1/media-service/**` (raw proxy, any authenticated role)

Everything under this prefix is streamed 1:1 to `media-service` by `mediaServiceProxy` (`http-proxy`) — the Gateway does not parse, validate, or even buffer the request body for these routes (see [§12](#12-media-upload-proxying)). In practice this means:

| Method | Path                                    | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| POST   | `/api/v1/media-service/upload/single`   | Upload one image or video            |
| POST   | `/api/v1/media-service/upload/multiple` | Upload several images/videos at once |

Both take a `file`/`files` field plus a `folder` field in the multipart body. File-size limits (`MAX_IMAGE_SIZE`/`MAX_VIDEO_SIZE` from `@beautinique/shared-constants`, formatted via `formatFileSize`) are documented in `src/docs/openapi.ts` for reference, but **enforced only on `media-service` itself** — this gateway never inspects the file, so an oversized upload is rejected downstream (`413`), not here.

See `media-service`'s own README (`src/reference/media-service/README.md` in this repo) for the full request/response shape — the Gateway doesn't alter it.

### 5.4 User — `/api/v1/user-service/*`

| Method | Path                                  | Auth                  | Description                                                                |
| ------ | ------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| POST   | `/auth/login/manual`                  | None                  | Manual email/phone + password login                                        |
| GET    | `/auth/login/oauth/google/redirect`   | None                  | Get Google OAuth consent URL                                               |
| GET    | `/auth/login/oauth/google/callback`   | None                  | Google OAuth callback                                                      |
| GET    | `/auth/login/oauth/linkedin/redirect` | None                  | Get LinkedIn OAuth consent URL                                             |
| GET    | `/auth/login/oauth/linkedin/callback` | None                  | LinkedIn OAuth callback                                                    |
| GET    | `/auth/login/oauth/github/redirect`   | None                  | Get GitHub OAuth consent URL                                               |
| GET    | `/auth/login/oauth/github/callback`   | None                  | GitHub OAuth callback                                                      |
| DELETE | `/auth/logout`                        | `access_token` cookie | Clear the caller's session                                                 |
| POST   | `/auth/register/send-otp`             | None                  | Start registration: OTP to email                                           |
| PATCH  | `/auth/register/resend-otp`           | OTP session token     | Resend the registration OTP                                                |
| POST   | `/auth/register/verify-otp`           | OTP session token     | Verify the registration OTP                                                |
| POST   | `/auth/register/save-user`            | OTP session token     | Complete registration — sets auth cookies                                  |
| POST   | `/auth/password/forgot-send-otp`      | None                  | Start forgot-password: OTP to email                                        |
| PATCH  | `/auth/password/forgot-resend-otp`    | OTP session token     | Resend the forgot-password OTP                                             |
| POST   | `/auth/password/forgot-verify-otp`    | OTP session token     | Verify the forgot-password OTP                                             |
| POST   | `/auth/password/forgot-save`          | OTP session token     | Set a new password — sets auth cookies                                     |
| PATCH  | `/auth/password/change`               | `access_token` cookie | Change password while logged in — re-issues auth cookies                   |
| PATCH  | `/auth/password/set`                  | `access_token` cookie | Set an initial password for an OAuth-only account — re-issues auth cookies |
| GET    | `/user/session`                       | `access_token` cookie | Fetch the caller's own user record                                         |

"OTP session token" means the client sends the token (returned by the corresponding `send-otp` call) via `Authorization: <token>` (raw or `Bearer <token>`) — this header passes straight through to `user-service` unmodified, it isn't a JWT this gateway issues or checks itself.

### 5.5 Product — `/api/v1/product-service/*`

| Method | Path                          | Auth                        | Description                                     |
| ------ | ----------------------------- | --------------------------- | ----------------------------------------------- |
| POST   | `/category`                   | `ADMIN`, `MASTER`           | Create a category (L1/L2/L3)                    |
| PATCH  | `/category/:categoryId`       | `ADMIN`, `MASTER`           | Update a category                               |
| DELETE | `/category/:categoryId`       | `ADMIN`, `MASTER`           | Delete a leaf category with zero products       |
| GET    | `/category/by-parent-level`   | `ADMIN`, `SELLER`, `MASTER` | List categories by `level`/`parent`             |
| GET    | `/category/by-hierarchy`      | None                        | Full L1→L2→L3 nested tree                       |
| POST   | `/product/draft`              | `ADMIN`, `SELLER`, `MASTER` | Save one step of a multi-step draft             |
| GET    | `/product/draft`              | `ADMIN`, `SELLER`, `MASTER` | Fetch the caller's in-progress draft            |
| PATCH  | `/product/draft/publish`      | `ADMIN`, `SELLER`, `MASTER` | Publish a completed draft as a real product     |
| GET    | `/product/dashboard/products` | `ADMIN`, `SELLER`, `MASTER` | Paginated/sortable/searchable dashboard listing |
| GET    | `/product/dashboard/:slug`    | `ADMIN`, `SELLER`, `MASTER` | Single dashboard product lookup                 |
| GET    | `/product/:slug`              | None                        | Public storefront product lookup                |
| GET    | `/product/suggestions`        | None                        | Autocomplete search suggestions                 |

"Auth" here is enforced twice, independently: this gateway's own `authorize([...])` middleware checks the `access_token` cookie's role **before** forwarding, and `product-service` checks the `X-User-Role` header the Gateway attaches on the way in — a request can't reach the downstream service at all without first passing the Gateway's own check.

### 5.6 Interactive Docs (`/docs`)

`GET /docs` serves `swagger-ui-express` over the hand-written spec in `src/docs/openapi.ts` — every path key, method, and enum value in it is built from the *same* `METHODS_AND_PATHS`/`@beautinique/shared-constants` this service's own routing and validation use, so the docs can't silently drift from the actual routes.

**Tags.** Every operation is tagged with the *service that actually handles it*, not just a generic feature name — so the sidebar groups endpoints by which downstream service owns them:

- `Gateway` — health, wake-up, refresh-token (terminates here, never proxied)
- `User Service: Login` / `Register` / `Password` / `Logout` / `Session` — all proxied to `user-service`
- `Product Service: Category` / `Product` — proxied to `product-service`
- `Media Service: Upload` — streamed to `media-service`

**Schemas.** Enums (`CATEGORY_LEVELS`, `PRODUCT_STATUSES`, `USER_ROLES`, `AUTH_PROVIDERS`, `DRAFT_PRODUCT_STEP_MAP`, `SORT`) are pulled directly from `@beautinique/shared-constants` rather than hand-typed as string literals, and every dynamic path segment (`:categoryId`, `:slug`) is converted to OpenAPI's `{param}` syntax (`path.replace(':', '{')` + a trailing `}`) — Express uses `:param`, but the OpenAPI 3.0 spec itself requires `{param}`, so the two need this small translation to both be correct at once.

---

## 6. Request Headers (Client → Gateway)

| Header                  | Purpose                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Cookie: access_token`  | Short-lived (15 min) JWT — read by `authenticate`/`authorize`, required wherever "Auth" is listed above as a cookie |
| `Cookie: refresh_token` | Long-lived (7 days) JWT — read only by `POST /api/v1/refresh-access-token`                                          |
| `X-Login-Role`          | Optional, `POST /auth/login/manual` only — the logged-in user's role must match it (`MASTER` always allowed)        |
| `Authorization`         | OTP session token — register/forgot-password OTP steps only, forwarded to `user-service` unmodified                 |

Clients never send `X-Service-Secret`, `X-User-Id`, or `X-User-Role` themselves — those are headers **this gateway attaches** on the downstream leg (see [§7](#7-request--response-handling)); if a client sends them anyway, they're overwritten before the request leaves this service.

---

## 7. Request / Response Handling (`classes/ApiRequest.ts`)

Every module service (`AuthService`, `UserService`, `CategoryService`, `ProductService`) extends `ApiRequest`, one Axios instance per downstream service (`baseURL` set from `SERVICES_BASE_URLS[key]` in the constructor).

`ApiRequest.request<TData>(config)`:

1. Pulls `user`/`token`/`loginRole`/`contentType` out of the call-site config and builds the downstream headers via `createHeaders` (`utils/index.ts`) — `X-Service-Secret` (always, from `SERVICE_SECRET_MAP[this.serviceKey]`), plus `X-User-Id`/`X-User-Role` (if `user` was passed), `Authorization` (if `token` was passed), `X-Login-Role`/`Content-Type` (if given). Any caller-supplied `headers` are merged in on top.
2. Sends the request via the service's own Axios instance, returns `response.data` typed as `TApiResponse<TData>` — the downstream envelope (`{ statusCode, message, data }`) is passed straight through, not unwrapped, so `res.success(response)` in a Gateway controller re-wraps it into this service's own envelope without losing `message`/`data`.
3. On an `AxiosError` with a response, translates the downstream error body into the matching `@beautinique/backend-classes` error (`createError`/`ERROR_CLASS_MAP`, by the downstream's own `code` field, falling back to `INTERNAL_SERVER_ERROR` for an unrecognized/missing code) — so a `404`/`NOT_FOUND` from `product-service` surfaces to the Gateway's client as a `404`/`NOT_FOUND` too, not a generic `500`. Anything else (network failure, no response at all) becomes a generic `INTERNAL_SERVER_ERROR`.

### Route Typing (`utils/index.ts` + `types/index.ts`)

`METHODS_AND_PATHS` (`constants/index.ts`) is a single nested object of `{ method, path }` endpoints, mirroring every downstream route this gateway calls. `createRouteHelper` walks it once at module load and produces `API_METHODS_AND_URLS`: the same tree, but every `{method, path}` leaf becomes `{method: Uppercase<method>, url}`, where `url` is either the literal path (no `:params`) or a `(params) => path` function (dynamic segments, e.g. `:categoryId`/`:slug`). `TGenerateRoutes<T>` is the TypeScript mapped type computing this transformation at the type level — a service class does `this.request({ ...this.routes.category.update, url: url({categoryId}), data, user })` and gets full autocomplete/type-checking on both the URL params and the HTTP method, without either ever being handwritten as a raw string.

---

## 8. Authentication & Cookies

There is no session store — the "session" is entirely the signed JWT inside the `access_token`/`refresh_token` cookies (`utils/index.ts`: `generateAccessToken`/`generateRefreshToken`, both `{ _id, role }` payloads).

| Cookie          | TTL        | Set by                                                                                                                                            |
| --------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_token`  | 15 minutes | Every login/register/password-flow controller that succeeds, plus `POST /api/v1/refresh-access-token`                                             |
| `refresh_token` | 7 days     | Every login/register/password-flow controller that succeeds (**not** reissued by the refresh endpoint — refreshing only rotates the access token) |

Cookie options (`COOKIE_OPTIONS`, `constants/index.ts`): `httpOnly: true` always; `secure`/`sameSite` flip based on `envs.is_dev` — `secure: false, sameSite: 'lax'` in dev (works over plain HTTP on `localhost`), `secure: true, sameSite: 'none'` in production (required for a cross-origin frontend to send the cookie at all).

### `authenticate` vs `authorize` (`middlewares/auth.middleware.ts`)

- **`authenticate`** — reads `access_token`, verifies it, attaches `{ _id, role }` to `req.user`. No role check. Used wherever a route just needs "is logged in" (logout, change/set password, session lookup).
- **`authorize(allowedRoles)`** — does everything `authenticate` does, plus requires `req.user.role` to be in `allowedRoles` (`MASTER` always passes, regardless of the list). Since it's a strict superset, routes never chain both — a route either needs `authenticate` alone or `authorize([...])` alone.

A missing/invalid/expired token throws `AuthenticationError` (401); an insufficient role throws `AuthorizationError` (403) — both flow through `errorResponse` like any other error.

---

## 9. Request Validation

Mutating `user-service` routes (login/register/password) are validated by `@beautinique/backend-zod` schemas (`validateZod({ body: <schema> })`) — the **same package** `user-service` itself uses, imported directly here so a malformed request never reaches the network hop to `user-service` at all. `product-service` routes have no local Zod validation in this gateway — `checkEmptyRequest` guards against an empty body/params, and the rest of the validation (pricing rules, category hierarchy, etc.) happens on `product-service` itself, which returns a structured `422`/`fieldErrors` response that flows back through unchanged (see [§7](#7-request--response-handling)).

---

## 10. Authentication Flows

### 10.1 Manual Login / Register / Forgot-Password

Structurally identical for all three: the client calls the corresponding `user-service`-backed route through this gateway; on success, the controller (`modules/user/controllers/auth-controllers/index.ts`) calls `generateAuthTokens({_id, role})` from the response's `data` and `setAuthCookies(res, ...)` **before** `res.success(response)` — the cookies are set as a side effect of the same response, not a separate round trip.

### 10.2 OAuth Login (Google / LinkedIn / GitHub)

1. `GET /auth/login/oauth/{provider}/redirect` → the controller calls the downstream service for the provider's consent URL, then `res.redirect(url)`s the browser to it directly (not a JSON response).
2. Provider redirects back to `GET /auth/login/oauth/{provider}/callback?code=...` on this gateway.
3. The controller forwards `code` to `user-service`, which exchanges it and returns the user. On success: `setAuthCookies` + `res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`)`. On failure: `res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${encodeURIComponent(message)}`)` — the error message is URL-encoded before being appended, so a message containing `&`/`#`/other reserved characters can't corrupt the redirect's query string.

`CLIENT_OAUTH_REDIRECT_URL` (`modules/user/constants/index.ts`) is `${envs.url.frontend.client}/auth/oauth` — the frontend is expected to have a route there that reads `success`/`error`/`message` off the query string and reacts accordingly.

### 10.3 Refresh (`POST /api/v1/refresh-access-token`)

Reads `refresh_token`, verifies it, signs a fresh `access_token`, sets it as a cookie. Does **not** call any downstream service — the refresh token itself carries `{_id, role}`, so nothing needs to be re-fetched. Does not rotate the refresh token.

### 10.4 Logout

`DELETE /auth/logout` — requires `authenticate`, calls `user-service` to drop the cached session there, then `clearAuthCookies(res)` regardless of whether the downstream call found anything to clear.

---

## 11. Wake-up — Downstream Health Aggregation

`GET /wake-up` (`controllers/index.ts`) fetches `{url}/health` for all four entries in `envs.url.service` (`mail`, `media`, `product`, `user`) in parallel via `Promise.allSettled`, treating a network failure or non-`ok` response as `DOWN` for that service (never lets one slow/dead service fail the whole endpoint). Overall `status` is `UP` if every service is `UP`, `DEGRADED` if some are `UP` and some `DOWN`. Response is a plain `res.status(...).json(...)` — **not** wrapped in `res.success`, since `successResponse` isn't mounted yet at the point this route is registered relative to the media-service proxy (see [§14](#14-design-notes--known-trade-offs)) and this endpoint predates that envelope convention regardless.

---

## 12. Media Upload Proxying (`middlewares/proxy.middleware.ts`)

`mediaServiceProxy` wraps a single `http-proxy` server instance (`target: '{MEDIA_SERVICE_BASE_URL}/api/v1'`) and is mounted directly in `app.ts`, **before** `express.json()`/`express.urlencoded()`:

```ts
app.use(cookieParser());
app.use(createHttpLogger(...));
app.use(`${base}${media_service.default}`, authorize(USER_ROLES), mediaServiceProxy);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

This order matters: `http-proxy` streams the raw request body straight through to `media-service` untouched (that's how a multipart file upload survives the hop). If `express.json()`/`express.urlencoded()` ran first, they'd drain the request stream for any matching `Content-Type` before `http-proxy` ever got to it, and the proxied request would arrive at `media-service` with an empty/hanging body. `authorize(USER_ROLES)` still runs first, since it only reads the `access_token` cookie (already parsed by `cookieParser`) — it never touches the body.

On a proxied request, `mediaProxy`'s `proxyReq` handler attaches `X-Service-Secret`/`X-User-Id`/`X-User-Role` from `req.user` (set by `authorize`) before the request leaves this service — `media-service` sees exactly the same trusted headers it would from any other typed `ApiRequest` call, even though this path never goes through `ApiRequest` at all. A downstream failure (`media-service` unreachable, timeout) is caught by `mediaProxy`'s own `error` handler, which writes a `502` JSON body directly (bypassing `errorResponse`, since a raw-proxied request never reaches this gateway's own error-handling middleware).

---

## 13. Server Lifecycle

### Startup (`bootstrap/startup.ts`)

1. Start the HTTP server (`startHttpServer`).

That's the entire sequence — with no database, cache, or queue connection to establish first, there's nothing else to sequence. Idempotent (`setStarted()` guards re-entry). On any failure, logs and calls `process.exit(1)`.

### Graceful Shutdown (`bootstrap/shutdown.ts`, `SIGINT`/`SIGTERM`)

1. Stop accepting new HTTP requests (`stopHttpServer`, existing requests finish first).
2. Destroy any remaining open sockets.

Idempotent (`setShuttingDown()` guards re-entry); logs success/failure and sets `process.exitCode` accordingly before exiting.

---

## 14. Design Notes / Known Trade-offs

- **No CORS middleware.** `ORIGINS` (`constants/index.ts`) collects all four frontend URLs but nothing in `app.ts` currently uses them in a `cors()` call — cross-origin browser requests to this gateway will fail today unless something upstream (a reverse proxy, CDN) handles CORS instead.
- **`GET /wake-up` doesn't use `res.success`.** It's a plain `res.status().json()`, inconsistent with every other route's envelope — kept as-is since it predates `successResponse` in the middleware chain at the point it's registered, and changing its shape would be a breaking change for whatever currently polls it.
- **Role checks are duplicated by design.** `authorize([...])` runs here *and* the downstream service re-checks the same `X-User-Role` header — intentionally defense-in-depth (a downstream service should never trust a header purely because "the gateway already checked"), not an oversight.
- **`refresh-access-token` never rotates the refresh token.** A single 7-day refresh token can mint unlimited 15-minute access tokens for its whole lifetime — there's no refresh-token rotation or reuse detection.
- **OAuth callback error messages are `encodeURIComponent`-escaped before being appended to the redirect URL** (see [§10.2](#102-oauth-login-google--linkedin--github)) — without this, a downstream error message containing `&`, `#`, or other reserved query-string characters could corrupt the redirect or inject unintended query parameters.
- **`GET /` regenerates on `npm run build`, not `npm run dev`.** `public/index.html` is generated from `README.md` by the `postbuild` script (`scripts/generate-html.mjs`). Editing this file while running `npm run dev` won't update `GET /` until a build actually runs.
- **`src/reference/`** holds read-only copies of the other four services' `README.md`/`docs/openapi.ts`, used purely as a cross-service reference while working in this repo — not part of the running application (not imported by any route/build step).

---

## 15. Build & Run Commands

```bash
npm install
npm run dev            # tsc --noEmit --watch + nodemon (tsx) — development, auto-restarts on src changes
npm run build           # tsc → dist/, then auto-regenerates public/index.html (see "postbuild" below)
npm run start            # node dist/index.js — production (run build first)
npm run start:dev        # build + start in one step
npm run lint              # eslint src
npm run lint:fix
npm run clean              # remove dist/
```

**`postbuild`** (`node scripts/generate-html.mjs`) runs automatically after every `npm run build`, via npm's `pre*`/`post*` script convention — it re-renders `README.md` → `public/index.html` using `@beautinique/shared-markdown-to-html`, so `GET /` is always in sync with the latest `README.md` after a build.

**Note:** this only fires on `npm run build` (and anything that calls it, like `start:dev`) — `npm run dev` runs `tsx` directly and never touches `tsc`/`postbuild`, so editing `README.md` during `npm run dev` won't update `GET /` until you run `npm run build` (or `node scripts/generate-html.mjs` directly).

### TypeScript strictness (`tsconfig.json`)

Beyond `strict: true`: `noUncheckedIndexedAccess` (indexed access is `T | undefined`, not `T`), `noEmitOnError` (a broken build produces no `dist/` output at all), `noUnusedLocals`/`noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`. `declaration`/`declarationMap` are deliberately **off** — this is an application, not a package anything imports.

### ESLint (`eslint.config.mjs`)

Flat config: `@eslint/js` recommended → `typescript-eslint` recommended/strict/stylistic → type-checked variants (`recommendedTypeChecked`/`strictTypeChecked`/`stylisticTypeChecked` via `projectService`) → `simple-import-sort` → Prettier (last, disables conflicting stylistic rules).

---

## 16. Shared Packages (`@beautinique/*`)

| Package                                | Purpose                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `@beautinique/backend-classes`         | `AppError` subclasses, `createError`, `ERROR_CLASS_MAP` — used both for this service's own errors and to translate downstream error bodies |
| `@beautinique/backend-logger`          | `createLogger`/`createHttpLogger` (Pino-based)                                                                                             |
| `@beautinique/backend-request`         | `checkEmptyRequest`                                                                                                                        |
| `@beautinique/backend-response`        | `successResponse`/`errorResponse`/`notFoundResponse`/`tryCatchResponse`                                                                    |
| `@beautinique/backend-types`           | `TServiceName`, `TUserRole`, `TApiMethod`, and every Zod-inferred request-body type (`TLoginZodSchema`, `TRegisterZodSchema`, ...)         |
| `@beautinique/backend-utils`           | `getUser`                                                                                                                                  |
| `@beautinique/backend-zod`             | `validateZod` and every request Zod schema this gateway validates against, ahead of `user-service`                                         |
| `@beautinique/shared-constants`        | `HEADERS_MAP`, `SERVICE_NAMES_MAP`, `API_METHODS_MAP`, `USER_ROLES`, `USER_ROLE_MAP`                                                       |
| `@beautinique/shared-markdown-to-html` | `generateHtmlFromMarkdown` — used by `scripts/generate-html.mjs`                                                                           |
| `@beautinique/shared-utils`            | `requireEnv`/`requirePort`                                                                                                                 |

This service has **no `@beautinique/backend-mongoose`, `backend-bullmq`, `backend-multer`, or Redis client dependency** — it is stateless by design, unlike every other service in this platform.

---

## 17. Error Handling

Every error — thrown locally (`AuthenticationError`, `AuthorizationError`, `BadRequestError`, ...) or translated from a downstream response by `ApiRequest` (see [§7](#7-request--response-handling)) — is a `@beautinique/backend-classes` `AppError` subclass, and flows through the same `errorResponse` middleware (`@beautinique/backend-response`) mounted last in `app.ts`.

| Code                   | HTTP Equivalent | When Used                                                                |
| ---------------------- | --------------- | ------------------------------------------------------------------------ |
| `AUTHENTICATION_ERROR` | 401             | Missing/invalid/expired `access_token`/`refresh_token` cookie            |
| `AUTHORIZATION_ERROR`  | 403             | Role not in the route's `allowedRoles`                                   |
| `BAD_REQUEST`          | 400             | Missing `code`/`Authorization` where a controller checks for it directly |
| *(anything else)*      | *(varies)*      | Translated 1:1 from whatever code the downstream service returned        |

`envs.is_dev` controls whether `errorResponse` includes a stack trace.

---

## 18. API Response Format

All responses use `@beautinique/backend-response`'s envelope, attached via `app.use(successResponse({ defaultMessage: 'Success.' }))` (mounted after the body parsers — see [§12](#12-media-upload-proxying) for why the media-service proxy route sits ahead of it):

```jsonc
// success
{ "success": true, "message": "User logged in successfully", "data": { "_id": "...", "firstName": "...", "...": "..." } }

// error
{ "success": false, "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": { ... }, "globalErrors": [ ... ] }
```

`res.success({ statusCode, message, data })` — `data` is omitted entirely (not sent as `null`) when not provided; `statusCode` defaults to `200`. For proxied/forwarded calls, the Gateway controller typically passes the *entire* downstream response straight into `res.success(response)`, since it's already shaped `{ statusCode, message, data }`.

---

## 19. Data Flow Examples

### Manual Login

```
Client → POST /auth/login/manual { loginMethod, email/phoneNumber, password } [X-Login-Role?]
  Gateway → validateZod(loginZodSchema)
  Gateway → AuthService.manualLogin() → user-service POST /api/v1/auth/login/manual
    [X-Service-Secret, X-Login-Role?]
  ← user-service returns { statusCode, message, data: user }
  Gateway → generateAuthTokens({_id, role}) → setAuthCookies(access_token, refresh_token)
  ← res.success({ message, data: user })  [Set-Cookie: access_token, refresh_token]
```

### Media Upload (Single)

```
Client → POST /api/v1/media-service/upload/single [Cookie: access_token, multipart file+folder]
  Gateway → authorize(USER_ROLES): verify access_token → req.user
  Gateway → mediaServiceProxy: http-proxy streams the raw request through, unbuffered
    proxyReq: attaches X-Service-Secret, X-User-Id, X-User-Role from req.user
  → media-service POST /api/v1/upload/single (uploads to Cloudinary, enqueues BullMQ cleanup jobs)
  ← media-service response streamed straight back to the client, untouched by this gateway
```

### Product Draft Publish

```
Client → PATCH /api/v1/product-service/product/draft/publish [Cookie: access_token]
  Gateway → authorize(['ADMIN','SELLER','MASTER']): verify access_token → req.user
  Gateway → ProductService.publishDraftProduct(user) → product-service PATCH /api/v1/product/draft/publish
    [X-Service-Secret, X-User-Id, X-User-Role]
  ← product-service loads the caller's Redis draft, assembles + validates + saves the Product
  ← returns { statusCode: 201, message: 'Product sent for review', data: product }
  Gateway ← res.success(response)
```

### Token Refresh

```
Client → POST /api/v1/refresh-access-token [Cookie: refresh_token]
  Gateway → verifyRefreshToken(refresh_token) → { _id, role }
  Gateway → generateAccessToken({_id, role}) → res.cookie('access_token', ...)
  ← res.success({ message: 'Access token refreshed' })  [Set-Cookie: access_token]
```
