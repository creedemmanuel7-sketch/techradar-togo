import { liteClient } from 'algoliasearch/lite';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

// Validate required environment variables
if (!appId || !searchKey) {
  throw new Error("Missing required Algolia environment variables: NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY are required");
}

export const searchClient = liteClient(appId, searchKey);
export const INDEX_NAME = "opportunities";
