# Contexto Global del Proyecto: VANI LECTURA INMERSIVA

Este archivo contiene las reglas e instrucciones base para cualquier Agente o Subagente que trabaje en este repositorio. Su objetivo es mantener la coherencia del Core Narrativo V2 y evitar regresiones a ideas descartadas (ej. "app genérica de juegos educativos").

## 1. Visión del Proyecto
VANI no es una app de juegos didácticos, es una **Serie de Aventuras**. 
El objetivo psicopedagógico principal es la **conexión emocional a través de la lectura**. Las historias y el desarrollo de personajes son la herramienta más poderosa para lograr los objetivos de lecto-escritura temprana, reduciendo la ansiedad y la frustración.

## 2. Arquitectura "Core Narrativo V2" (Los 3 Pilares)
La aplicación cuenta con una navegación inferior (`MundoVani.jsx`) que separa claramente los espacios:
1. **📖 Historias (Espacio de Agencia):** Lectura libre. Sin telemetría invasiva, sin cronómetros. El usuario lee a su ritmo.
2. **⏱️ Retos WPM (Espacio de Demostración Clínico):** Pruebas de velocidad lectora (Palabras por Minuto). Se realizan en un entorno de "laboratorio" (fondo neutro, alto contraste), activadas de manera transparente y voluntaria por el usuario.
3. **🎮 Actividades (Centro de Entrenamiento):** Minijuegos satélite para reforzar la motricidad, comprensión y lógica, accesibles en cualquier momento como un "Hub de rejugabilidad".

*Al finalizar de leer un cuento, NUNCA se fuerza al usuario a un juego de inmediato. Se presenta un **Menú de Bifurcación** dándole la libertad de elegir qué hacer.*

## 3. Las Reglas de Oro Psicopedagógicas
Cualquier modificación de interfaz, redacción de cuentos o diseño de flujo debe obedecer las Reglas de Oro documentadas. 
Puedes leer las directrices completas revisando el archivo:
`docs/reglas_de_oro_narrativa.md`

## 4. Drip Content (Suscripción y Retención)
* El contenido está bloqueado progresivamente por "Días de Suscripción" (ver `JourneyContext.jsx` y `vaniData.js`).
* El avance cronológico del lenguaje evoluciona orgánicamente a medida que el niño sube de Temporada/Ecoesfera.
* El avance del usuario se debe considerar a largo plazo. La UI debe comunicar de forma elegante cuándo un personaje se desbloqueará (candados visuales 🔒).

## 5. Instrucción para Agentes
Si se te asigna una tarea para crear, modificar o diseñar un nuevo componente o flujo en VANI, debes:
1. Leer el archivo `docs/RESUMEN_SESION.md` para entender en qué quedó el último hito.
2. Leer las `docs/reglas_de_oro_narrativa.md` antes de generar historias o minijuegos para garantizar la coherencia clínica.
3. Respetar la separación entre "Espacio de Disfrute" (historias sin fricción) y "Espacio Clínico" (actividades puras de medición).

## 6. Pipeline Estricto de Producción (Obligatorio para Subagentes)
Todo agente (Psicopedagogo, Desarrollador, etc.) involucrado en la producción de una nueva Temporada (personaje) DEBE acatar estrictamente las siguientes reglas descubiertas durante la producción de Koda:
1. **Matemática Narrativa Estricta:** El guionista debe respetar *al pie de la letra* el largo de cada escena: Acto 1 (~40 palabras exactas), Acto 2 (~60 palabras exactas), Acto 3 (~80 palabras exactas). No se aceptan cuentos más cortos por "creatividad". Las métricas y audios dependen de esto.
2. **Uso de Variables de Entorno (.env):** Nunca correr scripts de inyección a la API (FAL, ElevenLabs, Firebase) asumiendo llaves harcodeadas. Deben cargarse dinámicamente usando `dotenv` y el archivo `.env`. Si no se hace, se generarán archivos vacíos (0 bytes) rompiendo la app.
3. **Pipeline Visual Unificado:** NUNCA crear scripts visuales separados (ej. `generate_leo_images.js`, `generate_koda_images.js`). Hacerlo provoca que se arrastren modelos LoRA incorrectos y se fusionen identidades visuales (ej. dibujar a Koda usando el LoRA de Leo). **SE DEBE** utilizar exclusivamente el script maestro universal `scripts/generate_season_images.js [personaje]` que ya tiene mapeado cada token con su `.safetensors` correspondiente de FAL.ai.
