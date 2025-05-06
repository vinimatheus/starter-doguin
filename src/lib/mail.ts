import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'default@example.com';
const domain = process.env.NEXTAUTH_URL;

const emailTemplate = (
  title: string,
  description: string,
  actionText: string,
  link?: string
) => `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #FAFAFA;
    padding: 24px 0;
    text-align: center;
    color: #171717;
  ">
    <table border="0" cellspacing="0" cellpadding="0" align="center" style="
      max-width: 520px;
      width: 100%;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E5E5;
    ">
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #E5E5E5;">
          <h1 style="
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: -0.025em;
          ">
            ${title}
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px; text-align: left;">
          <p style="
            margin: 0 0 16px;
            font-size: 14px;
            line-height: 1.5;
            color: #525252;
          ">
            ${description}
          </p>
          ${link ? `
          <div style="text-align: center; margin: 24px 0;">
            <a 
              href="${link}" 
              style="
                background: #171717;
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 4px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 400;
                display: inline-block;
              "
            >
              ${actionText}
            </a>
          </div>
          ` : `
          <div style="
            text-align: center;
            margin: 16px 0;
            padding: 12px;
            background-color: #F5F5F5;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
          ">
            ${actionText}
          </div>
          `}
          <p style="
            font-size: 13px;
            color: #737373;
            margin-top: 16px;
          ">
            Se você não fez esta solicitação, ignore este e-mail.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F5F5F5; padding: 12px; text-align: center; border-top: 1px solid #E5E5E5;">
          <p style="
            margin: 0;
            font-size: 12px;
            color: #737373;
          ">
            &copy; ${new Date().getFullYear()} 
            <span style="font-weight: 500;">Starter Doguin</span>. 
            Todos os direitos reservados.
          </p>
        </td>
      </tr>
    </table>
  </div>
`;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  const html = emailTemplate(
    'Redefinir sua senha',
    'Clique no botão abaixo para redefinir sua senha.',
    'Redefinir Senha',
    resetLink
  );

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: 'Redefina sua senha - Starter Doguin',
    html
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const html = emailTemplate(
    'Confirme seu e-mail',
    'Clique no botão abaixo para confirmar seu endereço de e-mail.',
    'Confirmar E-mail',
    confirmLink
  );

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: 'Confirmação de E-mail - Starter Doguin',
    html
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const html = emailTemplate(
    'Seu código de autenticação de dois fatores',
    `Use o código abaixo para completar sua autenticação.`,
    `Código de 2FA: ${token}`,
    '#'
  );

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: 'Código de 2FA - Starter Doguin',
    html
  });
};

export const sendVerificationEmailWithCode = async (
  email: string,
  code: string
) => {
  const html = emailTemplate(
    'Confirme seu e-mail',
    `Use o código abaixo para confirmar seu endereço de e-mail: <br/><br/> 
     <strong style="font-size: 24px;">${code}</strong>`,
    '#'
  );

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: 'Confirmação de E-mail - Starter Doguin',
    html
  });
};
