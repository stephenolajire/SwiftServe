from django.apps import AppConfig
import atexit

class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Auth'

    def ready(self):
        # Use absolute import instead of relative import
        from Project.schedulers import start, shutdown
        start()
        atexit.register(shutdown)