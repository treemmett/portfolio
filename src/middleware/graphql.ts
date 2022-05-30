import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import { buildSchema } from 'type-graphql';
import { PhotoResolver } from '../resolvers/PhotoResolver';
import { PostResolver } from '../resolvers/PostResolver';

export const apolloServer = new ApolloServer({
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema: await buildSchema({
    resolvers: [PhotoResolver, PostResolver],
  }),
});
