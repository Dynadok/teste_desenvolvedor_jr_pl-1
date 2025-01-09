import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";
import axios from "axios";
import fs from "fs";

const router = Router();
const tasksRepository = new TasksRepository();
const SUPPORTED_LANGUAGES = ["pt", "en", "es"];

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    }
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: "Language not supported" });
    }

    // Cria a "tarefa"
    const task = tasksRepository.createTask(text, lang);

    // Solicita o resumo do texto ao serviço Python
    const response = await axios.post("http://localhost:5000/summarize", { text, lang });
    const summary = response.data.summary;

    // Atualiza a tarefa com o resumo
    tasksRepository.updateTask(task.id, summary);

    // Persistir a tarefa em um arquivo JSON
    fs.writeFileSync("tasks.json", JSON.stringify(tasksRepository.getAllTasks(), null, 2));

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

// GET: Retorna uma tarefa pelo ID
router.get("/:id", (req: Request, res: Response) => {
  try {
    const task = tasksRepository.getTaskById(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    return res.json(task);
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return res.status(500).json({ error: "Ocorreu um erro ao buscar a tarefa." });
  }
});

// GET: Lista todas as tarefas
router.get("/", (req: Request, res: Response) => {
  try {
    const tasks = tasksRepository.getAllTasks();
    return res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    return res.status(500).json({ error: "Ocorreu um erro ao listar as tarefas." });
  }
});

// DELETE: Remove uma tarefa pelo ID
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const task = tasksRepository.getTaskById(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    tasksRepository.deleteTask(Number(req.params.id));

    // Persistir a tarefa em um arquivo JSON
    fs.writeFileSync("tasks.json", JSON.stringify(tasksRepository.getAllTasks(), null, 2));

    return res.status(200).json({ message: "Tarefa removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover tarefa:", error);
    return res.status(500).json({ error: "Ocorreu um erro ao remover a tarefa." });
  }
});

export default router;