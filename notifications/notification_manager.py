import requests
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class NotificationChannel(ABC):
    @abstractmethod
    def send_notification(self, message: str, level: str = 'info', **kwargs) -> bool:
        pass

class SlackNotifier(NotificationChannel):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
        self.logger = logging.getLogger('notifications.slack')

    def send_notification(self, message: str, level: str = 'info', **kwargs) -> bool:
        try:
            color = {
                'info': '#36a64f',
                'warning': '#ffd700',
                'error': '#ff0000',
                'critical': '#7b001c'
            }.get(level, '#36a64f')

            payload = {
                "attachments": [{
                    "color": color,
                    "text": message,
                    "fields": [
                        {"title": k, "value": str(v), "short": True}
                        for k, v in kwargs.items()
                    ]
                }]
            }

            response = requests.post(
                self.webhook_url,
                data=json.dumps(payload),
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code != 200:
                self.logger.error(f'Error enviando notificación a Slack: {response.text}')
                return False
                
            return True
        except Exception as e:
            self.logger.error(f'Error en SlackNotifier: {str(e)}')
            return False

class TelegramNotifier(NotificationChannel):
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.logger = logging.getLogger('notifications.telegram')

    def send_notification(self, message: str, level: str = 'info', **kwargs) -> bool:
        try:
            emoji = {
                'info': 'ℹ️',
                'warning': '⚠️',
                'error': '🚨',
                'critical': '🆘'
            }.get(level, 'ℹ️')

            formatted_message = f"{emoji} *{level.upper()}*\n{message}\n"
            if kwargs:
                formatted_message += "\n*Detalles adicionales:*\n"
                for k, v in kwargs.items():
                    formatted_message += f"- {k}: {v}\n"

            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            payload = {
                'chat_id': self.chat_id,
                'text': formatted_message,
                'parse_mode': 'Markdown'
            }

            response = requests.post(url, json=payload)
            
            if response.status_code != 200:
                self.logger.error(f'Error enviando notificación a Telegram: {response.text}')
                return False
                
            return True
        except Exception as e:
            self.logger.error(f'Error en TelegramNotifier: {str(e)}')
            return False

class EmailNotifier(NotificationChannel):
    def __init__(self, smtp_config: Dict[str, Any]):
        self.smtp_config = smtp_config
        self.logger = logging.getLogger('notifications.email')

    def send_notification(self, message: str, level: str = 'info', **kwargs) -> bool:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'[{level.upper()}] Alerta del Sistema'
            msg['From'] = self.smtp_config['from_email']
            msg['To'] = self.smtp_config['to_email']

            html_content = f"""
            <html>
              <body>
                <h2 style='color: {self._get_color(level)};'>{level.upper()}</h2>
                <p>{message}</p>
                {self._format_details(kwargs)}
              </body>
            </html>
            """

            msg.attach(MIMEText(html_content, 'html'))

            with smtplib.SMTP_SSL(self.smtp_config['smtp_server'], self.smtp_config['smtp_port']) as server:
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
                
            return True
        except Exception as e:
            self.logger.error(f'Error en EmailNotifier: {str(e)}')
            return False

    def _get_color(self, level: str) -> str:
        return {
            'info': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545',
            'critical': '#7b001c'
        }.get(level, '#28a745')

    def _format_details(self, details: Dict[str, Any]) -> str:
        if not details:
            return ''
        
        return """
        <h3>Detalles adicionales:</h3>
        <table border="1" cellpadding="5">
            <tr><th>Campo</th><th>Valor</th></tr>
            {}
        </table>
        """.format(''.join(
            f'<tr><td>{k}</td><td>{v}</td></tr>'
            for k, v in details.items()
        ))

class NotificationManager:
    def __init__(self):
        self.channels: List[NotificationChannel] = []
        self.logger = logging.getLogger('notifications.manager')

    def add_channel(self, channel: NotificationChannel):
        self.channels.append(channel)

    def send_notification(self, message: str, level: str = 'info', **kwargs):
        success = []
        for channel in self.channels:
            try:
                result = channel.send_notification(message, level, **kwargs)
                success.append(result)
            except Exception as e:
                self.logger.error(f'Error enviando notificación: {str(e)}')
                success.append(False)
        
        return any(success)  # Retorna True si al menos un canal tuvo éxito

# Ejemplo de configuración
notification_config = {
    'slack': {
        'webhook_url': os.getenv('SLACK_WEBHOOK_URL', '')
    },
    'telegram': {
        'bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
        'chat_id': os.getenv('TELEGRAM_CHAT_ID', '')
    },
    'email': {
        'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
        'smtp_port': int(os.getenv('SMTP_PORT', '465')),
        'username': os.getenv('SMTP_USERNAME', ''),
        'password': os.getenv('SMTP_PASSWORD', ''),
        'from_email': os.getenv('FROM_EMAIL', ''),
        'to_email': os.getenv('TO_EMAIL', '')
    }
}
