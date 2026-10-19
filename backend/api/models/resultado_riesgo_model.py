from django.db import models

class ResultadoRiesgo(models.Model):
    id = models.AutoField(primary_key=True)
    puntuacion_riesgo = models.FloatField()
    nivel_riesgo = models.CharField(max_length=100)
    fecha_calculo = models.DateTimeField(auto_now_add=True)
    campana_evaluacion = models.ForeignKey('Campana_evaluacion', on_delete=models.CASCADE)
    area = models.ForeignKey('Area', on_delete=models.CASCADE)
    puesto = models.ForeignKey('Puesto', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.puntuacion_riesgo} - {self.nivel_riesgo} - {self.fecha_calculo}"