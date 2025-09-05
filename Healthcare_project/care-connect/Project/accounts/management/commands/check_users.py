from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Check for existing users with specific email addresses'

    def handle(self, *args, **kwargs):
        emails = [
            'kruthikhavishali.k2023@vitstudent.ac.in',
            'vishalikrishna2004@gmail.com',
            'dhanyavalavan@gmail.com',
            'dhanyavalavan.2023@vitstudent.ac.in'
        ]

        self.stdout.write("\nChecking for existing users:")
        self.stdout.write("-" * 50)
        for email in emails:
            users = User.objects.filter(email=email)
            count = users.count()
            if count > 0:
                self.stdout.write(f"Found {count} user(s) with email: {email}")
                for user in users:
                    self.stdout.write(f"  - Username: {user.username}, Created: {user.date_joined}")
            else:
                self.stdout.write(f"No users found with email: {email}")
        self.stdout.write("-" * 50) 