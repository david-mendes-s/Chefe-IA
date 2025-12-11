export type TaskModel = {
  id: string;
  dailyCycleId: string;
  contextId: string | null;
  title: string;
  aiReasoning: string | null;
  status: "Todo" | "In_Progress" | "Done" | "Failed";
  userFeedback: string | null;
  origin: "AI_Generated" | "User_Added";
  createdAt: Date;
  updatedAt: Date;
  context?: {
    id: string;
    title: string;
  } | null;
};