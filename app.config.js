const appJson = require('./app.json');

export default {
  ...appJson.expo,
  extra: {
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
    maptilerKey: process.env.MAPTILER_KEY,
  },
};
