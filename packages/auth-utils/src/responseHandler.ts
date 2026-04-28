import type { Response } from 'express';

// Success response
export const sendSuccessResponse = <T>(
	res: Response,
	data: T | null = null,
	message = 'Operation successful',
	status = 200
): Response => {
	return res.status(status).json({ success: true, message, data });
};

// Error response
export const sendErrorResponse = <T>(
	res: Response,
	error: T | string = 'Something went wrong',
	status = 500
): Response => {
	return res.status(status).json({ success: false, error });
};

// Not Found response
export const sendNotFoundResponse = <T>(
	res: Response,
	error: T | string = 'Not Found',
	status = 404
): Response => {
	return res.status(status).json({ success: false, error });
};

// Unauthorized response
export const sendUnauthorizedResponse = (
	res: Response,
	error = 'Unauthorized',
	status = 401
): Response => {
	return res.status(status).json({ success: false, error });
};

// Forbidden response
export const sendForbiddenResponse = (
	res: Response,
	error = 'Forbidden',
	status = 403
): Response => {
	return res.status(status).json({ success: false, error });
};

// Bad Request response
export const sendBadRequestResponse = <T>(
	res: Response,
	error: T,
	status = 400
): Response => {
	return res.status(status).json({ success: false, error });
};
