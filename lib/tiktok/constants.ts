export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
export const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
export const TIKTOK_API_VERSION = process.env.TIKTOK_API_VERSION || 'v1.3';
export const TIKTOK_CONVERSION_API_URL = `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/pixel/track/`;

export const isProduction = process.env.NODE_ENV === 'production';
export const isTestMode = process.env.NEXT_PUBLIC_TIKTOK_TEST_MODE === 'true';