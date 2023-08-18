import { env } from 'env.mjs';

import Contributions from '@/components/Bento/types/Github';
import { getContributionCalendar } from '@/utils/contributions';

async function getData() {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 5);

  const contributionOptions = {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };

  try {
    const { monthlyContributions, totalContributions } = await getContributionCalendar(
      env.GITHUB_CLIENT_USERNAME,
      env.GITHUB_CLIENT_TOKEN,
      contributionOptions,
    );

    return { monthlyContributions, totalContributions };
  } catch (error) {
    console.error('Failed to load contribution data:', error);
  }
}

export default async function Github() {
  const data = await getData();

  if (!data) return <></>;

  return <Contributions total={data.totalContributions} montly={data.monthlyContributions} />;
}
