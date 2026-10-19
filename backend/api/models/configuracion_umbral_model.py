from django.db import models

class ConfiguracionUmbral(models.Model):
    id = models.AutoField(primary_key=True)
    metrica = models.CharField(max_length=100)
    valor_minimo_aceptable = models.FloatField()
    centro_trabajo = models.ForeignKey('Centro_trabajo', on_delete=models.CASCADE)
    area = models.ForeignKey('Area', on_delete=models.CASCADE)

    def __str__(self):
        return self.metrica