from django.db import models

class Puesto(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    area = models.ForeignKey('Area', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre