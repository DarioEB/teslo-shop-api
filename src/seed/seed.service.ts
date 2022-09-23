import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();


    await this.insertNewProducts(adminUser);
    return 'SEED EXECUTE';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    /* Eliminación de usuarios */
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
    
    
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user))
    })

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0]
  }

  private async insertNewProducts(user: User) {
    // this.productService.deleteAllProducts()
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(
        this.productsService.create(product, user)
      )
    });

    await Promise.all(insertPromises);
  }

}
