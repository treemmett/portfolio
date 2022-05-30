import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import { buildSchema } from 'type-graphql';
import { PhotoResolver } from '../../controllers/PostResolver';

const server = new ApolloServer({
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema: await buildSchema({
    resolvers: [PhotoResolver],
  }),
});

await server.start();
const handler = await server.createHandler({ path: '/api/graphql' });

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
