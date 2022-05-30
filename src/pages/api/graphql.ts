import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import { buildSchema } from 'type-graphql';
import { PhotoResolver } from '../../controllers/PostResolver';
import { connectToDB } from '../../middleware/database';

const server = new ApolloServer({
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema: await buildSchema({
    resolvers: [PhotoResolver],
  }),
});

await Promise.all([server.start(), connectToDB()]);

export default await server.createHandler({ path: '/api/graphql' });

export const config = {
  api: {
    bodyParser: false,
  },
};
