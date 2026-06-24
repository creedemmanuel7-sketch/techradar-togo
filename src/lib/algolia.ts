import { liteClient } from 'algoliasearch/lite';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

export const searchClient = liteClient(appId, searchKey);
export const INDEX_NAME = "opportunities";
