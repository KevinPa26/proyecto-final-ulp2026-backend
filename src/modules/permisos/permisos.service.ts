import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PaginationPermisoDto } from './dto/pagination-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePermisoDto) {
    const nombre = dto.nombre.toLocaleUpperCase().trim();

    return this.prisma.permiso.create({
      data: { nombre }
    });
  }

  async findAll({ page = 1, limit = 10, search }: PaginationPermisoDto) {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        nombre: {
          contains: search
        }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.permiso.findMany({
        skip,
        take: limit,
        where
      }),
      this.prisma.permiso.count({ where })
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
    const permiso = await this.prisma.permiso.findUnique({
      where: { id }
    });

    if(!permiso) throw new NotFoundException('Permiso no encontrado.');

    return permiso;
  }

  async update(id: number, dto: UpdatePermisoDto) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id }
    });

    if(!permiso) throw new NotFoundException('Permiso no encontrado.');

    if(!dto.nombre) throw new BadRequestException('No permitido.');

    return this.prisma.permiso.update({
      where: { id },
      data: { nombre: dto.nombre.toLocaleUpperCase().trim() }
    })
  }

  async remove(id: number) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id }
    });

    if(!permiso) throw new NotFoundException('Permiso no encontrado.');

    return this.prisma.$transaction(async (tx) => {
      await tx.rolPermiso.deleteMany({
        where: { id_permiso: id }
      });

      return tx.permiso.delete({
        where: { id }
      })
    })
  }
}
