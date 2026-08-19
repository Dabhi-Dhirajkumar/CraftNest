from django.apps import AppConfig


class CraftsConfig(AppConfig):
    name = 'crafts'

    def ready(self):
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            email = 'dipakparmar22006@gmail.com'
            username = 'dipakparmar22006'
            password = 'admin123'
            
            if not User.objects.filter(email=email).exists() and not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                    first_name='Dipak',
                    last_name='Parmar'
                )
        except Exception:
            pass
