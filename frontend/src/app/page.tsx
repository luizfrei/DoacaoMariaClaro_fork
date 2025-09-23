import React from "react";
import { Header } from "@/components/layout/Header";
import Doacao from "./doacao";
import DashboardUsuarios from "./dashboard";
import Card, { CardContent } from "./card";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto

export default function HomePage() {
  return (
    <>
      <Header />
  
      <DashboardUsuarios />
    </>
  );
}

