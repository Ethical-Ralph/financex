import { Column, Entity, OneToMany } from 'typeorm';
import { BaseTable } from 'src/database';
import { DepartmentHead } from './department-head.entity';

@Entity({ name: 'business' })
export class Business extends BaseTable {
  @Column()
  name: string;

  @OneToMany(() => DepartmentHead, (departmentHead) => departmentHead.business)
  departmentHeads: DepartmentHead[];
}
