// src/components/dashboard/TaskTable.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Clock, Zap, User } from "lucide-react";

// Definição de tipos para ser mais robusto
interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'Done' | 'Failed';
  aiReasoning: string | null;
  origin: 'AI_Generated' | 'User_Added';
}

interface TaskTableProps {
  tasks: Task[];
}

// Helper para visualizar o status
const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'Done':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'Failed':
      return <X className="h-4 w-4 text-red-500" />;
    case 'Todo':
    default:
      return <Clock className="h-4 w-4 text-orange-500" />;
  }
};

// Helper para visualizar a origem
const getOriginBadge = (origin: Task['origin']) => {
  const isAi = origin === 'AI_Generated';
  const icon = isAi ? <Zap className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />;
  const text = isAi ? 'IA' : 'Usuário';
  const color = isAi ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {icon}
      {text}
    </span>
  );
};


export function TaskTable({ tasks }: TaskTableProps) {

  // Futuramente, esta função irá chamar uma Server Action
  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    // Implementação da Server Action no próximo passo
    console.log(`Próxima Ação: Atualizar Task ${taskId} para status 'Done' ou 'Todo'`);
  };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Alterar o min-w para garantir que a Missão use o espaço e o overflow-x-auto entre em ação se necessário */}
          <TableHead className="w-[60%] min-w-[300px]">Missão</TableHead>
          <TableHead className="w-[10%] text-center">Status</TableHead>
          <TableHead className="w-[15%] text-center">Origem</TableHead>
          <TableHead className="w-[15%] text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* ... (lógica de tasks.length === 0) */}
        {tasks.map((task) => (
          <TableRow key={task.id} className={`${task.status === 'Done' ? 'bg-green-50/50' : ''}`}>

            {/* Coluna 1: Missão/Título e Racional da IA */}
            <TableCell className="font-medium align-top py-3"> {/* Alinhamento para o topo */}
              <p className={`text-sm font-medium leading-snug ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.aiReasoning && (
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-normal"> {/* Garante que o texto quebre */}
                  💡 {task.aiReasoning}
                </p>
              )}
            </TableCell>

            {/* Coluna 2: Status (Centralizado) */}
            <TableCell className="text-center align-top py-3">
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon(task.status)}
                {/* Ocultar o texto do status para economizar espaço e usar ícones */}
                {/* <span className="text-sm font-medium">{task.status}</span> */}
              </div>
            </TableCell>

            {/* Coluna 3: Origem (Centralizado) */}
            <TableCell className="text-center align-top py-3">
              <div className="flex justify-center">
                {getOriginBadge(task.origin)}
              </div>
            </TableCell>

            {/* Coluna 4: Ação (Alinhado à Direita e ao Topo) */}
            <TableCell className="text-right align-top py-3">
              <button
                onClick={() => handleToggleStatus(task.id, task.status)}
                className={`p-2 rounded-full transition ${task.status === 'Done' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title={task.status === 'Done' ? 'Marcar como Pendente' : 'Marcar como Concluída'}
              >
                {task.status === 'Done' ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>
            </TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}