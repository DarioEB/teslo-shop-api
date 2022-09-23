import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

import { ProductImage } from './';

@Entity({
  name: 'products'
})
export class Product {

  @ApiProperty({
    example: '24ab1f5c-37d4-4f59-946d-dc4223da8463',
    description: 'Product ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0
  })
  price: number;

  @ApiProperty({
    example: 'Anim reprehenderit nulla in anim mollit minim irure commodo',
    description: 'Product description',
    default: null
  })
  @Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @ApiProperty(
    {
      example: 't_shirt_teslo',
      description: 'Product SLUG - for SEO',
      uniqueItems: true
    }
  )
  @Column('text', {
    unique: true
  })
  slug: string;

  @ApiProperty(
    {
      example: 10,
      description: 'Product Stock',
      default: 0
    }
  )
  @Column('int', {
    default: 0
  })
  stock: number;

  @ApiProperty(
    {
      example: ['M', 'XL', 'L', 'XXL'],
      description: 'Product Sizes',
    }
  )
  @Column('text', {
    array: true
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty(
    {
      example: ["Season", "Category", "Section"],
      description: 'Product tags',
    }
  )
  @Column('text', {
    array: true,
    default: []
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true }
  )
  user: User

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')

  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
  }
}

