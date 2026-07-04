# Vendra Frontend Portal

Vendra is a multi-vendor e-commerce order management platform, built as a single React app with three role-based portals: Customer, Vendor, and Admin.

## Folder Structure
* `src/api/`: Centralized API service configuration (`axiosInstance.js`) and namespaced folders for customer, vendor, and admin.
* `src/app/`: Redux store configuration and custom hooks.
* `src/features/`: Module features including Auth (Google Login & Guest mode) and Notifications (polling).
* `src/components/common/`: Shared layout and component systems (Buttons, Badges, Ratings, Spinners, ConfirmDialogs).
* `src/guards/`: Authorization guards (`ProtectedRoute`, `RoleRoute`).
* `src/theme/`: Editorial Material UI theme configuration.
* `src/pages/`: Global pages (`LoginPage`, `AccessDeniedPage`, `PendingApprovalPage`).
* `src/routes/`: Router tables dividing the app into Customer, Vendor, and Admin pathways.

## Commands
Inside the `frontend` folder, execute:
* `npm install`: Install dependencies.
* `npm run dev`: Boot local Vite dev server.
* `npm run mock-api`: Boot json-server mock database on port `4000`.
* `npm run build`: Package bundle for production.
