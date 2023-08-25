import axios from 'axios';

type ContributionOptions = {
  from?: string;
  to?: string;
};

export type ContributionDay = {
  contributionCount: number;
  contributionLevel: ContributionLevelName;
  date: string;
  color: string;
  border: string;
};

const CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const CUSTOM_COLORS: Record<ContributionLevelName, string> = {
  NONE: '#e2e4e7',
  FIRST_QUARTILE: '#94e0a2',
  SECOND_QUARTILE: '#3fbc60',
  THIRD_QUARTILE: '#309b4b',
  FOURTH_QUARTILE: '#1f6a37',
};

type ContributionLevelName = keyof typeof CONTRIBUTION_LEVELS;

export type MonthlyContributions = {
  [key: string]: ContributionDay[];
};

const GITHUB_API_URL = 'https://api.github.com/graphql';

export const getContributionCalendar = async (
  userName: string,
  token: string,
  contributionOptions: ContributionOptions = {},
) => {
  if (!userName || !token) {
    throw new Error('Missing required arguments: userName and token');
  }

  const { from, to } = contributionOptions;

  const query = `
    query($userName:String! $from:DateTime $to:DateTime) {
      user(login: $userName){
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                color
                contributionCount
                contributionLevel
                date
              }
            }
          }
        }
      }
    }
  `;

  const variables = JSON.stringify({ userName, from, to });
  const json = { query, variables };

  try {
    const response = await axios.post(GITHUB_API_URL, json, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const contributionCalendar =
      response.data?.data?.user?.contributionsCollection?.contributionCalendar;

    if (
      !contributionCalendar ||
      !Object.hasOwn(contributionCalendar, 'weeks') ||
      !Object.hasOwn(contributionCalendar, 'totalContributions')
    ) {
      throw new Error('Could not get contributions data');
    }

    const { weeks, totalContributions } = contributionCalendar;

    const monthlyContributions = await groupContributionsByMonth(
      weeks.map((week: { contributionDays: ContributionDay[] }) =>
        week.contributionDays.map((day) => ({
          ...day,
          border: CUSTOM_COLORS[day.contributionLevel],
        })),
      ),
    );

    return {
      monthlyContributions: trimFirstAndLastMonths(monthlyContributions),
      totalContributions,
    };
  } catch (error) {
    console.error('An error occurred while fetching the contributions data:', error);
    throw error;
  }
};

const groupContributionsByMonth = async (
  contributions: ContributionDay[][],
): Promise<MonthlyContributions> => {
  const monthlyContributions: MonthlyContributions = {};

  contributions.forEach((week) => {
    week.forEach((day) => {
      const month = new Date(day.date).toLocaleString('en-US', { month: 'long' }); // "May"

      if (!monthlyContributions[month]) {
        monthlyContributions[month] = [];
      }

      monthlyContributions[month].push(day);
    });
  });

  return monthlyContributions;
};

const trimFirstAndLastMonths = (monthlyContributions: MonthlyContributions) => {
  const keys = Object.keys(monthlyContributions);
  delete monthlyContributions[keys[0]];
  delete monthlyContributions[keys[keys.length - 1]];

  return monthlyContributions;
};
