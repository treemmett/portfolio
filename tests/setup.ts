jest.mock('aws-sdk', () => ({
  Credentials: jest.fn(),
  Endpoint: jest.fn(),
  S3: jest.fn(() => ({
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    upload: jest.fn().mockReturnThis(),
  })),
}));

export {};
