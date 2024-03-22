import { Entity, Column } from 'typeorm';
import { BaseTable } from 'src/database';

@Entity({ name: 'inventory_item' })
export class InventoryItem extends BaseTable {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;
}
