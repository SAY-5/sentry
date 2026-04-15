import {usePageFilters} from 'sentry/components/pageFilters/usePageFilters';
import type {Tag, TagCollection} from 'sentry/types/group';
import {useMutation, useQueryClient} from 'sentry/utils/queryClient';
import {TRACE_ITEM_ATTRIBUTE_STALE_TIME} from 'sentry/views/explore/constants';
import {
  getTraceItemTagCollection,
  useTraceItemAttributeKeysOptions,
} from 'sentry/views/explore/hooks/useTraceItemAttributeKeysOptions';
import type {UseTraceItemAttributeBaseProps} from 'sentry/views/explore/types';

interface UseGetTraceItemAttributeKeysProps extends UseTraceItemAttributeBaseProps {
  projectIds?: Array<string | number>;
  query?: string;
}

export function useGetTraceItemAttributeKeys({
  traceItemType,
  projectIds,
  type,
  query,
}: UseGetTraceItemAttributeKeysProps) {
  const {selection} = usePageFilters();
  const queryClient = useQueryClient();

  const traceItemAttributeKeysOptions = useTraceItemAttributeKeysOptions();
  const {mutateAsync: getTraceItemAttributeKeys} = useMutation({
    mutationFn: async (queryString?: string): Promise<TagCollection> => {
      let result: Tag[];
      try {
        const {json} = await queryClient.fetchQuery({
          ...traceItemAttributeKeysOptions({
            traceItemType,
            type,
            projectIds: projectIds ?? selection.projects,
            search: queryString,
            query,
            staleTime: TRACE_ITEM_ATTRIBUTE_STALE_TIME,
          }),
        });
        result = json;
      } catch (e) {
        throw new Error(`Unable to fetch trace item attribute keys: ${e}`);
      }

      return getTraceItemTagCollection(result, type);
    },
  });

  return getTraceItemAttributeKeys;
}
