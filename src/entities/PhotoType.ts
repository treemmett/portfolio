import { registerEnumType } from 'type-graphql';

export enum PhotoType {
  BLURRED,
  ORIGINAL,
  SCALED,
}

registerEnumType(PhotoType, {
  name: 'PhotoType',
});
