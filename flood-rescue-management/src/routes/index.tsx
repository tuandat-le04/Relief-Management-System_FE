import { createBrowserRouter } from "react-router-dom";
import { Role } from "../constants/roles";
import { Permission } from "../constants/permissions";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Public pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";

// Citizen pages
import CitizenDashboard from "../pages/citizen/Dashboard";
import CreateRescueRequest from "../pages/citizen/CreateRequest";
import MyRequests from "../pages/citizen/MyRequests";

// Rescue Team pages
import RescueTeamDashboard from "../pages/rescue-team/Dashboard";
import AssignedTasks from "../pages/rescue-team/AssignedTasks";
import TaskDetail from "../pages/rescue-team/TaskDetail";

// Rescue Coordinator pages
import CoordinatorDashboard from "../pages/coordinator/Dashboard";
import RequestsManagement from "../pages/coordinator/RequestsManagement";
import TeamCoordination from "../pages/coordinator/TeamCoordination";

// Manager pages
import ManagerDashboard from "../pages/manager/Dashboard";
import VehicleManagement from "../pages/manager/VehicleManagement";
import InventoryManagement from "../pages/manager/InventoryManagement";
import DistributionTracking from "../pages/manager/DistributionTracking";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import SystemConfig from "../pages/admin/SystemConfig";
import Reports from "../pages/admin/Reports";

export const router = createBrowserRouter([
  // Public routes
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },

  // Protected routes
  {
    element: <MainLayout />,
    children: [
      // Citizen routes
      {
        path: "/citizen",
        element: <ProtectedRoute roles={[Role.CITIZEN]} />,
        children: [
          { path: "dashboard", element: <CitizenDashboard /> },
          { path: "create-request", element: <CreateRescueRequest /> },
          { path: "my-requests", element: <MyRequests /> },
        ],
      },

      // Rescue Team routes
      {
        path: "/rescue-team",
        element: <ProtectedRoute roles={[Role.RESCUE_TEAM]} />,
        children: [
          { path: "dashboard", element: <RescueTeamDashboard /> },
          { path: "tasks", element: <AssignedTasks /> },
          { path: "tasks/:id", element: <TaskDetail /> },
        ],
      },

      // Rescue Coordinator routes
      {
        path: "/coordinator",
        element: <ProtectedRoute roles={[Role.RESCUE_COORDINATOR, Role.ADMIN]} />,
        children: [
          { path: "dashboard", element: <CoordinatorDashboard /> },
          { path: "requests", element: <RequestsManagement /> },
          { path: "coordination", element: <TeamCoordination /> },
        ],
      },

      // Manager routes
      {
        path: "/manager",
        element: <ProtectedRoute roles={[Role.MANAGER, Role.ADMIN]} />,
        children: [
          { path: "dashboard", element: <ManagerDashboard /> },
          {
            path: "vehicles",
            element: (
              <ProtectedRoute permissions={[Permission.MANAGE_VEHICLES]} />
            ),
            children: [{ index: true, element: <VehicleManagement /> }],
          },
          {
            path: "inventory",
            element: (
              <ProtectedRoute permissions={[Permission.MANAGE_INVENTORY]} />
            ),
            children: [{ index: true, element: <InventoryManagement /> }],
          },
          {
            path: "distribution",
            element: (
              <ProtectedRoute permissions={[Permission.TRACK_DISTRIBUTIONS]} />
            ),
            children: [{ index: true, element: <DistributionTracking /> }],
          },
        ],
      },

      // Admin routes
      {
        path: "/admin",
        element: <ProtectedRoute roles={[Role.ADMIN]} />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "config", element: <SystemConfig /> },
          { path: "reports", element: <Reports /> },
        ],
      },

      // Error pages
      { path: "/403", element: <Forbidden /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
