# React UI Console

React 19 + Vite frontend dashboard. It features dark/light mode switches, silent cookie refresh checks, form validations, and routing panels.

## Folder Structure
* `components/`: Toast snackbars, loading overlays, PasswordField toggle, SearchBox, StatusBadge, ProfileMenu.
* `contexts/`: ThemeContext setting custom Material UI v6 styling (fonts, button gradients, glassmorphism card, border radiuses).
* `layouts/`: DashboardLayout wrapping Sidebar, AppBar, Breadcrumbs, and content outlets.
* `pages/`: Hero marketing views, forms, logs tables, profile configs, error templates.
* `redux/`: Slices managing tokens (auth), loading state, sidebar toggle (ui), and alerts (notifications).
* `services/`: Axios wrapper intercepting requests to bind tokens and capture refreshes.

## Commands
Inside the `frontend` folder, execute:
* `npm install`: Install dependencies.
* `npm run dev`: Boot local web server on port `3000`.
* `npm run build`: Package bundle inside `/dist` directory.
