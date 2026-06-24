import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || '';

export const algoliaAdmin = algoliasearch(appId, adminKey);
export const INDEX_NAME = "opportunities";
