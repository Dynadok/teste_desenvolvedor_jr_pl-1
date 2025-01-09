import express, { Application, Request, Response } from 'express';
import tasksRoutes from './routes/tasksRoutes';

const app: Application = express();
app.use(express.json());

// Rota inicial
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});

// Rotas
app.use('/tasks', tasksRoutes);

export default app;