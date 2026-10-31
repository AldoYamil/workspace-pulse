Workspace Pulse — Comandos del Backend (Django)

1. Entrar a la carpeta del backend

Abrir PowerShell y ejecutar:

cd "C:\Users\dell\Desktop\ProyectoCuatri\workspace-pulse\backend"

2. Activar el entorno virtual

.\venv\Scripts\Activate.ps1

Si aparece (venv) al inicio de la terminal, está activado.

3. Instalar las dependencias

Si ya existe requirements.txt:

python -m pip install -r requirements.txt

Si no existe, instalar los paquetes necesarios para este backend:

python -m pip install django djangorestframework django-cors-headers python-decouple PyJWT cryptography psycopg2-binary

Después, si se instalaron dependencias nuevas, actualizar el archivo:

python -m pip freeze > requirements.txt

4. Configurar las variables de entorno

En la carpeta backend, junto a manage.py, debe existir un archivo .env con las variables correspondientes al proyecto:

SUPABASE_JWKS_URL=https://TU_PROJECT_REF.supabase.co/auth/v1/.well-known/jwks.json

Reemplazar TU_PROJECT_REF por el identificador real del proyecto de Supabase.

No subir secretos, contraseñas ni archivos .env al repositorio.

5. Comprobar la configuración de Django

python manage.py check

Comprobar que Django reconoce la URL de las claves públicas de Supabase:

python manage.py shell -c "from django.conf import settings; print('JWKS configurado:', bool(settings.SUPABASE_JWKS_URL))"

El resultado esperado es:

JWKS configurado: True

6. Aplicar las migraciones de la base de datos

python manage.py makemigrations
python manage.py migrate

makemigrations genera migraciones cuando hay cambios en los modelos. migrate aplica las migraciones pendientes.

7. Ejecutar el servidor del backend

python manage.py runserver

El backend debe quedar disponible en:

http://127.0.0.1:8000/

Mantener esta terminal abierta mientras se trabaja con el frontend.