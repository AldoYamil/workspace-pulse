from django.db import models

class AsistenciaCapacitacion(models.Model):
    id = models.AutoField(primary_key=True)
    total_asistentes = models.IntegerField()
    area_id = models.ForeignKey('Area', on_delete=models.CASCADE)
    capacitacion = models.ForeignKey('Capacitacion', on_delete=models.CASCADE)

    def __str__(self):
        return f"Asistencia - {self.capacitacion_id}"