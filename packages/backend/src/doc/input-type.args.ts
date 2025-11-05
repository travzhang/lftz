import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDocInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  isFolder?: boolean;
}

@InputType()
export class UpdateDocInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  isFolder?: boolean;
}
