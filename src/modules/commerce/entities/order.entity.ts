import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../../../database';
import { OrderItems } from './order-item.entity';
import { Business } from '../../business/entities';

@Entity({ name: 'order' })
export class Order extends BaseTable {
  @OneToMany(() => OrderItems, (orderItems) => orderItems.order, {
    cascade: true,
    eager: true,
  })
  orderItems: OrderItems[];

  @Column()
  totalPrice: number;

  @ManyToOne(() => Business)
  @JoinColumn()
  business: Business;

  @Column()
  departmentHeadId: string;
}
