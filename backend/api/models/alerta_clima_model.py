from django.db import models

class AlertaClima(models.Model):
    id = models.AutoField(primary_key=True)
    valor_destacado = models.FloatField()
    mensaje = models.TextField()
    fecha_alerta = models.DateTimeField(auto_now_add=True)
    resuelta = models.BooleanField(default=False)
    configuracion_umbral = models.ForeignKey('ConfiguracionUmbral', on_delete=models.CASCADE)

    def __str__(self):
        return f"Alerta de Clima - Valor: {self.valor_destacado}, Fecha: {self.fecha_alerta}, Resuelta: {self.resuelta}"