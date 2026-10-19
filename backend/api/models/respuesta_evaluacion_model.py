from django.db import models

class Respuesta_evaluacion(models.Model):
    id = models.AutoField(primary_key=True)
    respuesta = models.TextField()
    fecha_respuesta = models.DateTimeField(auto_now_add=True)
    campana = models.ForeignKey('Campana_evaluacion', on_delete=models.CASCADE)
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)
    puesto = models.ForeignKey('Puesto', on_delete=models.CASCADE)
    touchpoint = models.ForeignKey('Touchpoint', on_delete=models.CASCADE)
    area = models.ForeignKey('Area', on_delete=models.CASCADE)

    def __str__(self):
        return self.respuesta