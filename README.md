# Podly Lambda

Podcast API using AWS Lambda and Serverless Framework with TypeScript.

## 🚀 Features

- TypeScript support
- AWS Lambda functions
- API Gateway integration
- Local development with Serverless Offline
- Webpack bundling

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS CLI configured (for deployment)

## 🛠 Installation

```bash
npm install
```

## 🏃‍♂️ Local Development

Start the local development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Health Check

- `GET /hello` - Hello world endpoint

### Podcasts

- `POST /podcasts` - Create a new podcast
- `GET /podcasts` - List all podcasts (with optional category filter)
- `GET /podcasts/{id}` - Get a specific podcast

## 📝 Example Requests

### Create a podcast

```bash
curl -X POST http://localhost:3000/podcasts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Podcast",
    "description": "A great podcast about tech",
    "category": "technology",
    "duration": 1800
  }'
```

### List podcasts

```bash
curl http://localhost:3000/podcasts
```

### Get a specific podcast

```bash
curl http://localhost:3000/podcasts/{podcast-id}
```

## 🚀 Deployment

Deploy to AWS:

```bash
# Development environment
npm run deploy:dev

# Production environment
npm run deploy:prod
```

## 📁 Project Structure

```
src/
├── handlers/          # Lambda function handlers
│   ├── hello.ts       # Hello world handler
│   └── podcast.ts     # Podcast-related handlers
├── types/             # TypeScript type definitions
│   └── api.ts         # API types
├── utils/             # Utility functions
│   └── response.ts    # Response helpers
└── index.ts           # Entry point
```

## 🛠 Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build the project
- `npm run deploy` - Deploy to AWS
- `npm run deploy:dev` - Deploy to development stage
- `npm run deploy:prod` - Deploy to production stage
- `npm run remove` - Remove deployed stack
- `npm run logs` - View function logs
- `npm run lint` - Type check without compilation

## 📄 License

ISC
