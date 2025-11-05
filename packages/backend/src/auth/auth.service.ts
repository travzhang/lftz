import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private extractEmail(oauthUser: any): string | undefined {
    const emails = oauthUser?.emails as Array<{ value: string }> | undefined;
    if (Array.isArray(emails) && emails.length > 0) return emails[0]?.value;
    return undefined;
  }

  private extractName(oauthUser: any): string | undefined {
    return oauthUser?.displayName || oauthUser?.username || undefined;
  }

  private extractAvatar(oauthUser: any): string | undefined {
    const photos = oauthUser?.photos as Array<{ value: string }> | undefined;
    if (Array.isArray(photos) && photos.length > 0) return photos[0]?.value;
    return undefined;
  }

  async handleOAuthRedirect(req: any, res: Response) {
    const oauthUser = (req as any).user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const target = new URL('/', frontendUrl);

    let boundUserId: string | undefined;
    let provider: string | undefined;

    if (oauthUser) {
      provider = oauthUser.provider;
      let email = this.extractEmail(oauthUser);
      const nickname = this.extractName(oauthUser) || '';
      const avatar = this.extractAvatar(oauthUser) || '';

      if (!email) {
        const local = `${provider || 'oauth'}-${oauthUser?.id || randomUUID()}`;
        email = `${local}@oauth.local`;
      }

      const existing = await this.prisma.user.findFirst({ where: { email } });
      if (existing) {
        boundUserId = existing.id;
        const nextNickname = nickname || existing.nickname;
        const nextAvatar = avatar || existing.avatar;
        if (
          nextNickname !== existing.nickname ||
          nextAvatar !== existing.avatar
        ) {
          await this.prisma.user.update({
            where: { id: existing.id },
            data: { nickname: nextNickname, avatar: nextAvatar },
          });
        }
      } else {
        const newId = randomUUID();
        const randomPassword = randomBytes(24).toString('hex');
        const favor = '';
        const created = await this.prisma.user.create({
          data: {
            id: newId,
            email,
            password: randomPassword,
            nickname: nickname || email.split('@')[0],
            avatar,
            favor,
          },
        });
        boundUserId = created.id;
      }

      target.searchParams.set('provider', String(provider));
      if (boundUserId) target.searchParams.set('id', String(boundUserId));
      if (nickname) target.searchParams.set('name', String(nickname));
      if (oauthUser.username)
        target.searchParams.set('username', String(oauthUser.username));
    }

    return res.redirect(target.toString());
  }
}
