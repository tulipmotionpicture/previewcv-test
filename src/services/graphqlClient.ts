/**
 * GraphQL Client Service
 * Handles GraphQL queries without Apollo Client
 */

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, any>;
  clientName?: 'masters' | 'default';
  fetchPolicy?: 'cache-first' | 'no-cache' | 'network-only';
}

export class GraphQLClient {
  private static readonly GRAPHQL_ENDPOINTS = {
    masters: 'https://letsmakecv.tulip-software.com/masters-graphql',
    default: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  };

  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Execute a GraphQL query
   */
  static async query<T = any>(
    options: GraphQLRequestOptions
  ): Promise<T> {
    const {
      query,
      variables = {},
      clientName = 'default',
      fetchPolicy = 'cache-first',
    } = options;

    const endpoint = this.GRAPHQL_ENDPOINTS[clientName];
    
    if (!endpoint) {
      throw new Error(`Invalid GraphQL client: ${clientName}`);
    }

    // Check cache if cache-first policy
    if (fetchPolicy === 'cache-first') {
      const cacheKey = this.getCacheKey(query, variables, clientName);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new GraphQLError(result.errors[0].message, result.errors);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL query');
      }

      // Cache the result
      if (fetchPolicy === 'cache-first') {
        const cacheKey = this.getCacheKey(query, variables, clientName);
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
        });
      }

      return result.data;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      
      throw new GraphQLError(
        error instanceof Error ? error.message : 'Unknown GraphQL error',
        []
      );
    }
  }

  /**
   * Generate cache key
   */
  private static getCacheKey(
    query: string,
    variables: Record<string, any>,
    clientName: string
  ): string {
    return `${clientName}:${query}:${JSON.stringify(variables)}`;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Custom GraphQL Error class
 */
export class GraphQLError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{
      message: string;
      locations?: Array<{ line: number; column: number }>;
      path?: string[];
    }>
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}
