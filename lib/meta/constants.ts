export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
export const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'test_token';
export const META_API_VERSION = process.env.META_API_VERSION || 'v19.0';
export const META_CONVERSION_API_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

export const isProduction = process.env.NODE_ENV === 'production';
export const isMetaTestMode = process.env.NEXT_PUBLIC_META_TEST_MODE === 'true';