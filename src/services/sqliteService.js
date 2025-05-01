import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('jusagenda.db');

export function initDB() {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY NOT NULL, title TEXT, data TEXT, tipo TEXT, cliente TEXT, descricao TEXT, local TEXT, numeroProcesso TEXT)'
    );
  });
}

export function saveEventToDB(event) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT OR REPLACE INTO events (id, title, data, tipo, cliente, descricao, local, numeroProcesso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [event.id, event.title, event.data, event.tipo, event.cliente, event.descricao, event.local, event.numeroProcesso]
    );
  });
}

export function getEventsFromDB(callback) {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM events', [], (_, { rows }) => {
      callback(rows._array);
    });
  });
}
