// Where to download the Pickup Runner app. One app for customers and drivers.
// Change the links here and every store button on the site follows.
export const APP_STORE_URL = 'https://apps.apple.com/us/app/pickup-runner/id6807306109'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pickuprunner'

export const APP_STORES = [
  { key: 'ios', label: 'App Store', sub: 'Download on the', url: APP_STORE_URL },
  { key: 'android', label: 'Google Play', sub: 'Get it on', url: PLAY_STORE_URL },
] as const
