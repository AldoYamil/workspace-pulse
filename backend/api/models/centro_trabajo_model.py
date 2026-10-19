from django.db import models

class Centro_trabajo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    num_empleados = models.IntegerField()
    codigo_postal = models.CharField(max_length=10)
    empresa = models.ForeignKey('Empresa', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre