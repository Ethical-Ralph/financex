import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from 'src/database';
import { Business } from './business.entity';

@Entity({ name: 'department_head' })
export class DepartmentHead extends BaseTable {
  @Column()
  name: string;

  @Column()
  email: string;

  @ManyToOne(() => Business, (business) => business.departmentHeads)
  @JoinColumn()
  business: Business;
}
