import { Link, Stack, TextField, Typography } from "@mui/material";
import {
  ChangeEventHandler,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { AuthCard } from "./AuthCard";
import {
  useEmailAtom,
  usePasswordAtom,
  usePhoneAtom,
  useUsernameAtom,
} from "./authState";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export const LoginPage = memo(function LoginPage() {
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useUsernameAtom();
  const [email, setEmail] = useEmailAtom();
  const [password, setPassword] = usePasswordAtom();
  const [phone, setPhone] = usePhoneAtom();

  const handleSignup = useCallback(async () => {
    axios
      .post("http://54.206.144.207:4000/register", {
        username,
        email,
        password,
        phone,
      })
      .then(() => {
        setRegistering(false);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar("Registration failed", {
          variant: "error",
        });
      });
  }, [email, password, phone, username, setRegistering]);

  const handleLogin = useCallback(() => {
    axios
      .post("http://54.206.144.207:4000/login", {
        username,
        password,
      })
      .then(() => {
        console.log("Logged in");
        navigate("/app/dashboard");
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar("Invalid username or password", {
          variant: "error",
        });
      });
  }, [username, password, navigate]);

  const { title, subtitle, handleAuthAction } = useMemo(() => {
    if (registering) {
      return {
        title: "Sign Up",
        subtitle: "Register for an account",
        handleAuthAction: handleSignup,
      };
    } else {
      return {
        title: "Sign In",
        subtitle: "Log in to your account",
        handleAuthAction: handleLogin,
      };
    }
  }, [registering, handleLogin, handleSignup]);

  const handleUsernameChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => setUsername(e.target.value), [setUsername]);
  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => setEmail(e.target.value),
    [setEmail]
  );
  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => setPassword(e.target.value), [setPassword]);
  const handlePhoneChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => setPhone(e.target.value),
    [setPhone]
  );

  return (
    <SnackbarProvider maxSnack={3}>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          backgroundColor: "#DDDDDD",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <img src="/logo.png" alt="logo" width="100%" />
          <Typography variant="h4" fontStyle="italic" color="#549e39">
            Finance turbocharged.
          </Typography>
        </div>
        <div
          style={{
            height: "100%",
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack direction="column" alignItems="center" spacing={1}>
            <AuthCard
              title={title}
              subtitle={subtitle}
              actionText={title}
              handleActionClick={handleAuthAction}
            >
              {registering ? (
                <>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={handleUsernameChange}
                  />
                  <TextField
                    label="Email"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <TextField
                    label="Password"
                    value={password}
                    type="password"
                    onChange={handlePasswordChange}
                  />
                  <TextField
                    label="Phone"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={handleUsernameChange}
                  />
                  <TextField
                    label="Password"
                    value={password}
                    type="password"
                    onChange={handlePasswordChange}
                  />
                </>
              )}
            </AuthCard>
            <Typography onClick={() => setRegistering(!registering)}>
              <Link>
                {registering
                  ? "Already have an account? Log in"
                  : "New to Rapid Receipt? Sign up"}
              </Link>
            </Typography>
          </Stack>
        </div>
      </div>
    </SnackbarProvider>
  );
});
