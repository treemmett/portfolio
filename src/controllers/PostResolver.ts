import { Query, Resolver } from 'type-graphql';
import { Photo } from '../entities/Photo';

@Resolver(Photo)
export class PhotoResolver {
  @Query(() => [Photo])
  photos() {
    return Photo.getAll();
  }
}
