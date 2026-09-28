import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query'
import { asList, type PaginatedResponse } from './contracts'

export const paginationMeta = Symbol('paginationMeta')
export type PaginatedRows<T> = T[] & {
  [paginationMeta]: { hasMore: boolean; loadingMore: boolean; loadMore: () => void }
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: {
  queryKey: QueryKey
  queryFn: (page: number) => Promise<PaginatedResponse<T> | T[]>
  enabled?: boolean
}) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage, pages) => Array.isArray(lastPage) || !lastPage.next ? undefined : pages.length + 1,
  })
  const rows = Object.assign(
    query.data?.pages.flatMap(asList) ?? [],
    { [paginationMeta]: { hasMore: Boolean(query.hasNextPage), loadingMore: query.isFetchingNextPage, loadMore: () => { void query.fetchNextPage() } } },
  ) as PaginatedRows<T>
  return {
    ...query,
    rows,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => query.fetchNextPage(),
  }
}
