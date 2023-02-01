import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Render,
} from '@nestjs/common';
import { DataSource, ReturningStatementNotSupportedError } from 'typeorm';
import { AppService } from './app.service';
import { RegisterDto } from './register.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import { ChangeUserDto } from './changeUser.dto';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    if (
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.passwordAgain
    ) {
      throw new BadRequestException('All fields must ');
    }

    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must contain an @ character');
    }
    if (registerDto.password !== registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords must match');
    }

    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'The password must be at least 8 characters long',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerDto.email;
    user.password = bcrypt.hash(registerDto.password, 15);
    userRepo.save(user);
  }
  @Patch('users/:id')
  async patchUser(
    @Param('id') id: number,
    @Body() changeUserDto: ChangeUserDto,
  ) {
    if (!changeUserDto.email.includes('@')) {
      throw new BadRequestException('Email must contain an @ character');
    }
    if (
      !changeUserDto.profilePictureUrl.startsWith('http://') &&
      changeUserDto.profilePictureUrl.startsWith('https://')
    ) {
      throw new BadRequestException('Url must start with http or https');
    }
    const userRepo = this.dataSource.getRepository(User);
    const userToChange = await userRepo.findOneBy({ id: id });
    userToChange.email = changeUserDto.email;
    userToChange.profilePictureUrl = changeUserDto.profilePictureUrl;
    userRepo.save(userToChange);
  }
}
