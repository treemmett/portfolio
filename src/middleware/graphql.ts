import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import { buildSchema, registerEnumType } from 'type-graphql';
import { PhotoType } from '../entities/PhotoType';
import { PhotoResolver } from '../resolvers/PhotoResolver';
import { PostResolver } from '../resolvers/PostResolver';

// TODO should this live here?
registerEnumType(PhotoType, {
  name: 'PhotoType',
});

export const apolloServer = new ApolloServer({
  csrfPrevention: process.env.NODE_ENV === 'production',
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema: await buildSchema({
    resolvers: [PhotoResolver, PostResolver],
  }),
});
