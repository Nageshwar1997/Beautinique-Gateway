import {
  AUTH_PROVIDER_MAP,
  AUTH_PROVIDERS,
  CATEGORY_LEVELS,
  CATEGORY_LEVELS_MAP,
  DRAFT_PRODUCT_STEP_MAP,
  HEADERS_MAP,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  PRODUCT_STATUSES,
  PRODUCT_STATUSES_MAP,
  SORT,
  SORT_MAP,
  USER_ROLE_MAP,
  USER_ROLES,
} from '@beautinique/shared-constants';
import { formatFileSize } from '@beautinique/shared-utils';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';

const {
  base,
  health,
  home,
  wakeUp,
  gateway,
  user_service: { auth, user, default: userServiceBase },
  product_service: { category, product, default: productServiceBase },
  media_service: { default: mediaServiceBase },
} = METHODS_AND_PATHS;
const { login, logout, register, password } = auth;

const successEnvelope = (dataSchema?: object) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    ...(dataSchema && { data: dataSchema }),
  },
});

const errorEnvelope = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    code: { type: 'string', example: 'VALIDATION_ERROR' },
    message: { type: 'string' },
    fieldErrors: { type: 'object', nullable: true },
    globalErrors: { type: 'array', items: { type: 'string' }, nullable: true },
  },
};

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: errorEnvelope } },
});

/* -------------------------------------------------------------------------- */
/*                              Reusable Schemas                              */
/* -------------------------------------------------------------------------- */

const minimalUserSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '65f1c2e4b8f1a2a3b4c5d6e7' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phoneNumber: { type: 'string' },
    avatar: { type: 'string' },
    role: { type: 'string', enum: USER_ROLES, example: USER_ROLE_MAP.USER },
    providers: {
      type: 'array',
      items: { type: 'string', enum: AUTH_PROVIDERS, example: AUTH_PROVIDER_MAP.MANUAL },
    },
  },
};

const otpTokenResponse = {
  '200': {
    description: 'OTP sent. `data` is the opaque session token to send back as `Authorization`.',
    content: {
      'application/json': {
        schema: successEnvelope({ type: 'string', example: 'a1b2c3d4e5f6...' }),
      },
    },
  },
  '502': errorResponse('user-service is unreachable or returned an unexpected error.'),
};

const otpAuthHeader = {
  name: HEADERS_MAP.authorization,
  in: 'header',
  required: true,
  description:
    'The OTP session token returned by the corresponding "send-otp" call (raw or `Bearer <token>`).',
  schema: { type: 'string' },
};

const categorySchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    name: { type: 'string', example: 'Lipstick' },
    slug: { type: 'string', example: 'lipstick' },
    level: { type: 'integer', enum: CATEGORY_LEVELS, example: CATEGORY_LEVELS_MAP.L3 },
    parent: { type: 'string', description: 'Present for level 2 and 3 categories' },
    description: { type: 'string', description: 'Only meaningful for level 3 categories' },
  },
};

const categoryHierarchySchema = {
  ...categorySchema,
  properties: {
    ...categorySchema.properties,
    subcategories: { type: 'array', items: { type: 'object' }, description: 'Nested recursively' },
  },
};

const createCategoryBodySchema = {
  type: 'object',
  required: ['name', 'level'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 120 },
    level: { type: 'integer', enum: CATEGORY_LEVELS },
    parent: {
      type: 'string',
      description: 'Required for level 2 and 3, must be one level shallower',
    },
    description: { type: 'string', minLength: 10, maxLength: 150, description: 'Level 3 only' },
  },
};

const updateCategoryBodySchema = {
  type: 'object',
  required: ['level'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 120 },
    level: {
      type: 'integer',
      enum: CATEGORY_LEVELS,
      description: 'Must match the existing category - immutable',
    },
    parent: {
      type: 'string',
      nullable: true,
      description: 'Only touched when this key is present in the request body at all',
    },
    description: { type: 'string', minLength: 10, maxLength: 150, description: 'Level 3 only' },
  },
};

const draftProductStepBodySchema = {
  description:
    'One step of the multi-step draft, discriminated by the string `step` field - exactly one ' +
    'of `basicInfo` / `mediaAndGallery` / `descriptionAndContent` / `stockAndVariants` / ' +
    "`tryOnConfiguration` per request. See product-service's own OpenAPI doc " +
    '(`src/reference/product-service/openapi.ts` in this repo) for the full per-step shape - ' +
    'this gateway forwards the body unmodified.',
  type: 'object',
  required: ['step'],
  properties: {
    step: { type: 'string', enum: Object.values(DRAFT_PRODUCT_STEP_MAP) },
  },
  additionalProperties: true,
};

const productSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    sku: { type: 'string' },
    brand: { type: 'string' },
    originalPrice: { type: 'number' },
    sellingPrice: { type: 'number' },
    discount: { type: 'number' },
    slug: { type: 'string' },
    images: { type: 'array', items: { type: 'string', format: 'uri' } },
    thumbnail: { type: 'string', format: 'uri' },
    category: { type: 'string', description: 'Category id (level 3)' },
    seller: { type: 'string' },
    hasVariants: { type: 'boolean' },
    status: { type: 'string', enum: PRODUCT_STATUSES },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const paginationSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 10 },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
};

const statusCountsSchema = {
  type: 'object',
  properties: {
    ALL: { type: 'integer' },
    [PRODUCT_STATUSES_MAP.DELETED]: { type: 'integer' },
    [PRODUCT_STATUSES_MAP.PENDING]: { type: 'integer' },
    [PRODUCT_STATUSES_MAP.PUBLISHED]: { type: 'integer' },
    [PRODUCT_STATUSES_MAP.REJECTED]: { type: 'integer' },
    [PRODUCT_STATUSES_MAP.BLOCKED]: { type: 'integer' },
  },
};

/* -------------------------------------------------------------------------- */
/*                              Path Parameters                               */
/* -------------------------------------------------------------------------- */

const categoryIdParam = {
  name: 'categoryId',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const slugParam = {
  name: 'slug',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const loginRoleHeader = {
  name: HEADERS_MAP.loginRole,
  in: 'header',
  required: false,
  description: 'If set, the logged-in user must have this role (MASTER always allowed).',
  schema: { type: 'string', enum: USER_ROLES, example: USER_ROLE_MAP.USER },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Beautinique Gateway API',
    version: '1.0.0',
    description:
      'Single public entry point for the Beautinique platform. Issues/verifies the browser session ' +
      '(JWT `access_token`/`refresh_token` cookies) and translates it into the `X-Service-Secret`/' +
      '`X-User-Id`/`X-User-Role` headers `user-service` and `product-service` trust, or streams ' +
      'requests straight through to `media-service` for uploads. This gateway has no database of its ' +
      'own - see the [README](/) for the full request/response flow through each downstream service.',
  },
  servers: [{ url: '/', description: 'This service' }],
  tags: [
    {
      name: 'Gateway',
      description: "This gateway's own endpoints - health, wake-up, token refresh. Not proxied.",
    },
    { name: 'User Service: Login', description: 'Manual and OAuth login. Proxied to user-service.' },
    {
      name: 'User Service: Register',
      description: 'OTP-based registration. Proxied to user-service.',
    },
    {
      name: 'User Service: Password',
      description: 'Forgot / change / set password. Proxied to user-service.',
    },
    { name: 'User Service: Logout', description: 'Session invalidation. Proxied to user-service.' },
    {
      name: 'User Service: Session',
      description: "Current user's session lookup. Proxied to user-service.",
    },
    {
      name: 'Product Service: Category',
      description: 'Category tree management (L1/L2/L3). Proxied to product-service.',
    },
    {
      name: 'Product Service: Product',
      description: 'Draft/dashboard/public product endpoints. Proxied to product-service.',
    },
    {
      name: 'Media Service: Upload',
      description: 'File upload, streamed to media-service.',
    },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: COOKIES_DATA.access_token.name,
        description: 'Short-lived (15 min) JWT set on login/register/password-success/refresh.',
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: COOKIES_DATA.refresh_token.name,
        description: 'Long-lived (7 day) JWT, read only by the refresh-access-token endpoint.',
      },
    },
  },
  paths: {
    [home.path]: {
      [home.method]: {
        tags: ['Gateway'],
        summary: 'This README, rendered to HTML',
        responses: { '200': { description: 'The rendered README.' } },
      },
    },
    [health.path]: {
      [health.method]: {
        tags: ['Gateway'],
        summary: 'Liveness check',
        responses: {
          '200': {
            description: 'This service is up (it has no dependencies to report on).',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: { service: { type: 'string', example: 'gateway' } },
                }),
              },
            },
          },
        },
      },
    },
    [wakeUp.path]: {
      [wakeUp.method]: {
        tags: ['Gateway'],
        summary: 'Aggregate downstream service health',
        description:
          'Pings `{service}/health` on user-service, product-service, media-service and mail-service ' +
          'in parallel and reports UP/DEGRADED overall. Not wrapped in the usual success envelope.',
        responses: {
          '200': {
            description:
              'Aggregated status (also returned with 500 if the aggregation itself throws).',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['UP', 'DEGRADED', 'DOWN'] },
                    gateway: { type: 'string', enum: ['UP', 'DOWN'] },
                    services: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          service: { type: 'string' },
                          status: { type: 'string', enum: ['UP', 'DOWN'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    [`${base}${gateway.refreshAccessToken.path}`]: {
      [gateway.refreshAccessToken.method]: {
        tags: ['Gateway'],
        summary: 'Rotate the access token using the refresh token cookie',
        security: [{ refreshTokenCookie: [] }],
        responses: {
          '200': {
            description: 'New `access_token` cookie issued.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired refresh_token cookie.'),
        },
      },
    },

    [`${base}${userServiceBase}${auth.base}${login.base}${login.manual.path}`]: {
      [login.manual.method]: {
        tags: ['User Service: Login'],
        summary: 'Manual email/phone + password login',
        parameters: [loginRoleHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['loginMethod', 'password'],
                properties: {
                  loginMethod: { type: 'string', enum: ['email', 'phoneNumber'] },
                  email: { type: 'string', format: 'email' },
                  phoneNumber: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logged in. `access_token`/`refresh_token` cookies are set.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '400': errorResponse('user-service returned no user for these credentials.'),
          '403': errorResponse('Login role mismatch.'),
          '404': errorResponse('No user found for the given email/phone.'),
          '422': errorResponse('Wrong password, or account has no MANUAL provider linked.'),
        },
      },
    },

    ...(['google', 'linkedin', 'github'] as const).reduce<Record<string, unknown>>(
      (paths, provider) => {
        const { redirect, callback } = login.oauth[provider];

        return {
          ...paths,
          [`${base}${userServiceBase}${auth.base}${login.base}${redirect.path}`]: {
            [redirect.method]: {
              tags: ['User Service: Login'],
              summary: `Redirect to the ${provider} OAuth consent screen`,
              description: 'Not a JSON response - the browser is redirected (302) to the provider.',
              responses: {
                '302': { description: 'Redirect to the OAuth consent URL.' },
              },
            },
          },
          [`${base}${userServiceBase}${auth.base}${login.base}${callback.path}`]: {
            [callback.method]: {
              tags: ['User Service: Login'],
              summary: `${provider} OAuth callback`,
              parameters: [
                {
                  name: 'code',
                  in: 'query',
                  required: true,
                  description: 'Authorization code issued by the provider.',
                  schema: { type: 'string' },
                },
              ],
              responses: {
                '302': {
                  description:
                    'Redirects to `{CLIENT_BASE_URL}/auth/oauth?success=true` (cookies set) or ' +
                    '`?error=true&message=...` (URL-encoded) on failure - never a JSON body.',
                },
              },
            },
          },
        };
      },
      {},
    ),

    [`${base}${userServiceBase}${auth.base}${logout.path}`]: {
      [logout.method]: {
        tags: ['User Service: Logout'],
        summary: "Invalidate the caller's session",
        security: [{ accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'Auth cookies cleared, downstream session dropped.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
        },
      },
    },

    [`${base}${userServiceBase}${auth.base}${register.base}${register.sendOtp.path}`]: {
      [register.sendOtp.method]: {
        tags: ['User Service: Register'],
        summary: 'Start registration: send an OTP to email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          ...otpTokenResponse,
          '409': errorResponse('A MANUAL account already exists for this email.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${register.base}${register.resendOtp.path}`]: {
      [register.resendOtp.method]: {
        tags: ['User Service: Register'],
        summary: 'Resend the registration OTP',
        parameters: [otpAuthHeader],
        responses: {
          '200': {
            description: 'OTP resent. `data` is the new send count.',
            content: { 'application/json': { schema: successEnvelope({ type: 'integer' }) } },
          },
          '400': errorResponse('Missing Authorization header.'),
          '422': errorResponse('Missing/invalid token, or OTP session expired.'),
          '429': errorResponse('Resent more than MAX_OTP_RESEND (3) times.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${register.base}${register.verifyOtp.path}`]: {
      [register.verifyOtp.method]: {
        tags: ['User Service: Register'],
        summary: 'Verify the registration OTP',
        parameters: [otpAuthHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otp'],
                properties: { otp: { type: 'string', example: '123456' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP matches.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '400': errorResponse('Missing Authorization header.'),
          '422': errorResponse('Missing/invalid token, or OTP is wrong/expired.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${register.base}${register.saveUser.path}`]: {
      [register.saveUser.method]: {
        tags: ['User Service: Register'],
        summary: 'Complete registration (after OTP verification)',
        parameters: [otpAuthHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'password', 'phoneNumber'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                  phoneNumber: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User created. `access_token`/`refresh_token` cookies are set.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '400': errorResponse('Missing Authorization header, or no user returned.'),
          '409': errorResponse('Phone number, or a MANUAL account for this email, already exists.'),
          '422': errorResponse('Missing/invalid token, or OTP session expired.'),
        },
      },
    },

    [`${base}${userServiceBase}${auth.base}${password.base}${password.forgot.sendOtp.path}`]: {
      [password.forgot.sendOtp.method]: {
        tags: ['User Service: Password'],
        summary: 'Start forgot-password: send an OTP to email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          ...otpTokenResponse,
          '422': errorResponse('Account exists but has no MANUAL provider linked.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${password.base}${password.forgot.resendOtp.path}`]: {
      [password.forgot.resendOtp.method]: {
        tags: ['User Service: Password'],
        summary: 'Resend the forgot-password OTP',
        parameters: [otpAuthHeader],
        responses: {
          '200': {
            description: 'OTP resent. `data` is the new send count.',
            content: { 'application/json': { schema: successEnvelope({ type: 'integer' }) } },
          },
          '400': errorResponse('Missing Authorization header.'),
          '422': errorResponse('Missing/invalid token, or OTP session expired.'),
          '429': errorResponse('Resent more than MAX_OTP_RESEND (3) times.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${password.base}${password.forgot.verifyOtp.path}`]: {
      [password.forgot.verifyOtp.method]: {
        tags: ['User Service: Password'],
        summary: 'Verify the forgot-password OTP',
        parameters: [otpAuthHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otp'],
                properties: { otp: { type: 'string', example: '123456' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP matches.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '400': errorResponse('Missing Authorization header.'),
          '422': errorResponse('Missing/invalid token, or OTP is wrong/expired.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${password.base}${password.forgot.save.path}`]: {
      [password.forgot.save.method]: {
        tags: ['User Service: Password'],
        summary: 'Set a new password (after OTP verification)',
        parameters: [otpAuthHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: { password: { type: 'string', format: 'password' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated. `access_token`/`refresh_token` cookies are set.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '400': errorResponse('Missing Authorization header, or no user returned.'),
          '404': errorResponse('No user found for the OTP session email.'),
          '422': errorResponse(
            'Missing/invalid token/session, or new password equals the old one.',
          ),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${password.base}${password.change.path}`]: {
      [password.change.method]: {
        tags: ['User Service: Password'],
        summary: 'Change password while logged in',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'password'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated. Auth cookies re-issued.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '422': errorResponse('Wrong current password, or new password equals the current one.'),
        },
      },
    },
    [`${base}${userServiceBase}${auth.base}${password.base}${password.set.path}`]: {
      [password.set.method]: {
        tags: ['User Service: Password'],
        summary: 'Set an initial password for an OAuth-only account',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: { password: { type: 'string', format: 'password' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password set. Auth cookies re-issued.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '422': errorResponse('MANUAL provider is already linked - use forgot-password instead.'),
        },
      },
    },

    [`${base}${userServiceBase}${user.base}${user.session.path}`]: {
      [user.session.method]: {
        tags: ['User Service: Session'],
        summary: "Fetch the caller's own user record",
        security: [{ accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'From user-service, cache-aside over Redis on their end.',
            content: { 'application/json': { schema: successEnvelope(minimalUserSchema) } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '404': errorResponse('No user found for this id.'),
        },
      },
    },

    [`${base}${productServiceBase}${category.base}`]: {
      [category.add.method]: {
        tags: ['Product Service: Category'],
        summary: 'Create a category',
        description: 'Requires ADMIN or MASTER role.',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: createCategoryBodySchema } },
        },
        responses: {
          '201': {
            description: 'Category created.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/MASTER.'),
          '404': errorResponse('Parent category not found.'),
          '409': errorResponse('A sibling with the same slug already exists.'),
          '422': errorResponse('Invalid parent category for the given level.'),
        },
      },
    },

    [`${base}${productServiceBase}${category.base}${category.update.path.replace(':', '{')}}`]: {
      [category.update.method]: {
        tags: ['Product Service: Category'],
        summary: 'Update a category',
        description: 'Requires ADMIN or MASTER role. `level` is immutable.',
        security: [{ accessTokenCookie: [] }],
        parameters: [categoryIdParam],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: updateCategoryBodySchema } },
        },
        responses: {
          '200': {
            description: 'Category updated.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/MASTER.'),
          '404': errorResponse('Category or parent category not found.'),
          '409': errorResponse('Duplicate slug, self-parenting, or a level change was attempted.'),
          '422': errorResponse('Invalid parent category for the given level.'),
        },
      },
      [category.delete.method]: {
        tags: ['Product Service: Category'],
        summary: 'Delete a category',
        description:
          'Requires ADMIN or MASTER role. Only a leaf category with zero products can be deleted.',
        security: [{ accessTokenCookie: [] }],
        parameters: [categoryIdParam],
        responses: {
          '200': {
            description: 'Category deleted.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/MASTER.'),
          '404': errorResponse('Category not found.'),
          '422': errorResponse(
            'Category has child categories or (for level 3) still has products.',
          ),
        },
      },
    },

    [`${base}${productServiceBase}${category.base}${category.get.byParentLevel.path}`]: {
      [category.get.byParentLevel.method]: {
        tags: ['Product Service: Category'],
        summary: 'List categories by parent + level',
        description: 'Requires ADMIN, MASTER, or SELLER role.',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'level', in: 'query', schema: { type: 'integer', enum: CATEGORY_LEVELS } },
          {
            name: 'parent',
            in: 'query',
            schema: { type: 'string' },
            description: 'Required for level 2/3',
          },
        ],
        responses: {
          '200': {
            description: 'Matching categories.',
            content: {
              'application/json': {
                schema: successEnvelope({ type: 'array', items: categorySchema }),
              },
            },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
        },
      },
    },

    [`${base}${productServiceBase}${category.base}${category.get.byHierarchy.path}`]: {
      [category.get.byHierarchy.method]: {
        tags: ['Product Service: Category'],
        summary: 'Full L1 -> L2 -> L3 category tree',
        responses: {
          '200': {
            description: 'Nested category hierarchy, rooted at level 1.',
            content: {
              'application/json': {
                schema: successEnvelope({ type: 'array', items: categoryHierarchySchema }),
              },
            },
          },
        },
      },
    },

    [`${base}${productServiceBase}${product.base}${product.draft.base}`]: {
      [product.draft.save.method]: {
        tags: ['Product Service: Product'],
        summary: 'Save one step of a multi-step draft',
        description:
          'Requires ADMIN, SELLER, or MASTER role. Accumulates into a per-user server-side draft.',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: draftProductStepBodySchema } },
        },
        responses: {
          '201': {
            description: 'Step saved; returns the accumulated draft so far.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
        },
      },
      [product.draft.get.method]: {
        tags: ['Product Service: Product'],
        summary: "Fetch the caller's in-progress draft",
        description: 'Requires ADMIN, SELLER, or MASTER role.',
        security: [{ accessTokenCookie: [] }],
        responses: {
          '200': {
            description: 'The current draft, or null fields if nothing has been saved yet.',
            content: { 'application/json': { schema: successEnvelope() } },
          },
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
        },
      },
    },

    [`${base}${productServiceBase}${product.base}${product.draft.base}${product.draft.publish.path}`]:
      {
        [product.draft.publish.method]: {
          tags: ['Product Service: Product'],
          summary: 'Publish a completed draft as a real product',
          description:
            'Requires ADMIN, SELLER, or MASTER role. The full draft is assembled server-side from ' +
            'the previously-saved steps - the client does not send a body. Status is PUBLISHED ' +
            'directly for ADMIN/MASTER, or PENDING (awaiting approval) for SELLER.',
          security: [{ accessTokenCookie: [] }],
          responses: {
            '201': {
              description: 'Product created.',
              content: { 'application/json': { schema: successEnvelope(productSchema) } },
            },
            '401': errorResponse('Missing/invalid/expired access_token cookie.'),
            '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
            '404': errorResponse('Draft expired or was never started.'),
            '422': errorResponse(
              'Validation failed for the assembled product (price, variants, try-on, ...).',
            ),
          },
        },
      },

    [`${base}${productServiceBase}${product.base}${product.get.dashboard.base}${product.get.dashboard.products.path}`]:
      {
        [product.get.dashboard.products.method]: {
          tags: ['Product Service: Product'],
          summary: 'Paginated/sortable/searchable product listing',
          description:
            'Requires ADMIN, SELLER, or MASTER role. Sellers only see their own products.',
          security: [{ accessTokenCookie: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: PRODUCT_STATUSES },
            },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            {
              name: 'sortBy',
              in: 'query',
              schema: {
                type: 'string',
                enum: [
                  'createdAt',
                  'updatedAt',
                  'title',
                  'sellingPrice',
                  'originalPrice',
                  'soldCount',
                ],
                default: 'createdAt',
              },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: SORT, default: SORT_MAP.desc },
            },
          ],
          responses: {
            '200': {
              description: 'A page of products, plus pagination info and a status-count summary.',
              content: {
                'application/json': {
                  schema: successEnvelope({
                    type: 'object',
                    properties: {
                      products: { type: 'array', items: productSchema },
                      pagination: paginationSchema,
                      counts: statusCountsSchema,
                    },
                  }),
                },
              },
            },
            '401': errorResponse('Missing/invalid/expired access_token cookie.'),
            '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
          },
        },
      },

    [`${base}${productServiceBase}${product.base}${product.get.dashboard.base}${product.get.dashboard.bySlug.path.replace(':', '{')}}`]:
      {
        [product.get.dashboard.bySlug.method]: {
          tags: ['Product Service: Product'],
          summary: 'Single product lookup for the dashboard',
          description: 'Requires ADMIN, SELLER, or MASTER role.',
          security: [{ accessTokenCookie: [] }],
          parameters: [slugParam],
          responses: {
            '200': {
              description: 'The product.',
              content: { 'application/json': { schema: successEnvelope(productSchema) } },
            },
            '401': errorResponse('Missing/invalid/expired access_token cookie.'),
            '403': errorResponse('Role not in ADMIN/SELLER/MASTER.'),
            '404': errorResponse('Product not found or not published.'),
          },
        },
      },

    [`${base}${productServiceBase}${product.base}${product.get.bySlug.path.replace(':', '{')}}`]: {
      [product.get.bySlug.method]: {
        tags: ['Product Service: Product'],
        summary: 'Public storefront product lookup',
        description: 'Only ever returns PUBLISHED products. No authentication required.',
        responses: {
          '200': {
            description: 'The published product, with its category name populated.',
            content: { 'application/json': { schema: successEnvelope(productSchema) } },
          },
          '404': errorResponse('Product not found or not published.'),
        },
      },
    },

    [`${base}${productServiceBase}${product.base}${product.get.suggestions.path}`]: {
      [product.get.suggestions.method]: {
        tags: ['Product Service: Product'],
        summary: 'Autocomplete search suggestions',
        description: 'Atlas Search across title/brand/slug/shortDescription. Max 5 results.',
        parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Up to 5 matching published products (empty array if `search` is blank).',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      title: { type: 'string' },
                      slug: { type: 'string' },
                      thumbnail: { type: 'string', format: 'uri' },
                      brand: { type: 'string' },
                    },
                  },
                }),
              },
            },
          },
        },
      },
    },

    [`${base}${mediaServiceBase}/upload/single`]: {
      post: {
        tags: ['Media Service: Upload'],
        summary: 'Upload a single image or video',
        description:
          'Streamed 1:1 to media-service via a raw HTTP proxy (see README §12) - any role is ' +
          'accepted, the request body is never parsed by this gateway.',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'folder'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: `Image (≤${formatFileSize(MAX_IMAGE_SIZE)}) or video (≤${formatFileSize(MAX_VIDEO_SIZE)}).`,
                  },
                  folder: {
                    type: 'string',
                    example: 'products',
                    description: 'Cloudinary subfolder, e.g. "products".',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Uploaded successfully.',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'string',
                  format: 'uri',
                  example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                }),
              },
            },
          },
          '400': errorResponse('Missing/empty body or file, or failed validation.'),
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '413': errorResponse('File exceeds the allowed size for its type.'),
          '502': errorResponse('media-service is currently unavailable.'),
        },
      },
    },
    [`${base}${mediaServiceBase}/upload/multiple`]: {
      post: {
        tags: ['Media Service: Upload'],
        summary: 'Upload several images/videos at once',
        description: 'Streamed 1:1 to media-service via a raw HTTP proxy (see README §12).',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files', 'folder'],
                properties: {
                  files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: `Any mix of images (≤${formatFileSize(MAX_IMAGE_SIZE)} each) and videos (≤${formatFileSize(MAX_VIDEO_SIZE)} each).`,
                  },
                  folder: {
                    type: 'string',
                    example: 'products',
                    description: 'Cloudinary subfolder, e.g. "products".',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description:
              'All files uploaded successfully (all-or-nothing - a single failure rolls back the rest).',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'array',
                  items: { type: 'string', format: 'uri' },
                }),
              },
            },
          },
          '400': errorResponse('Missing/empty body or file, or failed validation.'),
          '401': errorResponse('Missing/invalid/expired access_token cookie.'),
          '413': errorResponse('A file exceeds the allowed size for its type.'),
          '502': errorResponse('media-service is currently unavailable.'),
        },
      },
    },
  },
};
