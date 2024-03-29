/* eslint-disable max-classes-per-file */

export class APIError extends Error {
  public code: string;

  constructor(
    public message = 'An error occurred',
    public status = 500,
  ) {
    super(message);
    this.code = this.constructor.name;
    this.name = this.code;
  }
}

export class PostNotFoundError extends APIError {
  constructor(public message = 'Post not found') {
    super(message, 404);
  }
}

export class BadUploadTokenError extends APIError {
  constructor(public message = 'Bad upload token') {
    super(message, 406);
  }
}

export class NoFileReceivedError extends APIError {
  constructor(public message = 'No file received') {
    super(message, 424);
  }
}

export class OAuthHandshakeError extends APIError {
  constructor(public message = 'OAuth handshake failed') {
    super(message, 412);
  }
}

export class BadAccessTokenError extends APIError {
  constructor(public message = 'Invalid access token') {
    super(message, 403);
  }
}

export class UnauthenticatedError extends APIError {
  constructor(public message = 'Unauthenticated request') {
    super(message, 403);
  }
}

export class UnauthorizedError extends APIError {
  constructor(public message = 'Unauthorized request') {
    super(message, 401);
  }
}

export class ServiceError extends APIError {
  constructor(public message = 'Service failed') {
    super(message, 502);
  }
}

export class BadCrossOriginError extends APIError {
  constructor(public message = 'Cross-Origin check failed') {
    super(message, 701);
  }
}

export class UserNotFoundError extends APIError {
  constructor(public message = 'User not found') {
    super(message, 404);
  }
}

export class SiteNotFoundError extends APIError {
  constructor(public message = 'Site not found') {
    super(message, 404);
  }
}

export class ImageProcessingError extends APIError {
  constructor(public message = 'Unable to process image') {
    super(message, 500);
  }
}

export class ConflictError extends APIError {
  constructor(public message = 'Conflict in the request') {
    super(message, 409);
  }
}

export class NoSiteError extends APIError {
  constructor(public message = 'User has no site associated') {
    super(message, 404);
  }
}

export class ValidationError extends APIError {
  constructor(public message = 'Validation failed') {
    super(message, 400);
  }
}
