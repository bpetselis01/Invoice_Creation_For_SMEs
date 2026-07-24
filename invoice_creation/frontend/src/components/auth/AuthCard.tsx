import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { MouseEventHandler, ReactNode, memo } from "react";

type AuthCardProps = {
  children?: ReactNode;
  title: string;
  subtitle: string;
  actionText: string;
  handleActionClick: MouseEventHandler<HTMLButtonElement>;
};

export const AuthCard = memo(function AuthCard({
  children,
  title,
  subtitle,
  actionText,
  handleActionClick,
}: AuthCardProps) {
  return (
    <Card sx={{ padding: 1 }}>
      <CardContent>
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
        <Typography>{subtitle}</Typography>
        <Stack spacing={2} sx={{ mt: 2 }} direction="column">
          {children}
          <Button variant="contained" onClick={handleActionClick}>
            {actionText}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
});
