import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ExportReadyProps {
  presentationTitle: string;
  format: string;
  downloadUrl: string;
  expiresIn: string;
  fileSize?: string;
}

export function ExportReady({
  presentationTitle = "Your Presentation",
  format = "PDF",
  downloadUrl = "https://pptmaster.app/download",
  expiresIn = "24 hours",
  fileSize,
}: ExportReadyProps) {
  const formatName = format.toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Your {formatName} export is ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Export is Ready! 🎉</Heading>
          
          <Text style={text}>
            Great news! Your presentation <strong>{presentationTitle}</strong> has been successfully exported to {formatName}.
          </Text>

          {fileSize && (
            <Text style={text}>
              File size: <strong>{fileSize}</strong>
            </Text>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={downloadUrl}>
              Download {formatName}
            </Button>
          </Section>

          <Text style={text}>
            This download link will expire in <strong>{expiresIn}</strong>. Make sure to download your file before then.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn't request this export, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} PPTera. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ExportReady;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const buttonContainer = {
  padding: "27px 40px",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
};
