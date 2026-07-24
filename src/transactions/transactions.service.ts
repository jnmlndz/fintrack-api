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

  async getBalance(userId: number) {
    const result = await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('transaction.type', 'type')
        .addSelect('SUM(transaction.amount)', 'total')
        .where('transaction.userId = :userId', { userId })
        .groupBy('transaction.type')
        .getRawMany();

    // "result" se ve algo así: [{ type: 'income', total: '5000.00' }, { type: 'expense', total: '1200.00' }]

    const totalIncome = Number(
        result.find((r) => r.type === 'income')?.total ?? 0,
    );
    const totalExpense = Number(
        result.find((r) => r.type === 'expense')?.total ?? 0,
    );

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    };
    }

    async getExpensesByCategory(userId: number) {
        const result = await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select('transaction.category', 'category')
            .addSelect('SUM(transaction.amount)', 'total')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.type = :type', { type: 'expense' })
            // solo nos importan los gastos para esta gráfica, no los ingresos
            .groupBy('transaction.category')
            .orderBy('total', 'DESC') // categoría con más gasto primero
            .getRawMany();

        return result.map((row) => ({
            category: row.category,
            total: Number(row.total),
        }));
    }

    async getMonthlySummary(userId: number) {
        const result = await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select("DATE_FORMAT(transaction.date, '%Y-%m')", 'month')
            // agrupa por año-mes, ej: "2026-07"
            .addSelect('transaction.type', 'type')
            .addSelect('SUM(transaction.amount)', 'total')
            .where('transaction.userId = :userId', { userId })
            .groupBy('month')
            .addGroupBy('transaction.type')
            .orderBy('month', 'ASC')
            .getRawMany();

        // result se ve así: [{ month: '2026-07', type: 'income', total: '1705.50' }, { month: '2026-07', type: 'expense', total: '715.85' }]

        // Reorganizamos para que cada mes tenga income y expense juntos
        const grouped = new Map<string, { month: string; income: number; expense: number }>();

        for (const row of result) {
            if (!grouped.has(row.month)) {
            grouped.set(row.month, { month: row.month, income: 0, expense: 0 });
            }
            const entry = grouped.get(row.month)!;
            if (row.type === 'income') {
            entry.income = Number(row.total);
            } else {
            entry.expense = Number(row.total);
            }
        }

        return Array.from(grouped.values());
    }
}