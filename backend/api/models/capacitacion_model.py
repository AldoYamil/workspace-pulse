from django.db import models

class Capacitacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_taller = models.CharField(max_length=100)
    instructor = models.CharField(max_length=100)
    fecha_taller = models.DateField()
    horas_duracion = models.IntegerField()
    planeacion_id = models.ForeignKey('Planeacion', on_delete=models.CASCADE)
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre_taller