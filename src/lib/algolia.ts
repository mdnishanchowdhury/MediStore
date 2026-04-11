import { algoliasearch } from 'algoliasearch';

const client = algoliasearch('YOUR_APP_ID', 'YOUR_ADMIN_API_KEY');

export const getSmartSuggestions = async (searchTerm: string) => {
  try {
    const { results } = await client.search({
      requests: [
        {
          indexName: 'medicines',
          query: searchTerm,
          hitsPerPage: 5,
        },
      ],
    });

    // @ts-ignore
    return results[0].hits;
  } catch (error) {
    console.error("Algolia Error:", error);
    return [];
  }
};