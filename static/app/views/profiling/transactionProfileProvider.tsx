import {useState} from 'react';
import {Outlet} from 'react-router-dom';

import {ProfileHeader} from 'sentry/components/profiling/profileHeader';
import type {RequestState} from 'sentry/types/core';
import {isSchema, isSentrySampledProfile} from 'sentry/utils/profiling/guards/profile';
import {useTransaction} from 'sentry/utils/profiling/hooks/useTransaction';
import {useOrganization} from 'sentry/utils/useOrganization';
import {useParams} from 'sentry/utils/useParams';
import {LayoutPageWithHiddenFooter} from 'sentry/views/profiling/layoutPageWithHiddenFooter';

import {ProfileTransactionContext, TransactionProfileProvider} from './profilesProvider';

function getIdentifiers(input: Profiling.ProfileInput): {
  traceId?: string;
  transactionId?: string;
} {
  if (isSchema(input)) {
    return {
      transactionId: input.metadata.transactionID || undefined,
      traceId: input.metadata.traceID || undefined,
    };
  }
  if (isSentrySampledProfile(input)) {
    return {
      transactionId: input.transaction.id || undefined,
      traceId: input.transaction.trace_id || undefined,
    };
  }
  return {transactionId: undefined, traceId: undefined};
}

export default function ProfileAndTransactionProvider(): React.ReactElement {
  const organization = useOrganization();
  const params = useParams();

  const projectSlug = params.projectId!;

  const [profile, setProfile] = useState<RequestState<Profiling.ProfileInput>>({
    type: 'initial',
  });

  const {transactionId, traceId} =
    profile.type === 'resolved'
      ? getIdentifiers(profile.data)
      : {transactionId: undefined, traceId: undefined};

  const transactionResult = useTransaction(transactionId, traceId);

  return (
    <TransactionProfileProvider
      orgSlug={organization.slug}
      profileId={params.eventId!}
      projectSlug={projectSlug}
      profile={profile}
      setProfile={setProfile}
    >
      <ProfileTransactionContext value={transactionResult}>
        <LayoutPageWithHiddenFooter flex={1}>
          <ProfileHeader
            eventId={params.eventId!}
            projectId={projectSlug}
            transactionSpan={transactionResult.data.transactionSpan}
          />
          <Outlet />
        </LayoutPageWithHiddenFooter>
      </ProfileTransactionContext>
    </TransactionProfileProvider>
  );
}
