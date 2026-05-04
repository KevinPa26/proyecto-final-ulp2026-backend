import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PaginationRoleDto } from './dto/pagination-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const nombre = dto.nombre.toLocaleUpperCase().trim()

    const existe = await this.prisma.rol.findUnique({
      where: { nombre }
    });

    if(existe) throw new BadRequestException('El nombre del rol ya existe.');

    const newRol = await this.prisma.$transaction(async (tx) => {
      const rol = await tx.rol.create({
        data: { nombre }
      });

      await tx.rolPermiso.createMany({
        data: dto.permisos.map((permisoId) => ({
          id_rol: rol.id,
          id_permiso: permisoId
        }))
      })
    })

    return newRol
  }

  async findAll({ page = 1, limit = 10, search }: PaginationRoleDto) {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        nombre: {
          contains: search
        }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.rol.findMany({
        skip,
        take: limit,
        where
      }),
      this.prisma.rol.count({ where })
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
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        RolPermiso: {
          select: {
            Permiso: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    if(!rol) throw new NotFoundException('Rol no encontrado.');

    return rol;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const rol = await this.prisma.rol.findUnique({
      where: { id }
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (dto.permisos) {
      const permisosValidos = await this.prisma.permiso.findMany({
        where: {
          id: { in: dto.permisos }
        },
        select: { id: true }
      });

      if (permisosValidos.length !== dto.permisos.length) {
        throw new BadRequestException('Uno o más permisos no existen');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRol = await tx.rol.update({
        where: { id },
        data: {
          ...(dto.nombre && { nombre: dto.nombre.toLocaleUpperCase().trim() })
        }
      });

      if (dto.permisos) {
        await tx.rolPermiso.deleteMany({
          where: { id_rol: id }
        });

        await tx.rolPermiso.createMany({
          data: dto.permisos.map((permisoId) => ({
            id_rol: id,
            id_permiso: permisoId
          }))
        });
      }

      return updatedRol;
    });
  }

  async remove(id: number) {
    const rol = await this.prisma.rol.findUnique({
      where: { id }
    });

    if(!rol) throw new NotFoundException('Rol no encontrado.');

    return this.prisma.$transaction(async (tx) => {
      await tx.usuarioStaffRol.deleteMany({
        where: { id_rol: id}
      });

      await tx.rolPermiso.deleteMany({
        where: { id_rol: id }
      });

      return tx.rol.delete({
        where: { id }
      })
    })
  }
}
