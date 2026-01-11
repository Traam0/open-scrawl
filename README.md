# 🕷️ Open-Scrawl

## 📌 Overview

Open-Scrawl is a dynamic web scraping and data analysis platform developed as part of the EFM – Analyse de Données module.

The project enables users to configure web scraping logic without hardcoding, by defining selectors, pagination rules, and data types through a modern web interface. Based on this configuration, scraping scripts are generated dynamically, executed on the backend, and the resulting data can be displayed, cleaned, and visualized.

## 🎯 Objectives

- Automate web data extraction
- Support dynamic and reusable scraping logic
- Clean and normalize extracted data
- Visualize data using graphs and tables
- Apply data analysis concepts in a real-world pipeline

## ✨ Key Features

- 🔄 Dynamic script generation (no page-specific scrapers)
- 🧩 CSS selector–based configuration
- 📄 Pagination support
- 🗂️ Structured data extraction
- 🧹 Data cleaning and normalization
- 📊 Data visualization
- 💾 Persistent configuration using Zustand
- 🌐 Modern full-stack architecture

## 🧱 Tech Stack

### Frontend

- Next.js
- TypeScript
- Zustand (state management & persistence)
- Charting libraries (for visualization)

### Backend

- Python
- Web scraping & data processing libraries
- Generated scraping scripts

## 📁 Project Structure

```
open-scrawl/
├── frontend/        # Next.js frontend (UI, configuration, visualization)
├── generated/       # Python backend (generated scraping logic)
│   ├── *.py
│   └── requirements.txt
├── README.md
└── .gitignore
```

## ⚙️ Setup & Installation

### 🐍 Backend Setup (Python – generated/)

⚠️ **Important:**
The backend requires a Python virtual environment.
You must create and activate the venv before installing dependencies.

#### 1️⃣ Navigate to the generated folder

```bash
cd generated
```

#### 2️⃣ Create a virtual environment

```bash
python -m venv .venv
```

#### 3️⃣ Activate the virtual environment

**Linux / macOS**

```bash
source .venv/bin/activate
```

**Windows**

```cmd
.venv\Scripts\activate
```

#### 4️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

The backend is now ready to run.

### 🌐 Frontend Setup (Next.js)

#### 1️⃣ Navigate to the frontend folder

```bash
cd frontend
```

#### 2️⃣ Install dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

#### 3️⃣ Start the development server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available by default at:

```
http://localhost:3000
```

## 🔁 How It Works (Conceptual Flow)

1. User configures:

   - Target URL
   - Container selector
   - Data selectors (text, attributes, types)
   - Pagination rules

2. Frontend stores configuration persistently

3. Backend generates and executes scraping logic

4. Data is extracted, cleaned, and structured

5. Results are displayed and visualized

## 🤝 Contribution Guidelines

Contributions are welcome and encouraged.

### How to Contribute

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request

### Contribution Rules

- Do not commit venv/ or node_modules/
- Keep code clean and well-documented
- Follow existing project structure

## 👥 Group Members

This project was developed as part of the EFM – Analyse de Données module by:

- Khtou Younes –
- Boukhris Hamza
- Chalabi Nada
- Ivora Only

## 📚 Academic Context

**Module:** EFM – Analyse de Données

**Focus Areas:**

- Web data extraction
- Data cleaning & preprocessing
- Data visualization
- Automation

## 📄 License

This project is developed for educational purposes.
