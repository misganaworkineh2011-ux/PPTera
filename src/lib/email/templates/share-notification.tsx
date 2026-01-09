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

interface ShareNotificationProps {
  senderName: string;
  presentationTitle: string;
  presentationUrl: string;
  message?: string;
}

export function ShareNotification({
  senderName,
  presentationTitle,
  presentationUrl,
  message,
}: ShareNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} shared a presentation with you</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You&apos;ve Got a Presentation! 🎁</Heading>
          
          <Text style={text}>
            <strong>{senderName}</strong> shared a presentation with you:
          </Text>

          <Text style={presentationBox}>
            {presentationTitle}
          </Text>

          {message && (
            <>
              <Text style={label}>Message from {senderName}:</Text>
              <Text style={messageBox}>&quot;{message}&quot;</Text>
            </>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={presentationUrl}>
              View Presentation
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This presentation was shared via PPTMaster. 
            Create your own stunning presentations at pptmaster.app
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

const presentationBox = {
  backgroundColor: "#5046e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  padding: "20px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const label = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "16px 0 8px",
};

const messageBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  color: "#4a4a4a",
  fontSize: "15px",
  fontStyle: "italic",
  padding: "16px",
  margin: "0 0 16px",
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
  textAlign: "center" as const,
};

export default ShareNotification;
