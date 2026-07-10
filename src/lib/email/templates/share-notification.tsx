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

interface ShareNotificationProps {
  senderName: string;
  presentationTitle: string;
  presentationUrl: string;
  message?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pptera.com";

// Always use production URL for logo in emails (email clients can't access localhost)
const logoUrl = "https://www.pptera.com/logo.png";

// App colors from not-found page
const colors = {
  primary: "#1e3a8a",      // Deep blue
  accent: "#06b6d4",       // Cyan
  text: "#1e293b",         // Slate 800
  textMuted: "#64748b",    // Slate 500
  background: "#f8fafc",   // Slate 50
  white: "#ffffff",
  border: "#e2e8f0",       // Slate 200
};

export function ShareNotification({
  senderName,
  presentationTitle,
  presentationUrl,
  message,
}: ShareNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} shared a presentation with you on PPTera</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Img
              src={logoUrl}
              alt="PPTera"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              {senderName} shared a presentation with you
            </Heading>
            
            {/* Presentation Card */}
            <Section style={presentationCard}>
              <Text style={presentationTitle_style}>
                {presentationTitle}
              </Text>
            </Section>

            {/* Personal Message */}
            {message && (
              <Section style={messageSection}>
                <Text style={messageLabel}>Message from {senderName}:</Text>
                <Text style={messageBox}>{message}</Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={primaryButton} href={presentationUrl}>
                View Presentation
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Try PPTera Section */}
          <Section style={ctaSection}>
            <Text style={ctaHeading}>Create your own presentations</Text>
            <Text style={ctaText}>
              PPTera helps you create professional presentations in minutes with AI-powered content generation.
            </Text>
            <Section style={buttonSection}>
              <Button style={secondaryButton} href={`${baseUrl}?ref=share`}>
                Try PPTera Free
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={baseUrl} style={footerLink}>PPTera</Link>
              {" · "}
              <Link href={`${baseUrl}/pricing`} style={footerLink}>Pricing</Link>
              {" · "}
              <Link href={`${baseUrl}/contact`} style={footerLink}>Contact</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: colors.background,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: colors.white,
  margin: "0 auto",
  maxWidth: "520px",
  borderRadius: "16px",
  overflow: "hidden" as const,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const logoSection = {
  padding: "32px 40px 24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  height: "32px",
  width: "auto",
};

const contentSection = {
  padding: "0 40px 32px",
};

const heading = {
  color: colors.text,
  fontSize: "22px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const presentationCard = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 24px",
};

const presentationTitle_style = {
  color: colors.white,
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  textAlign: "center" as const,
};

const messageSection = {
  margin: "0 0 24px",
};

const messageLabel = {
  color: colors.textMuted,
  fontSize: "13px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const messageBox = {
  backgroundColor: colors.background,
  borderRadius: "8px",
  borderLeft: `3px solid ${colors.accent}`,
  color: colors.text,
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "1.6",
  padding: "14px 16px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
};

const primaryButton = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
  borderRadius: "8px",
  color: colors.white,
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 28px",
  display: "inline-block",
};

const divider = {
  borderColor: colors.border,
  margin: "0",
};

const ctaSection = {
  backgroundColor: colors.background,
  padding: "28px 40px",
};

const ctaHeading = {
  color: colors.text,
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const ctaText = {
  color: colors.textMuted,
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const secondaryButton = {
  backgroundColor: colors.white,
  border: `2px solid ${colors.primary}`,
  borderRadius: "8px",
  color: colors.primary,
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
};

const footer = {
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: colors.textMuted,
  fontSize: "13px",
  margin: "0",
};

const footerLink = {
  color: colors.textMuted,
  textDecoration: "none",
};

export default ShareNotification;
