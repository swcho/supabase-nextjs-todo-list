import { DefaultError, QueryKey, useQueries, useQuery, UseQueryOptions, useSuspenseQueries, useSuspenseQuery, UseSuspenseQueryOptions } from "@tanstack/react-query";

export function makeUseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TUseQueryOptions = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  TRestParams = Omit<TUseQueryOptions, 'queryKey' | 'queryFn'>,
>(fn: () => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return [
    (params?: TRestParams) => {
      return useQuery({
        ...fn(),
        ...params,
      } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
    },
    (params?: TRestParams) => {
      return useSuspenseQuery({
        ...fn(),
        ...params,
      } as UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
    },
  ] as const;
}

export function makeUseQueryFamily<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TUseQueryOptions = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  TRestParams = Omit<TUseQueryOptions, 'queryKey' | 'queryFn'>,
  TFnParams = unknown,
>(
  fn: (
    fnParams: TFnParams,
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
) {
  return [
    (fnParams: TFnParams, params?: TRestParams) => {
      return useQuery({
        ...fn(fnParams),
        ...params,
      } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
    },
    (fnParams: TFnParams, params?: TRestParams) => {
      return useSuspenseQuery({
        ...fn(fnParams),
        ...params,
      } as UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
    },
    (fnParamsList: TFnParams[], params?: TRestParams) => {
      return useQueries({
        queries: fnParamsList.map((fnParams) => ({
          ...fn(fnParams),
          ...params,
        })),
      });
    },
    (fnParamsList: TFnParams[], params?: TRestParams) => {
      return useSuspenseQueries({
        queries: fnParamsList.map((fnParams) => ({
          ...fn(fnParams),
          ...params,
        } as UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>)),
        combine: (results) => ({
          data: results.map(({ data }) => data),
        }),
      });
    },
  ] as const;
}

