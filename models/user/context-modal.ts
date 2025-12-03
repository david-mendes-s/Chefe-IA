export type ContextModel = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};