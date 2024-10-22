import type { TContributionDay, TMonthlyContributions } from '@/types/types';

import Bento from '@/components/Bento/Bento';
import { ButtonPrimary } from '@/components/Button';

const MONTH_RANGE = 5;

interface MonthlyContributionProps {
  contributions: TMonthlyContributions;
}

const MonthlyContribution = ({ contributions }: MonthlyContributionProps) => (
  <div className="grid grid-cols-4 gap-2">
    {Object.keys(contributions).map((month) => (
      <div key={month}>
        <p className="text-2xs text-dark_grey">{month}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {contributions[month].map((contribution: TContributionDay, i: number) => (
            <div
              className={`h-2.5 w-2.5 rounded-sm drop-shadow-sm`}
              key={i}
              style={{
                backgroundColor: contribution.color,
                border: `1px solid ${contribution.border}`,
              }}
            ></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default async function Github({
  total,
  montly,
}: {
  total: number;
  montly: TMonthlyContributions;
}) {
  return (
    <Bento
      size="1x1"
      className="bento flex flex-col justify-between p-5"
      icon="github"
      href="https://github.com/rikvermeulen"
    >
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">Github</h3>
          <p className="text-xs text-dark_grey">
            {total} contributions in the last {MONTH_RANGE} months
          </p>
        </div>
      </header>
      <MonthlyContribution contributions={montly} />
      <ButtonPrimary
        className="mt-2 self-start"
        label="Follow"
        href="https://github.com/rikvermeulen"
        external
      />
    </Bento>
  );
}
