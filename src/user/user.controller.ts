import { Body, Controller, Req, UseGuards, Patch, Get, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Get('me')
        async getMe(@Req() req: any) {
            // req.user.sub contient l'ID utilisateur extrait du token
            return this.userService.findOne(req.user.sub);
        }

    @Patch('me')
        async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
            console.log('📥 [CONTROLLER] Données brutes reçues du BFF :', dto);
            console.log('👤 [CONTROLLER] ID utilisateur extrait :', req.user?.sub);
            
            return this.userService.updateProfile(req.user.sub, dto);
        }
    @Get(':id')
        async findOne(@Param('id') id: string) {
            return this.userService.findOne(+id);
        }
}