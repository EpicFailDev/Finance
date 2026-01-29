# 🧘‍♂️ Finance Zen

**Organizador Financeiro Minimalista e Focado.**
Uma aplicação full-stack projetada para reduzir o ruído visual e proporcionar clareza financeira, com design otimizado para usuários com TDAH (estilo *Zen Kinetic Brutalism*).

---

## ✨ Funcionalidades

- **Dashboard Zen**: Visão clara de saldo, entradas e saídas sem distrações.
- **Gestão de Metas**: Definição de orçamentos por categoria com feedback visual em tempo real.
- **Gráficos de Alta Precisão**: Visualizações dinâmicas (Gastos, Evolução, Metas) usando Recharts.
- **Importação Nubank**: Conversão automática de extratos CSV do Nubank.
- **IA Generativa (Opcional)**: Categorização automática de transações via Gemini 2.0 (resiliente a falhas).
- **Design para Foco**: Tipografia `IBM Plex Sans` e `JetBrains Mono` com geometria nítida para máxima legibilidade.

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling Brutalista)
- **Lucide React** (Icons)
- **Recharts** (Gráficos)

### **Backend**
- **Node.js** + **Express**
- **Drizzle ORM** (Database Access)
- **SQLite / LibSQL** (Turso ready)

---

## 🚀 Como Rodar Localmente

### **Pré-requisitos**
- Node.js (v18 ou superior)
- npm ou yarn

### **1. Configuração do Backend**
O servidor gerencia a persistência dos dados e as regras de negócio.

```bash
cd server
npm install

# Aplica migrate/push para criar o banco SQLite local (dev.db)
npm run db:push

# Inicia o servidor (Porta 3001)
npm run dev
```

### **2. Configuração do Frontend**
A interface Zen para interação com os dados.

```bash
# Retorne à raiz do projeto
cd ..
npm install

# Inicia o app (Porta 3000)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Variáveis de Ambiente (Opcional)

Se desejar usar a categorização automática por IA, crie arquivos `.env` nas respectivas pastas:

**No Frontend (raiz):**
```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**No Backend (`server/`):**
```env
TURSO_DATABASE_URL=libsql://... (opcional para produção)
TURSO_AUTH_TOKEN=seu_token_aqui (opcional para produção)
```

> **Nota:** O app funciona perfeitamente sem essas chaves, utilizando o banco SQLite local e categorização manual.

---

## 🧘 Princípios de Design (ADHD Friendly)

Este projeto utiliza o conceito **Zen Kinetic Brutalism**:
1. **Bordas Sharp (0px)**: Elimina o aspecto "fofo" e transmite precisão.
2. **Whitespace Agressivo**: Margens largas para evitar sobrecarga cognitiva.
3. **Tipografia Mono**: Valores financeiros em fontes Mono para leitura imediata.
4. **Sem Roxo (Purple Ban)**: Paleta Emerald/Slate para um ambiente de calma e foco.

---

## 📄 Licença

Este projeto é para uso pessoal e educacional. Sinta-se à vontade para adaptar às suas necessidades!
