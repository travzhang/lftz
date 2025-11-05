import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DocModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  isFolder: boolean;

  @Field({ nullable: true })
  parentId?: string | null;

  @Field()
  ownerId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
