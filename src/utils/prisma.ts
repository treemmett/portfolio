import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

// check if we are running in production mode
if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  // check if there is already a connection to the database
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  db = global.prisma;
}

export const prisma = db;
