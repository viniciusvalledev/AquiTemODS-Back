import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private getHtmlTemplate(
    templateName: string,
    replacements: Record<string, string>,
  ): string {
    const filePath = path.join(
      __dirname,
      `../templates/emails/${templateName}.html`,
    );
    let htmlContent = fs.readFileSync(filePath, "utf-8");

    for (const [key, value] of Object.entries(replacements)) {
      htmlContent = htmlContent.split(`[${key}]`).join(value);
    }

    return htmlContent;
  }

  public async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const confirmationUrl = `https://aquitemods.saquarema.rj.gov.br/confirmar-conta?token=${token}`;

    const htmlContent = this.getHtmlTemplate("confirmacao", {
      LINK_CONFIRMACAO: confirmationUrl,
    });

    const message = {
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to: to,
      subject: "Confirmação de Cadastro - AquiTemODS",
      html: htmlContent,
    };
    await this.transporter.sendMail(message);
  }

  public async sendPasswordResetEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `https://aquitemods.saquarema.rj.gov.br/redefinir-senha?token=${token}`;

    const htmlContent = this.getHtmlTemplate("redefinir-senha", {
      LINK_REDEFINIR: resetUrl,
    });

    const message = {
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to: to,
      subject: "Redefinição de Senha - AquiTemODS",
      html: htmlContent,
    };
    await this.transporter.sendMail(message);
  }

  public async sendEmailChangeConfirmationEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const confirmationUrl = `https://aquitemods.saquarema.rj.gov.br/confirmar-novo-email?token=${token}`;

    const htmlContent = this.getHtmlTemplate("alterar-email", {
      LINK_ALTERAR_EMAIL: confirmationUrl,
    });

    const message = {
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to: to,
      subject: "Confirmação de Alteração de E-mail - AquiTemODS",
      html: htmlContent,
    };
    await this.transporter.sendMail(message);
  }

  public async sendProjectApprovedEmail(
    to: string,
    prefeitura: string,
    nomeProjeto: string,
    projetoId: string,
  ): Promise<void> {
    const htmlContent = this.getHtmlTemplate("projeto-aprovado", {
      PREFEITURA: prefeitura,
      NOME_PROJETO: nomeProjeto,
      PROJETO_ID: projetoId,
    });

    await this.transporter.sendMail({
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to,
      subject: "Seu Projeto no Aqui Tem ODS foi Aprovado!",
      html: htmlContent,
    });
  }

  public async sendProjectUpdateApprovedEmail(
    to: string,
    prefeitura: string,
    nomeProjeto: string,
    projetoId: string,
  ): Promise<void> {
    const htmlContent = this.getHtmlTemplate("projeto-atualizado", {
      PREFEITURA: prefeitura,
      NOME_PROJETO: nomeProjeto,
      PROJETO_ID: projetoId,
    });

    await this.transporter.sendMail({
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to,
      subject:
        "Sua solicitação de atualização de Projeto no Aqui Tem ODS foi Aprovada!",
      html: htmlContent,
    });
  }

  public async sendProjectDeletedEmail(
    to: string,
    prefeitura: string,
    nomeProjeto: string,
  ): Promise<void> {
    const htmlContent = this.getHtmlTemplate("projeto-excluido", {
      PREFEITURA: prefeitura,
      NOME_PROJETO: nomeProjeto,
    });

    await this.transporter.sendMail({
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to,
      subject: "Seu projeto foi removido da plataforma Aqui Tem ODS",
      html: htmlContent,
    });
  }

  public async sendProjectRejectedEmail(
    to: string,
    prefeitura: string,
    nomeProjeto: string,
    tipoSolicitacao: string,
    motivo: string | undefined,
  ): Promise<void> {
    const htmlContent = this.getHtmlTemplate("projeto-rejeitado", {
      PREFEITURA: prefeitura,
      NOME_PROJETO: nomeProjeto,
      TIPO_SOLICITACAO: tipoSolicitacao,
      MOTIVO_REJEICAO:
        motivo || "Para mais detalhes, entre em contato com a nossa equipe.",
    });

    await this.transporter.sendMail({
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to,
      subject: "Sua solicitação no Aqui Tem ODS foi Rejeitada",
      html: htmlContent,
    });
  }

  public async sendAdminResendConfirmationEmail(
    to: string,
    nomeCompleto: string,
    token: string,
  ): Promise<void> {
    const confirmationUrl = `${process.env.FRONTEND_URL || "https://aquitemods.saquarema.rj.gov.br"}/confirmar-conta?token=${token}`;

    const htmlContent = this.getHtmlTemplate("confirmacao", {
      LINK_CONFIRMACAO: confirmationUrl,
    });

    await this.transporter.sendMail({
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to,
      subject: "Confirme sua conta no AquiTemODS",
      html: htmlContent,
    });
  }

  public async sendGenericEmail(options: EmailOptions): Promise<void> {
    const message = {
      from: `"AquiTemODS" <${process.env.MAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
    await this.transporter.sendMail(message);
  }
}

export default new EmailService();
