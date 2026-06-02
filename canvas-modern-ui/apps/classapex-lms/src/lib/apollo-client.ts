import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// GraphQL endpoint - uses Vite proxy in development to avoid CORS issues
const GRAPHQL_ENDPOINT = process.env.VITE_GRAPHQL_ENDPOINT || '/api/graphql';

// HTTP Link for GraphQL requests
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'include', // Include cookies for authentication
});

// Helper to dynamically get the active authentication token
function getActiveToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // If logged out, do not return any active or fallback tokens
  if (localStorage.getItem('cx_logged_out') === 'true') {
    return undefined;
  }

  // 1. Try schoolapex_canvas_token (E2E test mock token)
  const mockTokenStr = localStorage.getItem('schoolapex_canvas_token');
  if (mockTokenStr) {
    try {
      const mockToken = JSON.parse(mockTokenStr);
      if (mockToken && mockToken.access_token) {
        return mockToken.access_token;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // 2. Try cx_access_token
  const cxToken = localStorage.getItem('cx_access_token');
  if (cxToken) return cxToken;

  // 3. Try canvas-api-token
  const canvasApiToken = localStorage.getItem('canvas-api-token');
  if (canvasApiToken) return canvasApiToken;

  // 4. Fallback to VITE_CANVAS_API_TOKEN (only if not running under Playwright)
  const isPlaywright = (window as any).__playwright || (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('playwright'));
  if (!isPlaywright) {
    return process.env.VITE_CANVAS_API_TOKEN;
  }

  return undefined;
}

// Authentication link to add Canvas API tokens
const authLink = setContext((_, { headers }) => {
  const token = getActiveToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.warn(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    // Only log connection errors as warnings in development to avoid spam
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Network error]: ${networkError.message}`);

      // Provide helpful context for common connection issues
      if (networkError.message.includes('Failed to fetch') || networkError.message.includes('ERR_CONNECTION_REFUSED')) {
        console.warn(`💡 Canvas LMS GraphQL server may not be running at: ${GRAPHQL_ENDPOINT}`);
        console.warn('💡 Check that Canvas LMS is started and GraphQL endpoint is accessible');
      }
    }

    // Handle specific network errors
    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('canvas-api-token');
          localStorage.removeItem('cx_access_token');
          localStorage.removeItem('schoolapex_canvas_token');
          localStorage.setItem('cx_logged_out', 'true');
          console.warn('Authentication required - please log in to Canvas LMS');
          break;
        case 403:
          console.warn('Access forbidden - insufficient permissions');
          break;
        case 429:
          console.warn('Rate limited - retrying...');
          break;
      }
    }
  }
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      return !!error && error.networkError?.statusCode !== 401;
    },
  },
});

// Apollo Client cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        courses: {
          // Pagination configuration for courses
          keyArgs: [],
          merge(existing = [], incoming = []) {
            return [...existing, ...incoming];
          },
        },
        assignments: {
          // Pagination configuration for assignments
          keyArgs: ['courseId'],
          merge(existing = [], incoming = []) {
            return [...existing, ...incoming];
          },
        },
        users: {
          // Pagination configuration for users
          keyArgs: [],
          merge(existing = [], incoming = []) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    Course: {
      fields: {
        students: {
          merge: true,
        },
        teachers: {
          merge: true,
        },
        assignments: {
          merge: true,
        },
      },
    },
    User: {
      fields: {
        courses: {
          merge: true,
        },
        enrollments: {
          merge: true,
        },
      },
    },
  },
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    authLink,
    httpLink,
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
  // Enable developer tools in development
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Helper functions for client operations
export const clearCache = () => {
  apolloClient.cache.reset();
};

export const refetchQueries = (queryNames: string[]) => {
  return apolloClient.refetchQueries({
    include: queryNames,
  });
};

// Canvas API specific helpers
export const setCanvasApiToken = (token: string) => {
  localStorage.setItem('canvas-api-token', token);
};

export const getCanvasApiToken = () => {
  return localStorage.getItem('canvas-api-token');
};

export const clearCanvasApiToken = () => {
  localStorage.removeItem('canvas-api-token');
  clearCache();
};

// Health check query to verify GraphQL connection
export const checkGraphQLHealth = async () => {
  try {
    const result = await apolloClient.query({
      query: gql`
        query HealthCheck {
          __schema {
            queryType {
              name
            }
          }
        }
      `,
      fetchPolicy: 'network-only',
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Import gql for the health check
import { gql } from '@apollo/client';

export default apolloClient;