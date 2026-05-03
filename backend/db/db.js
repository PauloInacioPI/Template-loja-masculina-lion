// =====================================================================
//  Conexão com o MySQL — Lion Modas
//
//  Por que usar POOL em vez de uma conexão única?
//  - Uma conexão só atende 1 query por vez. Se 10 clientes chegam
//    juntos, 9 ficam na fila esperando.
//  - O pool mantém VÁRIAS conexões abertas e reaproveita.
//    Quando uma query termina, a conexão volta pro pool e atende a próxima.
//  - mysql2 cuida disso pra gente: chamamos pool.query() e ele pega
//    uma conexão livre, executa, e devolve. Tudo automático.
// =====================================================================

import mysql from 'mysql2/promise'
import 'dotenv/config'   // carrega .env em process.env

export const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Configurações do pool
  waitForConnections: true,    // se acabar conexão, espera (não rejeita)
  connectionLimit: 10,         // máximo de conexões simultâneas
  queueLimit: 0,               // fila ilimitada de queries esperando

  // Boas práticas
  dateStrings: true,           // datas vêm como string (mais previsível que Date JS)
  charset: 'utf8mb4'           // suporta emoji nos campos
})

/**
 * Testa a conexão chamando "SELECT 1".
 * Útil pra rodar quando o servidor sobe — falha rápido se o banco estiver offline.
 */
export async function testConnection() {
  const [rows] = await pool.query('SELECT 1 AS ok')
  return rows[0].ok === 1
}
