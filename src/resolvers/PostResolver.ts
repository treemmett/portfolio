import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';

@Resolver(Post)
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return Post.getAll();
  }

  @Mutation(() => Post)
  addPost(@Arg('title') title: string): Post {
    return {
      created: new Date(),
      id: title,
    } as Post;
  }
}
