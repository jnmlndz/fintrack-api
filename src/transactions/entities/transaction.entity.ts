import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransactionType } from './transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
  // decimal en lugar de float: nunca uses float para dinero, pierde precisión

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  category: string; // ej: "comida", "transporte", "salario"

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number; // guardamos también el id plano, útil para queries directas
}   