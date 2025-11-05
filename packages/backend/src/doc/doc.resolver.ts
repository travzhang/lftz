import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateDocInput, UpdateDocInput } from './input-type.args';
import { DocModel } from './doc.model';
import { DocService } from './doc.service';

@Resolver()
export class DocResolver {
  constructor(private readonly docService: DocService) {}

  @Query(() => [DocModel])
  myDocs(@Context() ctx: any) {
    const userId = ctx?.req?.user?.userId as string;
    return this.docService.listByOwner(userId);
  }

  @Query(() => DocModel, { nullable: true })
  doc(@Args('id', { type: () => ID }) id: string, @Context() ctx: any) {
    const userId = ctx?.req?.user?.userId as string;
    return this.docService.get(userId, id);
  }

  @Mutation(() => DocModel)
  createDoc(@Args('input') input: CreateDocInput, @Context() ctx: any) {
    const userId = ctx?.req?.user?.userId as string;
    return this.docService.create(userId, input);
  }

  @Mutation(() => DocModel)
  updateDoc(@Args('input') input: UpdateDocInput, @Context() ctx: any) {
    const userId = ctx?.req?.user?.userId as string;
    return this.docService.update(userId, input);
  }

  @Mutation(() => DocModel)
  deleteDoc(@Args('id', { type: () => ID }) id: string, @Context() ctx: any) {
    const userId = ctx?.req?.user?.userId as string;
    return this.docService.remove(userId, id);
  }
}
