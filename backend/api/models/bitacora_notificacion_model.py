from django.db import models

class Bitacora_notificacion(models.Model):
    id = models.AutoField(primary_key=True)
    proveedor = models.CharField(max_length=100)
    id_transaccion_externa = models.CharField(max_length=100)
    estado_envio = models.CharField(max_length=50)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    campana = models.ForeignKey('Campana_evaluacion', on_delete=models.CASCADE)

    def __str__(self):
        return f"Notificación a {self.proveedor} el {self.fecha_envio}"