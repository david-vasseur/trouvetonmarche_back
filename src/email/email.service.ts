import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
    export class EmailService {
        private readonly logger = new Logger(EmailService.name);

        async sendResetPasswordEmail(email: string, resetUrl: string) {
            const payload = {
                to: email,
                resetUrl: resetUrl,
                // #TODO Changer le appName quand le nom de domaine sera créé
                appName: 'ez-task',
            };

            try {
                const response = await fetch(`${process.env.RESEND_PROXY_URL}/password-reset`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.INTERNAL_SERVICE_KEY ?? '',
                    },
                    body: JSON.stringify(payload),
                });

                // Si le micro-service répond avec une erreur (4xx, 5xx)
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Microservice responded with status ${response.status}: ${errorText}`);
                }

                this.logger.log(`E-mail de réinitialisation envoyé avec succès à ${email}`);
            } 

            catch (error) {
                this.logger.error(
                    `Échec de l'envoi de l'e-mail à ${email} via le micro-service.`,
                    error instanceof Error ? error.stack : String(error),
                );

                throw new InternalServerErrorException("Impossible d'envoyer l'e-mail pour le moment.");
            }
        }
    }