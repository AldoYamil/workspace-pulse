from django.db import models

class Usuario(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=200, unique=True)
    password_hash = models.CharField(max_length=200)
    rol = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)
    empresa = models.ForeignKey('Empresa', on_delete=models.CASCADE)
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre