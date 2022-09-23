import { Response } from 'express';
import { diskStorage } from 'multer';
import {
  Controller,
  Post,
  BadRequestException,
  Get,
  Param,
  Res
} from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileNamer, fileFilter } from './helpers';


@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }
  
  /* Utilizando el decorador de Nest me veo obligado a emitir una respuesta */
  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path); /* Regreso el path para mostrar el archivo */
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { FileSize: 1000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer // renombremiento de la imagen
    })
  }))
  updateProductImage(
    @UploadedFile() file: Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException(`Make sure that file is an image`);
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {
      secureUrl
    };
  }
}
