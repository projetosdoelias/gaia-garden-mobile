import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. The native iOS template allows plain HTTP to the local network in every build,
 * so it is turned off here and only a development build (APP_VARIANT=development) turns it back on.
 */
const isDevelopmentVariant = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'gaia-garden-mobile',
  slug: config.slug ?? 'gaia-garden-mobile',
  ios: {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsLocalNetworking: isDevelopmentVariant,
      },
    },
  },
});
