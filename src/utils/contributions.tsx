import axios from 'axios';

import {
  TContributionDay,
  TContributionLevelName,
  TContributionOptions,
  TMonthlyContributions,
} from '@/types/types';

export type TWeek = {
  contributionDays: TContributionDay[];
};

export const CUSTOM_COLORS: Record<TContributionLevelName, string> = {
  NONE: '#e2e4e7',
  FIRST_QUARTILE: '#94e0a2',
  SECOND_QUARTILE: '#3fbc60',
  THIRD_QUARTILE: '#309b4b',
  FOURTH_QUARTILE: '#1f6a37',
};

const GITHUB_API_URL = 'https://api.github.com/graphql';

const QUERY = `
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

class GitHubApiError extends Error {}

export const getContributionCalendar = async (
  userName: string,
  token: string,
  contributionOptions: TContributionOptions = {},
) => {
  if (!userName || !token) {
    throw new GitHubApiError('Missing required arguments: userName and token');
  }

  const { from, to } = contributionOptions;
  const variables = JSON.stringify({ userName, from, to });
  const json = { query: QUERY, variables };

  try {
    const response = await axios.post(GITHUB_API_URL, json, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const contributionCalendar =
      response.data?.data?.user?.contributionsCollection?.contributionCalendar;

    if (
      !contributionCalendar ||
      !('weeks' in contributionCalendar) ||
      !('totalContributions' in contributionCalendar)
    ) {
      throw new GitHubApiError('Could not get contributions data');
    }

    const { weeks, totalContributions } = contributionCalendar;

    const monthlyContributions = groupContributionsByMonth(
      weeks.flatMap((week: TWeek) =>
        week.contributionDays.map((day: TContributionDay) => ({
          ...day,
          border: CUSTOM_COLORS[day.contributionLevel as TContributionLevelName],
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

const groupContributionsByMonth = (contributions: TContributionDay[]): TMonthlyContributions => {
  return contributions.reduce<TMonthlyContributions>((acc, day) => {
    const month = new Date(day.date).toLocaleString('en-US', { month: 'long' });
    acc[month] = acc[month] || [];
    acc[month].push(day);
    return acc;
  }, {});
};

const trimFirstAndLastMonths = (monthlyContributions: TMonthlyContributions) => {
  const keys = Object.keys(monthlyContributions);
  const { [keys[0]]: _, [keys[keys.length - 1]]: __, ...rest } = monthlyContributions;
  return rest;
};
