import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity ('users')
export class User{
    @PrimaryGeneratedColumn() //primarykey + autoincrement
    id: number;

    @Column({unique:true}) //Columna con unique para correo
    email:string;

    @Column() //Columna para contraseña (se guarda el hash)
    password: string; 

    @Column() //Columna para el nombre del usuario
    name: string;

    @CreateDateColumn() //Columna de cuando se crea el registro
    createdAt: Date;

}