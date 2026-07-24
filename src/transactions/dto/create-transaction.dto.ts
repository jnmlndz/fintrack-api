import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { TransactionType } from '../entities/transaction-type.enum';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01) // no tiene sentido una transacción de $0 o negativa
  amount: number;

  @IsEnum(TransactionType) // solo acepta 'income' o 'expense', nada más
  type: TransactionType;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString() // valida formato de fecha tipo "2026-07-23"
  date: string;
}