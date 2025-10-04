import Contributions from "@/components/Bento/types/Github.tsx";
import { env } from "@/env.ts";
import { getContributionCalendar } from "@/utils/contributions.tsx";

async function getData() {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 5);

  const contributionOptions = {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };

  try {
    const { monthlyContributions, totalContributions } =
      await getContributionCalendar(
        env.GITHUB_CLIENT_USERNAME,
        env.GITHUB_CLIENT_TOKEN,
        contributionOptions,
      );

    return { monthlyContributions, totalContributions };
  } catch (error) {
    console.error("Failed to load contribution data:", error);
  }
}

export default async function Github() {
  const data = await getData();

  if (!data) {
    return <></>;
  }

  return (
    <Contributions
      montly={data.monthlyContributions}
      total={data.totalContributions}
    />
  );
}
