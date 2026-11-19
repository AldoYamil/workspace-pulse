# backend/api/management/commands/poblar_encuestas_nom035.py
from django.core.management.base import BaseCommand
from api.models import Guia_referencia, Pregunta


ENCUESTAS_NOM035 = [
    {
        "nombre": "1. Política de prevención",
        "descripcion": "Evaluación sobre el compromiso contra la violencia laboral, entorno favorable y mecanismos de denuncia.",
        "preguntas": [
            {
                "categoria": "Compromiso de evitar violencia laboral",
                "texto": "La dirección de mi centro de trabajo demuestra un compromiso claro y activo para prevenir la violencia laboral.",
            },
            {
                "categoria": "Compromiso de evitar violencia laboral",
                "texto": "En mi área de trabajo se aplican políticas de cero tolerancia ante el acoso, hostigamiento o malos tratos.",
            },
            {
                "categoria": "Acciones para promover un entorno favorable",
                "texto": "La empresa realiza acciones concretas para promover un entorno organizacional favorable y el sentido de pertenencia.",
            },
            {
                "categoria": "Acciones para promover un entorno favorable",
                "texto": "Se difunden de manera clara y accesible las normas y políticas internas de prevención psicosocial.",
            },
            {
                "categoria": "Mecanismos de denuncia",
                "texto": "Conozco los canales confidenciales y seguros disponibles para denunciar actos de violencia laboral.",
            },
            {
                "categoria": "Mecanismos de denuncia",
                "texto": "Confío en que las quejas o denuncias presentadas son atendidas con imparcialidad y sin represalias.",
            },
        ],
    },
    {
        "nombre": "2. Identificación de riesgos psicosociales",
        "descripcion": "Diagnóstico de factores de riesgo psicosocial, carga de trabajo y condiciones físicas del entorno.",
        "preguntas": [
            {
                "categoria": "Cuestionarios oficiales",
                "texto": "Mi trabajo me exige realizar tareas con un ritmo muy acelerado o bajo presión constante de tiempo.",
            },
            {
                "categoria": "Cuestionarios oficiales",
                "texto": "Con frecuencia debo trabajar horas adicionales o fuera de mi jornada habitual para cumplir con mis entregas.",
            },
            {
                "categoria": "Entrevistas",
                "texto": "Existen espacios de diálogo o entrevistas periódicas para expresar dificultades relacionadas con mis actividades laborales.",
            },
            {
                "categoria": "Análisis de condiciones de trabajo",
                "texto": "Las condiciones físicas de mi área (iluminación, ventilación, ruido, espacio y ergonomía) son adecuadas para trabajar.",
            },
            {
                "categoria": "Análisis de condiciones de trabajo",
                "texto": "Cuento con las herramientas, equipos y medidas de seguridad necesarias para desempeñar mis funciones sin riesgos.",
            },
        ],
    },
    {
        "nombre": "3. Evaluación del entorno organizacional",
        "descripcion": "Medición de comunicación interna, liderazgo, distribución de cargas y reconocimiento.",
        "preguntas": [
            {
                "categoria": "Comunicación interna",
                "texto": "La información importante sobre cambios, objetivos y procesos se comunica de manera oportuna y clara en mi equipo.",
            },
            {
                "categoria": "Liderazgo",
                "texto": "Mi jefe inmediato me orienta, escucha mis inquietudes y me brinda apoyo para resolver problemas de trabajo.",
            },
            {
                "categoria": "Distribución de tareas",
            "texto": "Las cargas de trabajo y responsabilidades están distribuidas de manera justa y equilibrada entre los integrantes del área.",
            },
            {
                "categoria": "Distribución de tareas",
                "texto": "Tengo claras cuáles son mis funciones, responsabilidades y el alcance de mi puesto.",
            },
            {
                "categoria": "Reconocimiento del desempeño",
                "texto": "Recibo retroalimentación constructiva y reconocimiento cuando realizo bien mi trabajo.",
            },
        ],
    },
    {
        "nombre": "4. Medidas de prevención y control",
        "descripcion": "Seguimiento a ajustes de carga, capacitación a líderes, protocolos y bienestar emocional.",
        "preguntas": [
            {
                "categoria": "Ajustes de carga de trabajo",
                "texto": "Cuando se detecta sobrecarga de trabajo en mi área, se realizan ajustes oportunos en tiempos o asignación de recursos.",
            },
            {
                "categoria": "Capacitación a líderes",
                "texto": "Los líderes y supervisores demuestran habilidades adecuadas para gestionar equipos y manejar conflictos.",
            },
            {
                "categoria": "Protocolos contra violencia laboral",
                "texto": "Existen protocolos claros y conocidos por todos para actuar de inmediato ante casos de violencia o acoso laboral.",
            },
            {
                "categoria": "Programas de bienestar emocional",
                "texto": "La organización ofrece programas, talleres o apoyo psicológico para cuidar la salud mental y el bienestar emocional.",
            },
        ],
    },
    {
        "nombre": "5. Atención a acontecimientos traumáticos severos",
        "descripcion": "Detección y canalización ante accidentes graves, asaltos, amenazas o actos de violencia extrema.",
        "preguntas": [
            {
                "categoria": "Accidentes graves",
                "texto": "He presenciado o sufrido algún accidente grave durante o con motivo de mi trabajo que puso en riesgo la integridad física.",
            },
            {
                "categoria": "Asaltos",
                "texto": "He estado expuesto a asaltos o robos con violencia en mi centro de trabajo o durante traslados laborales.",
            },
            {
                "categoria": "Amenazas",
                "texto": "He recibido amenazas directas o intimidaciones que afecten mi seguridad física o emocional en el entorno laboral.",
            },
            {
                "categoria": "Violencia extrema",
                "texto": "He presenciado o experimentado actos de violencia extrema (secuestro, agresiones físicas severas o situaciones de alto peligro) en el trabajo.",
            },
            {
                "categoria": "Canalización y atención",
                "texto": "Conozco el protocolo institucional para solicitar atención médica y psicológica inmediata tras un evento traumático.",
            },
        ],
    },
    {
        "nombre": "6. Registros y documentación",
        "descripcion": "Verificación de transparencia en resultados, medidas aplicadas, capacitaciones y reportes.",
        "preguntas": [
            {
                "categoria": "Resultados de evaluaciones",
                "texto": "Se nos informan los resultados generales de las evaluaciones de factores psicosociales realizadas en el centro de trabajo.",
            },
            {
                "categoria": "Medidas aplicadas",
                "texto": "Se observan acciones y mejoras documentadas derivadas de los resultados de evaluaciones anteriores.",
            },
            {
                "categoria": "Evidencia de capacitación",
                "texto": "He recibido capacitación y material informativo sobre prevención de riesgos psicosociales y promoción de entorno favorable.",
            },
            {
                "categoria": "Reportes de incidentes psicosociales",
                "texto": "Existe seguimiento formal y documentado cuando se reporta algún incidente relacionado con factores psicosociales.",
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Puebla las 6 encuestas NOM-035 y sus preguntas en la base de datos"

    def handle(self, *args, **options):
        guia_fields = {f.name for f in Guia_referencia._meta.fields}
        campo_nombre_guia = "nombre" if "nombre" in guia_fields else "titulo"

        total_guias = 0
        total_preguntas = 0

        for guia_idx, item in enumerate(ENCUESTAS_NOM035, start=1):
            codigo_guia = f"NOM035-EJE-{guia_idx:02d}"
            defaults_guia = {
                campo_nombre_guia: item["nombre"],
            }
            if "descripcion" in guia_fields:
                defaults_guia["descripcion"] = item["descripcion"]

            guia_obj, created = Guia_referencia.objects.update_or_create(
                codigo=codigo_guia,
                defaults=defaults_guia,
            )
            if created:
                total_guias += 1

            for idx, preg in enumerate(item["preguntas"], start=1):
                _, p_created = Pregunta.objects.update_or_create(
                    codigo_reactivo=f"NOM035-G{guia_idx}-R{idx:02d}",
                    defaults={
                        "guia_referencia": guia_obj,
                        "texto_pregunta": preg["texto"],
                        "categoria": item["nombre"],
                        "dominio": preg["categoria"],
                    },
                )
                if p_created:
                    total_preguntas += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Listo: {total_guias} encuestas (guías) y {total_preguntas} preguntas sincronizadas."
            )
        )