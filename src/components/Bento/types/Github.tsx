import Image from 'next/image';
import Link from 'next/link';
import { env } from 'env.mjs';

import Bento from '@/components/Bento/Bento';
import Button from '@/components/Button';
import {
  getContributionCalendar,
  type ContributionDay,
  type MonthlyContributions,
} from '@/utils/contributions';

const MONTH_RANGE = 5;

interface MonthlyContributionProps {
  contributions: MonthlyContributions;
}

const MonthlyContribution = ({ contributions }: MonthlyContributionProps) => (
  <div className="grid grid-cols-4 gap-2">
    {Object.keys(contributions).map((month) => (
      <div key={month}>
        <p className="text-[10px] text-dark_grey">{month}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {contributions[month].map((contribution: ContributionDay, i: number) => (
            <div
              className={`h-2.5 w-2.5 rounded-sm drop-shadow-sm`}
              key={i}
              style={{ backgroundColor: contribution.color }}
            ></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default async function Github() {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - MONTH_RANGE);

  const contributionOptions = {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };

  let monthlyContributions = {};
  let totalContributions = 0;

  try {
    ({ monthlyContributions, totalContributions } = await getContributionCalendar(
      env.GITHUB_CLIENT_USERNAME,
      env.GITHUB_CLIENT_TOKEN,
      contributionOptions,
    ));
  } catch (error) {
    console.error('Failed to load contribution data:', error);
  }

  return (
    <Bento size="1x1" className="bento flex flex-col justify-between p-5">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">Github</h3>
          <p className="text-xs text-dark_grey">
            {totalContributions} contributions in the last {MONTH_RANGE} months
          </p>
        </div>
        <Link href="https://github.com/rikvermeulen">
          <Image
            src={'/images/icons/github.png'}
            alt="github"
            width="32"
            height="32"
            className="cursor-pointer rounded-md drop-shadow-md transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </header>
      <MonthlyContribution contributions={monthlyContributions} />
      <Button className="mt-2 self-start" label="Follow" href="https://github.com/rikvermeulen" />
    </Bento>
  );
}
