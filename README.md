# Attack Surface Management (ASM) Web Console

## What is this App?
This project is an Attack Surface Management (ASM) / External Attack Surface Management (EASM) dashboard. It provides a comprehensive web-based interface to continuously monitor, discover, analyze, and help remediate vulnerabilities and exposed assets that make up an organization's external attack surface. 

It empowers security operations teams by providing visibility into security grades, asset inventories, risk levels, and vulnerability reports through an intuitive dashboard.

---

## 🛠️ Tech Stack

### Frontend (`apps/web-console`)
- **[Next.js 15](https://nextjs.org/)** (React framework with App Router)
- **React 19**
- **Tailwind CSS v4** for utility-first styling
- **[Lucide React](https://lucide.dev/)** for icons
- **[Recharts](https://recharts.org/)** for data visualization

### Backend (`apps/console`)
- **Node.js & Express.js** (REST API)
- **[Prisma ORM](https://www.prisma.io/)**
- **PostgreSQL via [Neon](https://neon.tech/)** (Serverless Database)
- **JWT & Bcrypt** for secure authentication
- **Python 3** for modular vulnerability scanning scripts

---

## 📂 Project Structure
```text
/prompt_ASM_00
├── apps/
│   ├── web-console/    # Frontend UI (Next.js)
│   └── console/        # Backend API (Express)
│       ├── python_modules/ # Vulnerability scanning scripts
│       └── prisma/     # DB Schema (PostgreSQL)
└── PROJECT_ARCHITECTURE.md # Detailed architecture documentation
```

---

## 🚀 How to Run This Project

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **Python 3.x**
- **Neon/PostgreSQL** Connection String (set in `.env`)

### 2. Backend Setup (`apps/console`)
1. Navigate to the backend directory:
   ```bash
   cd apps/console
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file with `DATABASE_URL` and `SHODAN_API_KEY`.
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (`apps/web-console`)
1. Navigate to the frontend directory:
   ```bash
   cd apps/web-console
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Vulnerability Scanning
The system utilizes a custom Python engine located at `apps/console/python_modules` to perform active scanning on targets. This includes checks for:
- SSL/TLS vulnerabilities (OpenSSL)
- HTTP/HTTPS redirect misconfigurations
- Anonymous FTP access
- Insecure session cookie attributes

---

## 🏗️ Building for Production
To create an optimized production build, run `npm run build` in both `apps/console` and `apps/web-console` directories.
