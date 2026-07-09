import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewsletterConfirmationProps {
  confirmUrl: string;
}

export function NewsletterConfirmation({ confirmUrl }: NewsletterConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your PPTera newsletter subscription</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirm Your Subscription 📧</Heading>
          
          <Text style={text}>
            Thanks for subscribing to the PPTera newsletter! 
          </Text>

          <Text style={text}>
            Please confirm your email address by clicking the button below:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmUrl}>
              Confirm Subscription
            </Button>
          </Section>

          <Text style={smallText}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={confirmUrl} style={link}>{confirmUrl}</Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn&apos;t subscribe to our newsletter, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            — The PPTera Team
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
  maxWidth: "560px",
  borderRadius: "8px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
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

const smallText = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "24px 0 8px",
};

const linkText = {
  fontSize: "13px",
  margin: "0",
  wordBreak: "break-all" as const,
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
};

export default NewsletterConfirmation;
