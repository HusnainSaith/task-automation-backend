import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Company, UserRole } from '../../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, companyName: string) {
    const company = this.companyRepo.create({ name: companyName });
    await this.companyRepo.save(company);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.OWNER,
      companyId: company.id,
    });

    try {
      await this.userRepo.save(user);
      return this.generateToken(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    console.log('Login attempt for email:', email);
    
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!user) {
      console.log('User not found for email:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPasswordHash: !!user.passwordHash
    });

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password does not match for user:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Login successful for user:', email);
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
