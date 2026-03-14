export const svgrOptions = {
  dimensions: false,
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
        cleanupIDs: false,
      },
    ],
  },
};
