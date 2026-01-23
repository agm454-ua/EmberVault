import { ENV } from '@config/env.js'
import path from 'path'
import fs from 'fs/promises'
import nodemailer from 'nodemailer'

export async function sendEmail(
    to: string,
    html: string,
    subject: string = 'Ember Vault Recovery Code',
): Promise<void> {
    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: ENV.MAIL_DIR,
            pass: ENV.MAIL_PASSWORD,
        },
    })

    // Email configuration
    const mailOptions = {
        from: ENV.MAIL_DIR,
        to: to,
        subject: subject,
        html: html,
        // No longer sending the logo picture over mail for security and aesthetic reasons
        // attachments: [
        //    {
        //        filename: 'EmberVault.png',
        //        path: './public/img/EmberVault.png',
        //        cid: 'embervaultlogo'
        //    }
        //]
    }

    await transporter.sendMail(mailOptions)
}

export async function loadMailHTML(code: string): Promise<string> {
    const htmlTemplatePath = path.join(process.cwd(), 'public', 'mail.html')
    const htmlContent = await fs.readFile(htmlTemplatePath, 'utf-8')

    // Add the url with the code to the html
    const resetPasswordPageUrlWithCode = `${ENV.FRONTEND_URL}/reset-password?code=${code}`
    const htmlWithCode = htmlContent.replace(
        /{{\s*[^}]+\s*}}/g,
        resetPasswordPageUrlWithCode,
    )

    return htmlWithCode
}
