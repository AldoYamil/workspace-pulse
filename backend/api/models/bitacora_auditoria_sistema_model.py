from django.db import models

class BitacoraAuditoriaSistema(models.Model):
    id = models.AutoField(primary_key=True)
    accion = models.CharField(max_length=100)
    tabla_afectada = models.CharField(max_length=100)
    detalles_json = models.JSONField()
    fecha_evento = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.accion} - {self.tabla_afectada} - {self.fecha_evento}"