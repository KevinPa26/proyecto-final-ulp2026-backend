import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login-auth.dto';
import { StaffService } from '../staff/staff.service';
import { BcryptService } from 'src/core/common/bcrypt.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const email  = dto.email.toLocaleLowerCase().trim();

    const staff = await this.staffService.findOneByEmail(email);

    const esValido = await this.bcryptService.coomparePassword(dto.password, staff.password)

    if (!esValido) throw new UnauthorizedException('Credenciales inválidas');

    const roles = staff.UsuarioStaffRol.map( r => r.Rol.nombre )

    const payload = {
      sub: staff.id,
      email: staff.email,
      roles
    }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }
}
