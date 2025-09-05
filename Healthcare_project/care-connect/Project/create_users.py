import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_users():
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
            # Check if user already exists
            if User.objects.filter(email=user_data['email']).exists():
                print(f"User {user_data['email']} already exists")
                continue

            # Create new user
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                phone_number=user_data['phone_number'],
                username=user_data['email']  # Using email as username
            )
            print(f'Successfully created user: {user.email}')
        except Exception as e:
            print(f'Failed to create user {user_data["email"]}: {str(e)}')

if __name__ == '__main__':
    create_users() 