import 'reflect-metadata';
import { NextApiHandler } from 'next';
import { connectToDB } from '../../database';

const handler: NextApiHandler = async (req, res) => {
  await connectToDB();
  res.send('hello');
};

export default handler;
