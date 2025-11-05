import { Module } from '@nestjs/common';
import { DocResolver } from './doc.resolver';
import { DocService } from './doc.service';

@Module({
  providers: [DocResolver, DocService],
})
export class DocModule {}
