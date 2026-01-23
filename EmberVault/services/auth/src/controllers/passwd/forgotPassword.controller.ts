import { getUser } from '@services/users.service.js'
import { loadMailHTML, sendEmail } from '@utils/mail.js'
import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { generateTOTP } from '@utils/totp.js'
import type { NextFunction, Request, Response } from 'express'
import { validateMailFormat } from '@utils/validateEmailFormat.js'

export async function validateForgotPasswordData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { email } = req.body

    if (!email) {
        return sendBadRequestResponse(res, 'Email required.')
    }

    if (!validateMailFormat(email)) {
        return sendBadRequestResponse(res, 'Invalid mail format')
    }

    const user = await getUser(email)
    if (!user) {
        return sendBadRequestResponse(res, 'Invalid user mail.')
    }

    req.userId = user.id

    next()
}

export async function forgotPasswordController(req: Request, res: Response) {
    const user = req.userId
    const { email } = req.body

    if (!user) {
        return sendErrorResponse(res)
    }

    const totpCode = generateTOTP(user)

    const html = await loadMailHTML(totpCode)
    sendEmail(email, html)

    return sendSuccessResponse(res, { id: user })
}
