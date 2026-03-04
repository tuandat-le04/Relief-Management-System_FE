import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import RescueTeamDashboard from "../pages/RescueTeam/RescueTeamDashboard";
import TeamMembers from "../pages/RescueTeam/TeamMembers";
import ReportRescueTeam from "../pages/RescueTeam/ReportRescueTeam";

const RescueTeamRoutes = [
	{
		path: "/rescue-team/dashboard",
		element: (
			<ProtectedRoute allowedRoles={["RESCUE_TEAM"]}>
				<RescueTeamDashboard />
			</ProtectedRoute>
		),
	},
	{
		path: "/rescue-team/members",
		element: (
			<ProtectedRoute allowedRoles={["RESCUE_TEAM"]}>
				<TeamMembers />
			</ProtectedRoute>
		),
	},
	{
		path: "/rescue-team/history",
		element: (
			<ProtectedRoute allowedRoles={["RESCUE_TEAM"]}>
				<ReportRescueTeam />
			</ProtectedRoute>
		),
	},
];

export default RescueTeamRoutes;

