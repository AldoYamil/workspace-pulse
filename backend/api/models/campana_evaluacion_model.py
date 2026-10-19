from django.db import models

class Campana_evaluacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.BooleanField(default=True)
    guia_referencia = models.ForeignKey('Guia_referencia', on_delete=models.CASCADE)
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre