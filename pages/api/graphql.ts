import { gql, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';

const books = [
  {
    id: 0,
    name: 'test',
  },
];

const typeDefs = gql`
  type Book {
    id: ID!
    name: String
  }
  type Query {
    getBooks: [Book]
  }
`;

const resolvers = {
  Query: {
    getBooks() {
      return books;
    },
  },
};

const server = new ApolloServer({
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  resolvers,
  typeDefs,
});

await server.start();
const handler = await server.createHandler({ path: '/api/graphql' });

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
