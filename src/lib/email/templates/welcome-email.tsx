import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to PPTera - Create stunning presentations with AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to PPTera! 🎉</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thanks for signing up! You&apos;re now ready to create beautiful, 
            professional presentations in minutes with the power of AI.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Create Your First Presentation
            </Button>
          </Section>

          <Text style={text}>Here&apos;s what you can do:</Text>
          
          <ul style={list}>
            <li style={listItem}>Generate complete presentations from a simple prompt</li>
            <li style={listItem}>Choose from professional themes and layouts</li>
            <li style={listItem}>Export to PPTX, PDF, or share online</li>
            <li style={listItem}>Edit and customize every slide</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Just reply to this email or visit our{" "}
            <Link href="https://pptmaster.app/help" style={link}>
              Help Center
            </Link>
            .
          </Text>

          <Text style={footer}>
            — The PPTera Team
          </Text>

          <Hr style={hr} />

          <Text style={automatedNotice}>
            This is an automated message from PPTera. Please do not reply to this email.
            If you need assistance, visit our{" "}
            <Link href="https://pptmaster.app/help" style={link}>
              Help Center
            </Link>{" "}
            or contact us at{" "}
            <Link href="mailto:pptmaster.app@gmail.com" style={link}>
              pptmaster.app@gmail.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#5046e5",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
};

const list = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0",
};

const link = {
  color: "#5046e5",
  textDecoration: "underline",
};

const automatedNotice = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
  textAlign: "center" as const,
};

export default WelcomeEmail;
