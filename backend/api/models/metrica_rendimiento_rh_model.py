from django.db import models

class MetricaRendimientoRH(models.Model):
    id = models.AutoField(primary_key=True)
    periodo_mes = models.IntegerField()
    periodo_anio = models.IntegerField()
    tasa_rotacion = models.FloatField()
    dias_ausentismo = models.FloatField()
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)
    area = models.ForeignKey('Area', on_delete=models.CASCADE)

    def __str__(self):
        return f"Métrica de Rendimiento RH - Mes: {self.periodo_mes}, Año: {self.periodo_anio}"