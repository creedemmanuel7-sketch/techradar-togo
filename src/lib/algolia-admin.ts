import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || '';

// Validate required environment variables
if (!appId || !adminKey) {
  throw new Error("Missing required Algolia Admin environment variables: NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY are required");
}

export const algoliaAdmin = algoliasearch(appId, adminKey);
export const INDEX_NAME = "opportunities";
