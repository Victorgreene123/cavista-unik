# Cavista-Unik 🏥✨

**The Future of Smart Healthcare Management & Personal Wellness.**

Cavista-Unik is a modern, AI-powered healthcare platform designed to bridge the gap between patients and medical providers. It features a dual-persona interface that serves both **Individuals (Patients)** seeking personal health insights and **Hospitals (Providers)** managing clinical operations.

---

## 🚀 Key Features

### 👤 For Individuals (Patients)
- **Health Scanning**: Instant biometric analysis (Heart Rate, Oxygen, Stress, Respiration) via optical scanning technology.
- **AI Health Insights**: Personalized, actionable recommendations based on your scan results.
- **Smart Booking**: Schedule appointments with doctors seamlessly.
- **Medical History**: Secure access to your past reports and scan data.
- **Creative UI**: A calming Indigo/Purple theme designed for patient comfort.

### 🏥 For Hospitals (Providers)
- **AI Voice-to-Text Reporting**: Record voice notes and generate structured clinical reports instantly.
- **Provider Dashboard**: Real-time analytics on patient inflow, appointments, and revenue.
- **Clinical Workflow**: Streamlined tools for managing patient data and resources.
- **Professional UI**: A crisp Teal/Emerald theme focused on efficiency and clarity.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Animations**: Custom CSS animations (`animate-blob`, `backdrop-blur`) & transitions.
- **Language**: TypeScript

---

## 📂 Project Structure

```bash
cavista-unik/
├── app/
│   ├── auth/                 # Authentication Routes (Login/Register)
│   │   ├── login/            # Dual-persona Login Page
│   │   └── register/         # Dual-persona Registration Page
│   ├── hospital/             # Hospital Dashboard & Features
│   │   └── (dashboard)/      # Protected Admin Routes
│   ├── individual/           # Patient Portal Features
│   │   ├── (home)/           # Landing & Dashboard
│   │   ├── analyse/          # Health Scanning & Results
│   │   └── appointments/     # Booking System
│   └── api/                  # Backend API Routes
│       └── generate-report/  # AI Report Generation Logic
├── public/                   # Static Assets
└── ...config files           # Tailwind, Next.js, TypeScript configs
```

---

## 🎨 Design Philosophy

The application uses a unique **Dual-Theme System**:
1.  **Patient Mode**: Soft gradients (`from-indigo-50` to `purple-50`), rounded cards, and friendly visuals.
2.  **Provider Mode**: Professional gradients (`from-teal-50` to `emerald-50`), structured layouts, and clinical precision.

Both modes are fully **responsive**, featuring a strict `100vh` layout on mobile to prevent scrolling and ensure an app-like experience.

---

## 🚦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/cavista-unik.git
    cd cavista-unik
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔒 Authentication

- **Login**: `/auth/login` - Toggle between *Individual* and *Hospital* accounts.
- **Register**: `/auth/register` - specific fields for distinct user types.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Powered by Cavista-Unik Team © 2026*
