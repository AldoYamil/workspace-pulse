from django.db import models

class RecomendacionCatalogo(models.Model):
    id = models.AutoField(primary_key=True)
    dominio = models.CharField(max_length=100)
    nivel_riesgo = models.CharField(max_length=100)
    titulo_recomendacion = models.CharField(max_length=200)
    descripcion_accion = models.TextField()
    referencia_normativa = models.TextField()

    def __str__(self):
        return self.titulo_recomendacion