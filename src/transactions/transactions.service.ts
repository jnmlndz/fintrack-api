import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...dto,
      userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      order: { date: 'DESC' }, // más recientes primero
    });
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta transacción');
    }

    return transaction;
  }

  async update(id: number, userId: number, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id, userId); // reutiliza la validación de dueño

    Object.assign(transaction, dto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.findOne(id, userId); // reutiliza la validación de dueño
    await this.transactionsRepository.remove(transaction);
  }
}