from django.db import models

class Politica_prevencion(models.Model):
    id = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=100)
    contenido_texto = models.TextField()
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=20)
    estado = models.BooleanField(default=True)
    empresa = models.ForeignKey('Empresa', on_delete=models.CASCADE)
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)

    def __str__(self):
        return self.titulo