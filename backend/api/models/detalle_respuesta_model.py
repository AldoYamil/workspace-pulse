from django.db import models

class DetalleRespuesta(models.Model):
    id = models.AutoField(primary_key=True)
    valor_ponderado = models.FloatField()
    respuesta_evaluacion = models.ForeignKey('Respuesta_evaluacion', on_delete=models.CASCADE)
    pregunta = models.ForeignKey('Pregunta', on_delete=models.CASCADE)

    def __str__(self):
        return f"DetalleRespuesta {self.id} - Respuesta {self.respuesta.id} - Pregunta {self.pregunta.id}"