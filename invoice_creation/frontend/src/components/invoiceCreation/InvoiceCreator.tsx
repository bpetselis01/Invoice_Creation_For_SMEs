import { TabsProps, Tabs, Tab, Box, Button } from "@mui/material";
import { memo, useState, useCallback, useEffect } from "react";
import { OptionalComponent } from "../utils/OptionalComponent";
import { TabIndex, TAB_INFO } from "./invoiceCreationConstants";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import {
  BACKEND_PORT,
  SERVER_IP,
  UPLOAD_ENDPOINT,
} from "../../../../interface/interface";
import { RocketLaunch } from "@mui/icons-material";

/**
 * Top-level component for the invoice creation feature.
 */
export const InvoiceCreator = memo(function InvoiceCreator() {
  const [tab, setTab] = useState<TabIndex>(0);
  const [connected, setConnected] = useState(false);

  const handleChange: NonNullable<TabsProps["onChange"]> = useCallback(
    (_event, newValue) => {
      setTab(newValue);
    },
    []
  );

  // Ping alive every second
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Checking connection");
      axios
        .get("http://localhost:4000/alive", {})
        .then(() => {
          if (!connected) {
            setConnected(true);
            enqueueSnackbar("Connected to creation API!", {
              variant: "success",
            });
          }
        })
        .catch(() => {
          if (connected) {
            setConnected(false);
            enqueueSnackbar("Disconnected from creation API!", {
              variant: "error",
            });
          }
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [connected]);

  const sendEmail = useCallback((blob: Blob) => {
    console.log("Sending email");
    blob.text().then((text) => {
      axios
        .post("https://invoice-seng2021-24t1-eggs.vercel.app/register", {
          email: "odeamat@gmail.com",
          phone: "0412655338",
          username: "ctrlTest2",
          password: "ctrlTest1!2",
        })
        .then(() => {
          axios
            .post("https://invoice-seng2021-24t1-eggs.vercel.app/login", {
              email: "patrick@patrick-moore.com",
              password: "password",
            })
            .then(() => {
              axios
                .post(
                  "https://invoice-seng2021-24t1-eggs.vercel.app/sendEmail",
                  {
                    from: "patrick@patrick-moore.com",
                    recipient: "patrick@patrick-moore.com",
                    xmlString: text,
                  }
                )
                .then(() => {
                  console.log("Email sent");
                });
            });
        })
        .catch((error) => {
          console.log("Failed to send email" + error);
        });
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const { JSONGetter, endpoint } = TAB_INFO[tab];
    const invoice = JSONGetter();

    axios
      .post("http://" + SERVER_IP + ":" + BACKEND_PORT + endpoint, {
        invoice,
      })
      .then((response) => {
        // Create a blob from the response data and download it
        const blob = new Blob([response.data], { type: "application/xml" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Invoice.xml");
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        sendEmail(blob);
        const formData = new FormData();
        formData.append("file", blob, "Invoice.xml");
        axios
          .post(
            `http://${SERVER_IP}:${BACKEND_PORT}${UPLOAD_ENDPOINT}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then(() => {
            console.log("Uploaded file");
          })
          .catch((error) => {
            console.log("Failed to upload file " + error);
          });
      });
  }, [tab, sendEmail]);

  return (
    <>
      <Tabs onChange={handleChange} value={tab} variant="fullWidth">
        {Object.values(TAB_INFO)
          .filter(({ featureFlag }) => featureFlag)
          .map(({ label }, index) => (
            <Tab key={index} label={label} />
          ))}
      </Tabs>
      <Box height={500} overflow="auto">
        {Object.values(TAB_INFO)
          .filter(({ featureFlag }) => featureFlag)
          .map(({ Component }, index) => (
            <OptionalComponent key={index} show={index === tab}>
              <Component />
            </OptionalComponent>
          ))}
      </Box>
      <Box width="100%">
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          endIcon={<RocketLaunch />}
        >
          Create
        </Button>
      </Box>
    </>
  );
});
