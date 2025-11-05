import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocInput, UpdateDocInput } from './input-type.args';

@Injectable()
export class DocService {
  constructor(private readonly prisma: PrismaService) {}

  async listByOwner(ownerId: string) {
    return this.prisma.doc.findMany({
      where: { ownerId },
      orderBy: [{ isFolder: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async get(ownerId: string, id: string) {
    return this.prisma.doc.findFirst({ where: { id, ownerId } });
  }

  async create(ownerId: string, input: CreateDocInput) {
    const created = await this.prisma.doc.create({
      data: {
        id: input.id,
        title: input.title,
        content: input.content ?? '',
        isFolder: Boolean(input.isFolder),
        parentId: input.parentId ?? null,
        ownerId,
      },
    });
    return created;
  }

  async update(ownerId: string, input: UpdateDocInput) {
    const { id, ...rest } = input;
    return this.prisma.doc.update({
      where: { id },
      data: {
        title: rest.title ?? undefined,
        content: rest.content ?? undefined,
        isFolder: rest.isFolder ?? undefined,
        parentId: rest.parentId ?? undefined,
      },
    });
  }

  async remove(ownerId: string, id: string) {
    // 允许级联删除孩子：简单起见，先删所有子孙
    const children = await this.prisma.doc.findMany({
      where: { ownerId },
    });
    const toDelete = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of children) {
        if (d.parentId && toDelete.has(d.parentId)) {
          if (!toDelete.has(d.id)) {
            toDelete.add(d.id);
            changed = true;
          }
        }
      }
    }
    await this.prisma.doc.deleteMany({ where: { id: { in: [...toDelete] } } });
    return { id } as any;
  }
}
