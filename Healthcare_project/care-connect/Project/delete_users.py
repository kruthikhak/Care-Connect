import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

emails = [
    'kruthikhavishali.k2023@vitstudent.ac.in',
    'vishalikrishna2004@gmail.com',
    'dhanyavalavan@gmail.com',
    'dhanyavalavan.2023@vitstudent.ac.in'
]

for email in emails:
    users = User.objects.filter(email=email)
    count = users.count()
    users.delete()
    print(f"Deleted {count} user(s) with email: {email}") 