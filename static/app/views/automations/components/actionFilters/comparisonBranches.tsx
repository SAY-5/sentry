import styled from '@emotion/styled';

import {AutomationBuilderNumberInput} from 'sentry/components/workflowEngine/form/automationBuilderNumberInput';
import {AutomationBuilderSelect} from 'sentry/components/workflowEngine/form/automationBuilderSelect';
import {t, tct} from 'sentry/locale';
import type {SelectValue} from 'sentry/types/core';
import {
  COMPARISON_INTERVAL_CHOICES,
  INTERVAL_CHOICES,
} from 'sentry/views/automations/components/actionFilters/constants';
import {useAutomationBuilderErrorContext} from 'sentry/views/automations/components/automationBuilderErrorContext';
import {useDataConditionNodeContext} from 'sentry/views/automations/components/dataConditionNodes';

interface BranchProps {
  comparisonIntervalChoices?: typeof COMPARISON_INTERVAL_CHOICES;
  intervalChoices?: typeof INTERVAL_CHOICES;
}

export function CountBranch({intervalChoices}: BranchProps) {
  return tct('more than [value] [interval]', {
    value: <ValueField />,
    interval: <IntervalField intervalChoices={intervalChoices} />,
  });
}

export function PercentBranch({intervalChoices, comparisonIntervalChoices}: BranchProps) {
  return tct('[value] higher [interval] compared to [comparison_interval]', {
    value: <PercentValueField />,
    interval: <IntervalField intervalChoices={intervalChoices} />,
    comparison_interval: (
      <ComparisonIntervalField comparisonIntervalChoices={comparisonIntervalChoices} />
    ),
  });
}

function ValueField() {
  const {condition, condition_id, onUpdate} = useDataConditionNodeContext();
  const {removeError} = useAutomationBuilderErrorContext();

  return (
    <AutomationBuilderNumberInput
      name={`${condition_id}.comparison.value`}
      aria-label={t('Value')}
      value={condition.comparison.value}
      min={1}
      step={1}
      onChange={(value: number) => {
        onUpdate({comparison: {...condition.comparison, value}});
        removeError(condition.id);
      }}
    />
  );
}

function PercentValueField() {
  return (
    <PercentWrapper>
      <ValueField />%
    </PercentWrapper>
  );
}

function IntervalField({
  intervalChoices = INTERVAL_CHOICES,
}: {
  intervalChoices?: typeof INTERVAL_CHOICES;
}) {
  const {condition, condition_id, onUpdate} = useDataConditionNodeContext();
  const {removeError} = useAutomationBuilderErrorContext();

  return (
    <AutomationBuilderSelect
      name={`${condition_id}.comparison.interval`}
      aria-label={t('Interval')}
      value={condition.comparison.interval}
      options={intervalChoices}
      onChange={(option: SelectValue<string>) => {
        onUpdate({comparison: {...condition.comparison, interval: option.value}});
        removeError(condition.id);
      }}
    />
  );
}

function ComparisonIntervalField({
  comparisonIntervalChoices = COMPARISON_INTERVAL_CHOICES,
}: {
  comparisonIntervalChoices?: typeof COMPARISON_INTERVAL_CHOICES;
}) {
  const {condition, condition_id, onUpdate} = useDataConditionNodeContext();
  const {removeError} = useAutomationBuilderErrorContext();

  return (
    <AutomationBuilderSelect
      name={`${condition_id}.comparison.comparisonInterval`}
      aria-label={t('Comparison interval')}
      value={condition.comparison.comparisonInterval}
      options={comparisonIntervalChoices}
      onChange={(option: SelectValue<string>) => {
        onUpdate({
          comparison: {...condition.comparison, comparisonInterval: option.value},
        });
        removeError(condition.id);
      }}
    />
  );
}

const PercentWrapper = styled('div')`
  display: inline-flex;
  align-items: center;
  gap: ${p => p.theme.space.xs};
`;
