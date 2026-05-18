import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './context';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SchoolApex LMS API',
      version: '1.0.0',
      database: 'Canvas PostgreSQL',
      graphql: '/graphql',
    });
  });

  // API info endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'SchoolApex LMS API',
      description: 'Modern GraphQL API for Canvas LMS data',
      version: '1.0.0',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
        playground: '/graphql (in development)',
      },
      features: [
        'Real-time Canvas data access',
        'Modern GraphQL API',
        'Type-safe operations',
        'Performance optimized',
        'Canvas database integration',
      ],
    });
  });

  const PORT = process.env.PORT || 4003;

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 SchoolApex LMS API ready at http://localhost:${PORT}/graphql`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🎓 Connected to Canvas database for real-time data`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
