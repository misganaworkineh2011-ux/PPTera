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

interface ContactConfirmationProps {
  userName: string;
  subject: string;
}

export function ContactConfirmation({ userName, subject }: ContactConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your message - PPTMaster Support</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>We Got Your Message! 📬</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thanks for reaching out! We&apos;ve received your message regarding:
          </Text>

          <Text style={subjectBox}>
            &quot;{subject}&quot;
          </Text>

          <Text style={text}>
            Our team typically responds within 24-48 hours. We&apos;ll get back to you 
            as soon as possible.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            — The PPTMaster Support Team
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

const subjectBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  color: "#1a1a1a",
  fontSize: "15px",
  fontStyle: "italic",
  padding: "16px",
  margin: "16px 0",
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

export default ContactConfirmation;
