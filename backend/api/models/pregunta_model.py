from django.db import models

class Pregunta(models.Model):
    id = models.AutoField(primary_key=True)
    texto_pregunta = models.TextField()
    codigo_reactivo = models.CharField(max_length=100, unique=True)
    dominio = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100)
    guia_referencia = models.ForeignKey('Guia_referencia', on_delete=models.CASCADE)

    def __str__(self):
        return self.texto_pregunta