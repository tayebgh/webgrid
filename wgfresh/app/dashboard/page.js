import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "My Dashboard — WebGrid",
  description: "Manage and organise your bookmarked websites. Download your bookmark collection for your browser.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
