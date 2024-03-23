import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../../../database';
import { OrderItems } from './order-item.entity';
import { Business } from 'src/modules/business/entities/business.entity';

@Entity({ name: 'order' })
export class Order extends BaseTable {
  @OneToMany(() => OrderItems, (orderItems) => orderItems.order)
  orderItems: OrderItems;

  @Column()
  totalPrice: number;

  @ManyToOne(() => Business)
  @JoinColumn()
  business: Business;
}
