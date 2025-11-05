import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  handleOAuthRedirect(req: Request, res: Response) {
    const user = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const target = new URL('/', frontendUrl);
    if (user) {
      target.searchParams.set('provider', user.provider);
      if (user.id) target.searchParams.set('id', String(user.id));
      if (user.displayName)
        target.searchParams.set('name', String(user.displayName));
      if (user.username)
        target.searchParams.set('username', String(user.username));
    }
    return res.redirect(target.toString());
  }
}
