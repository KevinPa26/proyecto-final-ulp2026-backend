import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationStaffDto } from './dto/pagination-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStaffDto) {
    const email = dto.email.toLocaleLowerCase().trim();
    const nombre = dto.nombre.trim();

    const existe = await this.prisma.usuarioStaff.findUnique({
      where: { email }
    });

    if(existe) {
      throw new BadRequestException('Email ya registrado.');
    }

    const rolAdmin = await this.prisma.rol.findUnique({
      where: { nombre: 'ADMINISTRADOR' }
    });

    if(!rolAdmin) {
      throw new BadRequestException('Rol administrador no encontrado.');
    }

    if(dto.roles.includes(rolAdmin.id)) {
      throw new ForbiddenException('No permitido');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const staff = await this.prisma.$transaction(async (tx) => {
      const user = await tx.usuarioStaff.create({
        data: {
          nombre,
          apellido: dto.apellido,
          password: hash,
          email: dto.email
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          activo: true,
        }
      });

      await tx.usuarioStaffRol.createMany({
        data: dto.roles.map((rolId) => ({
          id_usuario_staff: user.id,
          id_rol: rolId,
        })),
      });

      return user;
    });

    return staff
  }

  async findAll({ page = 1, limit = 10, search, estado = true }: PaginationStaffDto) {
    const skip = (page - 1) * limit;
    
    const where = {
      activo: estado,
      ...(search && {
        OR: [
          {
            nombre: {
              contains: search
            }
          },
          {
            apellido: {
              contains: search
            }
          }
        ]
        ,
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.usuarioStaff.findMany({
        skip,
        take: limit,
        where,
        select: {
          nombre: true,
          apellido: true,
          activo: true,
          email: true,
          UsuarioStaffRol: {
            select: {
              Rol: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      }),
      this.prisma.usuarioStaff.count({ where })
    ]);
    
    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    const staff = await this.prisma.usuarioStaff.findUnique({
      where: { id },
      select: {
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        UsuarioStaffRol: {
          select: {
            Rol: true
          }
        }
      }
    });

    if(!staff) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return staff;
  }

  //trae mas datos como la PASSWORD OJITTTOOO
  async findOneByEmail(email: string) {
    const staff = await this.prisma.usuarioStaff.findUnique({
      where: { email },
      select: {
        nombre: true,
        apellido: true,
        email: true,
        password: true,
        activo: true,
        UsuarioStaffRol: {
          select: {
            Rol: true
          }
        }
      }
    });

    if(!staff) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return staff;
  }

  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.prisma.usuarioStaff.findUnique({
      where: { id }
    });

    if(!staff) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if(dto.email) {
      const email = dto.email.toLocaleLowerCase().trim();

      const existe = await this.prisma.usuarioStaff.findUnique({
        where: { email}
      });

      if(existe && (existe.id !== id)) {
        throw new BadRequestException('Email ya en uso.')
      }

      dto.email = email
    }

    if(dto.password) {
      throw new BadRequestException('No se puede modificar la password.')
    }

    let data: any = {
      ...dto
    }

    return this.prisma.usuarioStaff.update({
      where: { id },
      data,
      select: {
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        UsuarioStaffRol: {
          select: {
            Rol: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    const rolAdmin = await this.prisma.rol.findUnique({
      where: { nombre: 'ADMINISTRADOR' }
    });

    if(!rolAdmin) {
      throw new BadRequestException('Rol administrador no encontrado.');
    }

    const staff = await this.prisma.usuarioStaff.findUnique({
      where: { id },
      select: {
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        UsuarioStaffRol: {
          select: {
            Rol: true
          }
        }
      }
    });

    
    if(!staff) {
      throw new NotFoundException('Usuario no encontrado.')
    }

    const esAdmin = staff.UsuarioStaffRol.some(r => r.Rol.id == rolAdmin.id)

    if(esAdmin) {
      throw new ForbiddenException('No permitido')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.usuarioStaffRol.deleteMany({
        where: { id_usuario_staff: id }
      });

      return tx.usuarioStaff.delete({
        where: { id },
        select: {
          nombre: true,
          apellido: true,
          email: true,
          activo: true
        }
      });
    });
  }

  async toggleEstado(id: number) {
    const staff = await this.prisma.usuarioStaff.findUnique({
      where: { id }
    });

    if(!staff) {
      throw new NotFoundException('Usuario no encontrado.')
    }

    return this.prisma.usuarioStaff.update({
      where: { id },
      data: { activo: !staff.activo},
      select: {
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        UsuarioStaffRol: {
          select: {
            Rol: true
          }
        }
      }
    })
  }
}
