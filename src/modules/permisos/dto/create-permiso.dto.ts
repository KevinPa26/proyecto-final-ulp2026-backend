import { IsString, MaxLength, MinLength } from "class-validator";

export class CreatePermisoDto {
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    nombre!: string;
}
