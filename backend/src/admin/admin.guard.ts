import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JWT Strategy

    if (!user) return false;

    // Check Database for current role (don't trust JWT claim alone for critical ops)
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    
    if (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN') {
      return true;
    }

    throw new ForbiddenException('Access Denied: Admin Privileges Required');
  }
}
