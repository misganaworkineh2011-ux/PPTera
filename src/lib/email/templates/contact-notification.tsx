import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ContactNotificationProps {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: string;
  submittedAt: string;
}

export function ContactNotification({
  userName,
  userEmail,
  subject,
  message,
  category,
  submittedAt,
}: ContactNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {userName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Form Submission</Heading>

          <div style={infoBox}>
            <Text style={label}>From:</Text>
            <Text style={value}>{userName} ({userEmail})</Text>
            
            <Text style={label}>Category:</Text>
            <Text style={value}>{category}</Text>
            
            <Text style={label}>Subject:</Text>
            <Text style={value}>{subject}</Text>
            
            <Text style={label}>Submitted:</Text>
            <Text style={value}>{submittedAt}</Text>
          </div>

          <Hr style={hr} />

          <Text style={label}>Message:</Text>
          <Text style={messageBox}>{message}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            Reply directly to this email to respond to {userName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 24px",
};

const infoBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
};

const label = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#1a1a1a",
  fontSize: "15px",
  margin: "0 0 12px",
};

const messageBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "24px",
  padding: "16px",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "13px",
  margin: "0",
};

export default ContactNotification;
