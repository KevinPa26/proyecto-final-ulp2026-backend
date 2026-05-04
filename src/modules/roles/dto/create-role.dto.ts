import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    nombre!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    permisos!: number[]
}
