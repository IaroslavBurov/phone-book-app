const allowedOrigins = [
  'http://localhost:5173',
  'https://your-production-domain.com'
];

const express = require('express');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8080;
const server = app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

// WebSocket Server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws', 
  clientTracking: true 
});

// SQLite Database
const dbPath = path.join(__dirname, '..', 'database', 'phones.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Ошибка подключения к БД:', err);
  else console.log('Подключено к SQLite базе данных');
});

// Создаём папку для БД, если её нет
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Создаём таблицу
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS phones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_code TEXT NOT NULL,
      number TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Middleware
// Добавлен express.json() для парсинга JSON
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  next();
});

// API Routes
app.get('/api/phones', (req, res) => {
  db.all('SELECT * FROM phones ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/phones', (req, res) => {
  const { countryCode, number } = req.body;
  
  // Проверка наличия данных
  if (!countryCode || !number) {
    return res.status(400).json({ error: 'Не указан код страны или номер' });
  }
  
  // Валидация на сервере
  if (!/^\d{3,10}$/.test(number)) {
    return res.status(400).json({ error: 'Номер должен содержать от 3 до 10 цифр' });
  }

  db.run(
    'INSERT INTO phones (country_code, number) VALUES (?, ?)',
    [countryCode, number],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Этот номер уже существует' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const newPhone = { 
        id: this.lastID, 
        country_code: countryCode, 
        number,
        created_at: new Date().toISOString()
      };
      
      // Рассылаем новое событие всем клиентам
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: 'ADD_PHONE', 
            phone: newPhone 
          }));
        }
      });
      
      res.status(201).json(newPhone);
    }
  );
});

app.delete('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM phones WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Номер не найден' });
    }
    
    // Рассылаем событие удаления
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'DELETE_PHONE', 
          id: parseInt(id) 
        }));
      }
    });
    
    res.json({ message: 'Номер удалён' });
  });
});

// WebSocket обработчик
wss.on('connection', (ws, req) => {
  console.log('Новый WebSocket клиент подключён', req.socket.remoteAddress);
  
  // Отправляем приветственное сообщение
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Добро пожаловать!' }));
  
  ws.on('message', (message) => {
    console.log('Получено сообщение от клиента:', message);
  });
  
  ws.on('close', () => {
    console.log('WebSocket клиент отключён');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket ошибка:', error);
  });
});

module.exports = { app, server, wss };