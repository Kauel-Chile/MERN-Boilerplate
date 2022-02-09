import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateOrgDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description: string
}

export class UpdateOrgDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description: string
}