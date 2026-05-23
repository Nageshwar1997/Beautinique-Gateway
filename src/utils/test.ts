import { METHODS_AND_PATHS } from '../constants';

type TStrRecord = Record<string, string | number>;

interface IEndpoint {
  method: string;
  path: string;
}

type TRouteNode = Record<string, unknown> & {
  base?: string;
};

type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Record<Param | keyof ExtractRouteParams<`/${Rest}`>, string | number>
  : T extends `${string}:${infer Param}`
    ? Record<Param, string | number>
    : Record<string, never>;

interface TGeneratedEndpoint<T extends IEndpoint, FullPath extends string> {
  method: T['method'];

  getUrl: (params?: ExtractRouteParams<FullPath>) => FullPath;
}

type TGenerateRoutes<T, ParentPath extends string = ''> = {
  [K in keyof T as K extends 'base' ? never : K]: T[K] extends IEndpoint
    ? TGeneratedEndpoint<T[K], `${ParentPath}${T[K]['path']}`>
    : T[K] extends Record<string, unknown>
      ? TGenerateRoutes<
          T[K],
          `${ParentPath}${T[K] extends {
            base: infer B;
          }
            ? B extends string
              ? B
              : ''
            : ''}`
        >
      : never;
};

const joinPaths = (...paths: (string | undefined)[]) =>
  paths.filter(Boolean).join('/').replace(/\/+/g, '/').replace(/\/$/, '');

const isEndpoint = (value: unknown): value is IEndpoint => {
  return typeof value === 'object' && value !== null && 'path' in value && 'method' in value;
};

const buildDynamicUrl = <TPath extends string>(path: TPath, params?: TStrRecord): TPath => {
  if (!params) {
    return path;
  }

  let result = path as string;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });

  return result as TPath;
};

export const createGatewayHelper = <T extends Record<string, unknown>>(
  config: T,
): TGenerateRoutes<T> => {
  const build = (node: TRouteNode, parents: string[] = []): Record<string, unknown> => {
    const currentBase = node.base ? [...parents, node.base] : parents;

    const result: Record<string, unknown> = {};

    Object.entries(node).forEach(([key, value]) => {
      if (isEndpoint(value)) {
        const fullPath = joinPaths(...currentBase, value.path);

        result[key] = {
          method: value.method,

          getUrl: (params?: TStrRecord) => buildDynamicUrl(fullPath, params),
        };

        return;
      }

      if (typeof value === 'object' && value !== null) {
        result[key] = build(value as TRouteNode, currentBase);
      }
    });

    return result;
  };

  return build(config) as TGenerateRoutes<T>;
};

export const ROUTES = createGatewayHelper(METHODS_AND_PATHS);
