# Телефонная книга - React приложение

Управление телефонными номерами с синхронизацией в реальном времени

## Особенности
- Добавление и удаление телефонных номеров
- Валидация номеров
- Синхронизация между устройствами через WebSocket
- Автономная база данных SQLite

## Технологии
- **Клиент**: React, Redux Toolkit, Tailwind CSS (CDN)
- **Сервер**: Node.js, Express, WebSocket
- **База данных**: SQLite
- **Инфраструктура**: Vite

## Как запустить локально

### Предварительные требования
- Node.js v22.16.0
- npm v10.9.2

### Шаги установки

1. Клонируйте репозиторий:
```bash
git clone https://github.com/IaroslavBurov/phone-book-app.git
cd phone-book-app
```

2. Установите зависимости для сервера:
```bash
cd server
npm install
```

3. Установите зависимости для клиента:
```bash
cd ../client
npm install
```

4. Создайте базу данных:
```bash
# Вернитесь в корень проекта
cd ..
mkdir database
```

### Запуск приложения

1. Запустите сервер:
```bash
cd server
npm start
```

2. Запустите клиент:
```bash
cd ../client
npm run dev
```

3. Откройте в браузере:
```
http://localhost:5173
```

### Переменные окружения

Для клиента (файл `client/.env.local`):
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
```

Для сервера (файл `server/.env`):
```env
PORT=8080
DATABASE_URL=../database/phones.db
```

## Как развернуть в продакшене

### Клиент (Vercel)
1. Импортируйте репозиторий в Vercel
2. Установите настройки:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
3. Добавьте переменные окружения:
   ```env
   VITE_API_URL = https://ваш-домен/api
   ```

### Сервер (Render/Hetroku)
1. Создайте новый Web Service
2. Настройки:
   - Build Command: `cd server && npm install`
   - Start Command: `node index.js`
3. Добавьте переменные окружения:
   ```env
   PORT=8080
   DATABASE_URL=/data/phones.db
   ```