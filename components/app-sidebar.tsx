"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Target,
  History,
  Settings2,
  Sparkles,
  LifeBuoy,
  Command
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const getMenuData = () => ({
  // MENU PRINCIPAL (O fluxo de trabalho)
  navMain: [
    {
      title: "Foco Diário", // Era "Playground"
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true, // Deixa a aba principal destacada/aberta
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard",
        }
      ],
    },
    {
      title: "Chat com Chefe",
      url: "/chat",
      icon: Sparkles, // Using Sparkles as a placeholder or import MessageSquare
      isActive: false,
    },
    {
      title: "Meus Objetivos", // Era "Models"
      url: "/dashboard/goals",
      icon: Target,
      items: [
        {
          title: "Metas Ativas",
          url: "/dashboard/goals",
        },
      ],
    },
    {
      title: "Evolução", // Era "Documentation"
      url: "/dashboard/history",
      icon: History,
      items: [
        {
          title: "Histórico de Ciclos",
          url: "/dashboard/history",
        },
        {
          title: "Análise Semanal",
          url: "/dashboard/analytics",
        },
      ],
    },
  ],

  // MENU SECUNDÁRIO (Configurações e Extras)
  // Eu movi a parte de "projects" para cá ou deletei, pois seu SaaS não tem "Projetos"
  navSecondary: [
    {
      title: "Persona do Chefe", // O diferencial do seu app
      url: "/dashboard/persona",
      icon: Sparkles,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Feedback / Suporte",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
  ],

  // Deixe vazio para não renderizar a seção "Projects" que veio no template
  projects: []
})

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const data = getMenuData()

  // Fallback caso não receba o usuário
  const userData = user || {
    name: "Visitante",
    email: "guest@example.com",
    avatar: "https://i.pravatar.cc/150",
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Chefe IA</span>
                  <span className="truncate text-xs">Administrador</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
