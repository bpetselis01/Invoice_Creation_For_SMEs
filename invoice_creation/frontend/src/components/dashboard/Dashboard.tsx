import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type DashboardCardProps = {
  title: string;
  description: string;
  route: string;
};

const DashboardCard = memo(function DashboardCard({
  title,
  description,
  route,
}: DashboardCardProps) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(route);
  }, [navigate, route]);

  return (
    <Card onClick={handleClick}>
      <CardActionArea>
        <CardContent>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
          <Typography>{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

export const Dashboard = memo(function Dashboard() {
  return (
    <div style={{ padding: "10px" }}>
      <Grid2 container columns={2} spacing={2}>
        <Grid2 xs={1}>
          <DashboardCard
            title="Create"
            description="Generate a new invoice"
            route="/app/create"
          />
        </Grid2>
        <Grid2 xs={1}>
          <DashboardCard
            title="View"
            description="View all invoices"
            route="/app/view"
          />
        </Grid2>
      </Grid2>
    </div>
  );
});
