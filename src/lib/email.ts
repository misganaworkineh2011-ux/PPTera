import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "PPTMaster <noreply@pptmaster.app>";
const ADMIN_EMAIL = "pptmaster.app@gmail.com";

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Welcome to PPTMaster! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin-bottom: 10px;">Welcome to PPTMaster!</h1>
          </div>
          
          <p>Hi ${userName},</p>
          
          <p>Thanks for joining PPTMaster! We're excited to have you on board.</p>
          
          <p>With PPTMaster, you can:</p>
          <ul>
            <li>Create stunning presentations with AI in minutes</li>
            <li>Choose from professional themes and templates</li>
            <li>Export to PowerPoint, PDF, and more</li>
            <li>Collaborate with your team in real-time</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pptmaster.app/dashboard" style="background: linear-gradient(to right, #1e3a8a, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Creating</a>
          </div>
          
          <p>If you have any questions, just reply to this email or visit our <a href="https://pptmaster.app/help" style="color: #06b6d4;">Help Center</a>.</p>
          
          <p>Happy presenting!<br>The PPTMaster Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} PPTMaster. All rights reserved.<br>
            <a href="https://pptmaster.app/privacy" style="color: #666;">Privacy Policy</a> | <a href="https://pptmaster.app/terms" style="color: #666;">Terms of Service</a>
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}


export async function sendContactNotification(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  try {
    // Send notification to admin
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[Contact Form] ${subject}`,
      replyTo: email,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">New Contact Form Submission</h2>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #06b6d4;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #1e3a8a; margin-bottom: 10px;">Message:</h3>
            <div style="background: #f8fafc; border-radius: 8px; padding: 15px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply to ${name}</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This email was sent from the PPTMaster contact form.<br>
            Submitted at: ${new Date().toLocaleString()}
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send contact notification:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending contact notification:", error);
    return { success: false, error };
  }
}

export async function sendContactConfirmation(
  userEmail: string,
  userName: string,
  subject: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "We received your message - PPTMaster",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin-bottom: 10px;">Message Received!</h1>
          </div>
          
          <p>Hi ${userName},</p>
          
          <p>Thank you for reaching out to us! We've received your message regarding:</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0;">
            <strong>${subject}</strong>
          </div>
          
          <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
          
          <p>In the meantime, you might find answers to common questions in our <a href="https://pptmaster.app/help" style="color: #06b6d4;">Help Center</a>.</p>
          
          <p>Best regards,<br>The PPTMaster Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} PPTMaster. All rights reserved.<br>
            <a href="https://pptmaster.app" style="color: #666;">pptmaster.app</a>
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send contact confirmation:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending contact confirmation:", error);
    return { success: false, error };
  }
}

export async function sendNewsletterWelcome(userEmail: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Welcome to PPTMaster Newsletter! 📬",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin-bottom: 10px;">You're In! 🎉</h1>
          </div>
          
          <p>Thanks for subscribing to the PPTMaster newsletter!</p>
          
          <p>You'll be the first to know about:</p>
          <ul>
            <li>New features and updates</li>
            <li>Presentation tips and best practices</li>
            <li>Exclusive templates and themes</li>
            <li>Special offers and promotions</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pptmaster.app/dashboard" style="background: linear-gradient(to right, #1e3a8a, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Create Your First Presentation</a>
          </div>
          
          <p>Stay tuned for great content!</p>
          
          <p>Best,<br>The PPTMaster Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} PPTMaster. All rights reserved.<br>
            <a href="https://pptmaster.app" style="color: #666;">pptmaster.app</a>
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send newsletter welcome:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending newsletter welcome:", error);
    return { success: false, error };
  }
}

export async function sendJobApplicationConfirmation(
  userEmail: string,
  userName: string,
  jobTitle: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Application Received - ${jobTitle} at PPTMaster`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin-bottom: 10px;">Application Received!</h1>
          </div>
          
          <p>Hi ${userName},</p>
          
          <p>Thank you for applying for the <strong>${jobTitle}</strong> position at PPTMaster!</p>
          
          <p>We've received your application and our team will review it carefully. If your qualifications match our requirements, we'll reach out to schedule the next steps.</p>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e3a8a; margin-top: 0;">What's Next?</h3>
            <ol style="margin-bottom: 0;">
              <li>Our team reviews your application (1-2 weeks)</li>
              <li>Initial screening call if selected</li>
              <li>Technical/role-specific interviews</li>
              <li>Final decision and offer</li>
            </ol>
          </div>
          
          <p>In the meantime, feel free to explore our <a href="https://pptmaster.app" style="color: #06b6d4;">product</a> to learn more about what we're building.</p>
          
          <p>Best of luck!<br>The PPTMaster Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} PPTMaster. All rights reserved.<br>
            <a href="https://pptmaster.app/careers" style="color: #666;">View More Openings</a>
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send job application confirmation:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending job application confirmation:", error);
    return { success: false, error };
  }
}

export async function sendJobApplicationNotification(
  applicantName: string,
  applicantEmail: string,
  jobTitle: string,
  resumeUrl: string,
  coverLetter?: string,
  linkedIn?: string,
  portfolio?: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[New Application] ${jobTitle} - ${applicantName}`,
      replyTo: applicantEmail,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">New Job Application</h2>
            <p style="margin-bottom: 0; font-size: 18px;"><strong>${jobTitle}</strong></p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${applicantName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${applicantEmail}" style="color: #06b6d4;">${applicantEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Resume:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="${resumeUrl}" style="color: #06b6d4;">View Resume</a></td>
            </tr>
            ${linkedIn ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">LinkedIn:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="${linkedIn}" style="color: #06b6d4;">${linkedIn}</a></td>
            </tr>
            ` : ""}
            ${portfolio ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Portfolio:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="${portfolio}" style="color: #06b6d4;">${portfolio}</a></td>
            </tr>
            ` : ""}
          </table>
          
          ${coverLetter ? `
          <div style="margin-top: 20px;">
            <h3 style="color: #1e3a8a; margin-bottom: 10px;">Cover Letter:</h3>
            <div style="background: #f8fafc; border-radius: 8px; padding: 15px; white-space: pre-wrap;">${coverLetter}</div>
          </div>
          ` : ""}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${applicantEmail}" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Contact Applicant</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Submitted at: ${new Date().toLocaleString()}
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send job application notification:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending job application notification:", error);
    return { success: false, error };
  }
}
