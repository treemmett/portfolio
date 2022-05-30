import { connectToDB } from '../../middleware/database';
import { apolloServer } from '../../middleware/graphql';

await Promise.all([apolloServer.start(), connectToDB()]);

export default await apolloServer.createHandler({ path: '/api/graphql' });

export const config = {
  api: {
    bodyParser: false,
  },
};
