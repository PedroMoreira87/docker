# demo-app

## Getting Started

To run the project locally, you need to have the following installed:

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/) (for using the db locally)

### Installing

To install the project, run the following command:

```bash
npm install
```

### Setting up the database

To set up the database, run the following commands:

```bash
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml -p projectName up -d --build -V
```

This will start a local dynamodb at `http://localhost:3000` and create the tables needed for the project.

### Running the project

To run the project, run the following command:

```bash
npm run dev
```
