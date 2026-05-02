import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login-auth.dto';
import { StaffService } from '../staff/staff.service';
import { BcryptService } from 'src/core/common/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(private readonly staffService: StaffService, private readonly bcryptService: BcryptService) {}

  async login(dto: LoginDto) {
    const email  = dto.email.toLocaleLowerCase().trim();

    const staff = await this.staffService.findOneByEmail(email);

    const esValido = await this.bcryptService.coomparePassword(dto.password, staff.password)

    if (!esValido) throw new UnauthorizedException('Credenciales inválidas');

    return {
      mensaje: 'Login exitoso',
      staff
    }
  }
}
