import {useMemo} from 'react';

import {MutableSearch} from 'sentry/utils/tokenizeSearch';
import {useSpans} from 'sentry/views/insights/common/queries/useDiscover';
import {SpanFields} from 'sentry/views/insights/types';

export type TransactionResult = ReturnType<typeof useTransaction>;
export type TransactionData = TransactionResult['data'];
export type TransactionSpan = NonNullable<TransactionData['transactionSpan']>;

export function useTransaction(transactionId?: string, traceId?: string) {
  const search = useMemo(() => {
    if (!transactionId || !traceId) {
      return undefined;
    }
    const s = new MutableSearch('');
    s.setFilterValues(SpanFields.TRACE, [traceId]);
    s.setFilterValues('transaction.event_id', [transactionId]);
    return s;
  }, [transactionId, traceId]);

  const result = useSpans(
    {
      search,
      fields: [
        SpanFields.TRACE,
        SpanFields.SPAN_ID,
        SpanFields.IS_TRANSACTION,
        SpanFields.SPAN_OP,
        SpanFields.SPAN_DESCRIPTION,
        SpanFields.PRECISE_START_TS,
        SpanFields.PRECISE_FINISH_TS,
        SpanFields.SPAN_SELF_TIME,
        SpanFields.SDK_NAME,
        SpanFields.TRACE_PARENT_SPAN,
        SpanFields.TRANSACTION_EVENT_ID,
        SpanFields.RELEASE,
        SpanFields.ENVIRONMENT,
        SpanFields.OS_NAME,
        SpanFields.DEVICE_MODEL,
        SpanFields.DEVICE_MANUFACTURER,
      ],
      sorts: [
        {
          field: SpanFields.PRECISE_START_TS,
          kind: 'asc',
        },
      ],
      queryWithoutPageFilters: true,
      enabled: !!search,
    },
    'api.profiles.transaction'
  );
  const transactionSpan = result.data.find(row => row[SpanFields.IS_TRANSACTION]);
  const childSpans = result.data.filter(row => !row[SpanFields.IS_TRANSACTION]);
  return {
    ...result,
    data: {
      childSpans,
      transactionSpan,
    },
  };
}
