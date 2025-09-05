import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_recommender.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

emails = [
    'kruthikhavishali.k2023@vitstudent.ac.in',
    'vishalikrishna2004@gmail.com',
    'dhanyavalavan@gmail.com',
    'dhanyavalavan.2023@vitstudent.ac.in'
]

print("\nChecking for existing users:")
print("-" * 50)
for email in emails:
    users = User.objects.filter(email=email)
    count = users.count()
    if count > 0:
        print(f"Found {count} user(s) with email: {email}")
        for user in users:
            print(f"  - Username: {user.username}, Created: {user.date_joined}")
    else:
        print(f"No users found with email: {email}")
print("-" * 50) 