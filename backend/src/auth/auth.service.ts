import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await argon2.verify(user.passwordHash, pass))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
         id: user.id,
         name: user.fullName,
         email: user.email,
         role: user.role,
         isCorporate: user.role === 'CORPORATE'
      }
    };
  }

  async register(data: any) {
    const hash = await argon2.hash(data.password);
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        fullName: data.fullName,
        role: data.isCorporate ? 'CORPORATE' : 'RETAIL',
        companyName: data.companyName,
        rcNumber: data.rcNumber
      }
    });
  }
}
