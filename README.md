# 🏦Treasurly: Personal Finance Tracker

<br>

## 📦1. Overview
Many individuals struggle to manage their finances effectively, leading to overspending and limited savings visibility.

The **Personal Finance Tracker** is a full-stack web application designed to centralize financial information, automate transaction categorization, and provide users with clear analytics and budgeting insights. It integrates a Spring Boot backend with a React + Vite frontend and a MongoDB Atlas database.

<br>

## 🛠2. System Architecture
The system follows a client–server model with RESTful communication.

- **Frontend:** React (Vite + TypeScript)
- **Backend:** Spring Boot (Java 17)
- **Database:** MongoDB Atlas (cloud)
- **Communication:** JSON over HTTP
- **Authentication:** Session-based using Spring Security
- **Testing & Coverage:** JUnit 5 + JaCoCo (HTML and XML reports)

```
frontend/  → React + Vite interface
backend/   → Spring Boot REST API + MongoDB integration
```

<br>


## 📂3. Libraries and Versions

### Backend – Spring Boot
| Library | Version | Purpose |
|----------|----------|----------|
| Spring Boot Starter Web | 3.5.5 | REST API endpoints |
| Spring Boot Starter Data MongoDB | 3.5.5 | NoSQL database integration |
| Spring Boot Starter Security | 3.5.5 | Session-based authentication |
| Spring Boot Starter Actuator | 3.5.5 | Application health monitoring |
| Spring Boot Starter Test | 3.5.5 | Testing utilities |
| JUnit Platform Launcher | Latest (via dependency) | Test execution |
| JaCoCo | 0.8.10 | Code coverage reporting |

<br>

### Frontend – React + Vite
| Library | Version | Purpose |
|----------|----------|----------|
| React | ^19.1.1 | UI library |
| React DOM | ^19.1.1 | DOM rendering |
| React Router DOM | ^7.8.1 | Routing between views |
| Axios | ^1.12.2 | HTTP client for API calls |
| Zod | ^3.23.8 | Data validation |
| Recharts | ^3.2.1 | Data visualization and analytics charts |
| TailwindCSS | ^4.1.15 | Utility-first CSS styling |
| Vite | ^7.1.7 | Frontend build and dev server |
| TypeScript | ~5.9.3 | Static typing |
| ESLint / Prettier | ^9.36.0 / ^3.6.2 | Code linting and formatting |
| Concurrently | ^9.2.0 | Run frontend and backend simultaneously |

<br>

## 🧩4. Working Functionalities

#### a. User Management
- **Sign Up / Login / Logout** with input validation and session persistence  
- **Session-based authentication** using `HttpSession`  
- **Check authentication status** (`/api/users/check`)  
- **Retrieve current user** (`/api/users/me`)

#### b. Transaction Management
- **CRUD operations** for transactions (create, read, update, delete)  
- **Filter by category, type, or user**  
- **Logging for transaction events**

#### c. Budget Management
- **Create, view, update, and delete budgets**  
- **Add or remove budget items** with category-based allocations  
- **Budget summaries by user**

#### d. Category Management
- **View, create, update, and delete categories**  
- **Persistent storage in MongoDB**

#### e. Analytics and Insights
- **Income and expense summaries** per user  
- **Net balance and projected spending (3-month projection)**  
- **Aggregated analytics accessible via `/api/analytics/summary`**

#### f. Testing and Coverage
- **JUnit 5 test suite** for controllers and services  
- **JaCoCo coverage reporting** (HTML report generated at `build/reports/jacocoHtml`)


<br>

## ⚙️5. Quick Start Guide

### Prerequisites
- **Java 17+**
- **Node.js (v16+)**
- **MongoDB Atlas connection string** or local instance on port `27017`

### Environment Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/example/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. **Backend Setup**

   ```bash
   cd backend
   ./gradlew bootRun         # For UNIX
   gradlew bootRun           # For Windows
   ```

   * Backend runs at: **[http://localhost:8080](http://localhost:8080)**

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   npm run dev-unix          # For UNIX
   npm run dev-win           # For Windows
   ```

   * Frontend runs at: **[http://localhost:5173](http://localhost:5173)**

> The `dev-unix` and `dev-win` scripts automatically run both frontend and backend concurrently.


<br>


## 📝6. Deployment Notes

* The database is deployed on **MongoDB Atlas**, providing secure cloud-based data persistence.
* Environment variables (e.g., MongoDB URI) are defined in `.env` for local and cloud builds.
* For UNIX systems, ensure Gradle wrapper has execution permission:

  ```bash
  chmod +x ./gradlew
  ```



<br>


## 🌐8. References

* Spring Boot Documentation: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
* React Documentation: [https://react.dev/](https://react.dev/)
* MongoDB Atlas: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)

---

**Status:** _Functional prototype with ~89% test coverage (verified via JaCoCo)_

_(This project was completed as part of a university group assignment.)_
