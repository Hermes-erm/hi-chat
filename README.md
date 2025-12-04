# hi chat

A pub/sub-based chat application

Langs & frameworks: Express + Ts, ioredis, socket.io, mongodb, redis

## Features

- chat 1:1
- 1 : Many (room)
- User authentication
- Data persistence

## Run Locally

Clone | fork -> clone the project

```bash
  git clone https://github.com/Hermes-erm/hi-chat.git
```

Go to the project directory

```bash
  cd hi-chat
```

Create there .env file

```bash
  MONGO_CHATAPP = mongodb://localhost:27017/chatdb

  REDIS_URL = redis://localhost:6379

  JWT_SECRET_KEY = somekey

  PORT = 3000
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run build
  npm start
```

## API Reference

#### Get chats

```http
  GET /chat/user/:id
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `id`      | `string` | **Required**. JWT token |

#### List room members

```http
  GET /chat/members/:chatId
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `chatId`  | `string` | **Required**. JWT token |

#### chat history

```http
  GET /chat/history/:chatId?limit={50}&before={2025-12-03T10:13:04.273Z}

```

| Parameter | Type     | Description  |
| :-------- | :------- | :----------- |
| `chatId`  | `string` | **Required** |
| `limit`   | `string` | **Required** |
| `before`  | `Date`   |              |
