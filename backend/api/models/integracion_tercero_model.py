from django.db import models

class IntergracionTercero(models.Model):
    id = models.AutoField(primary_key=True)
    proveedor = models.CharField(max_length=100)
    clave_api = models.CharField(max_length=200)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.proveedor