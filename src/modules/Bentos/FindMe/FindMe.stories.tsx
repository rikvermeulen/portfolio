import type { FindMeWeather } from "@/lib/weather/types.ts";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FindMe from "./FindMe.tsx";
import WeatherBadgeView from "./WeatherBadgeView.tsx";

const mockWeather: FindMeWeather = {
  temperatureCelsius: 18,
  conditionLabel: "Cloudy",
  iconName: "weather-cloud",
};

const meta = {
  component: FindMe,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-10">
        <div className="size-80">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof FindMe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sizeKey: "findme",
    className: "size-full",
    weatherBadge: <WeatherBadgeView weather={mockWeather} />,
  },
};
