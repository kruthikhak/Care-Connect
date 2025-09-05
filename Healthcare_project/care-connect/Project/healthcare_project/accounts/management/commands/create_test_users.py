from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates test users for development'

    def handle(self, *args, **kwargs):
        users = [
            {
                'email': 'kruthikhavishali.k2023@vitstudent.ac.in',
                'password': 'Kruthikha@1',
                'first_name': 'Kruthikhavishali',
                'last_name': '',
                'phone_number': '8825500979'
            },
            {
                'email': 'hubarta8@gmail.com',
                'password': 'Kruthikha@1',
                'first_name': 'Hubarta',
                'last_name': 'Joan',
                'phone_number': '8825500979'
            }
        ]

        for user_data in users:
            try:
                user = User.objects.create_user(
                    email=user_data['email'],
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    phone_number=user_data['phone_number'],
                    username=user_data['email']  # Using email as username
                )
                self.stdout.write(self.style.SUCCESS(f'Successfully created user: {user.email}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to create user {user_data["email"]}: {str(e)}')) 