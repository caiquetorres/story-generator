import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateProjectDto {
    @ApiProperty({ example: "Project 1" })
    @IsString()
    @IsNotEmpty()
    prompt: string;
}
