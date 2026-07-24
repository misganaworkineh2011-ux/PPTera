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

interface CollaborationInviteProps {
  senderName: string;
  presentationTitle: string;
  inviteUrl: string;
  role: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Always use production URL for logo in emails (email clients can't access localhost)
const logoUrl = "https://www.pptera.com/logo.png";

// App colors
const colors = {
  primary: "#0f766e",
  accent: "#14b8a6",
  text: "#1e293b",
  textMuted: "#64748b",
  background: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
};

export function CollaborationInvite({
  senderName,
  presentationTitle,
  inviteUrl,
  role,
}: CollaborationInviteProps) {
  const roleText = role === "editor" ? "edit" : "view";

  return (
    <Html>
      <Head />
      <Preview>
        {senderName} invited you to {roleText} a presentation on PPTera
      </Preview>
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
            <Heading style={heading}>You&apos;re invited to collaborate!</Heading>

            <Text style={text}>
              <strong>{senderName}</strong> has invited you to {roleText} a
              presentation:
            </Text>

            {/* Presentation Card */}
            <Section style={presentationCard}>
              <Text style={presentationTitle_style}>{presentationTitle}</Text>
              <Text style={roleTag}>
                {role === "editor" ? "✏️ Can Edit" : "👁️ Can View"}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={primaryButton} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={noteText}>
              This invitation link is unique to you and will give you{" "}
              {role === "editor" ? "editing" : "viewing"} access to this
              presentation.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={baseUrl} style={footerLink}>
                PPTera
              </Link>
              {" · "}
              <Link href={`${baseUrl}/pricing`} style={footerLink}>
                Pricing
              </Link>
              {" · "}
              <Link href={`${baseUrl}/contact`} style={footerLink}>
                Contact
              </Link>
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
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
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
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: colors.text,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const presentationCard = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const presentationTitle_style = {
  color: colors.white,
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const roleTag = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "14px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "0 0 20px",
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

const noteText = {
  color: colors.textMuted,
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

const divider = {
  borderColor: colors.border,
  margin: "0",
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

export default CollaborationInvite;
