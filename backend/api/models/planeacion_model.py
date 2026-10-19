from django.db import models

class Planeacion(models.Model):
    id = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=100)
    descripcion_medida = models.TextField()
    fecha_compromiso = models.DateField()
    estado = models.CharField(max_length=50, default='Pendiente')
    resultado_riesgo = models.ForeignKey('ResultadoRiesgo', on_delete=models.CASCADE)
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)

    def __str__(self):
        return self.titulo