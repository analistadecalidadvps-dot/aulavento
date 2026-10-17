# VENTO Aula — Plataforma de capacitación

## Abrir y publicar
Extrae todo el ZIP y publica la carpeta completa conservando sus rutas. No subas únicamente index.html. Para probar en tu equipo con Node.js ejecuta `node server.cjs` y abre http://127.0.0.1:8766. El acceso desde teléfonos requiere una liga HTTPS publicada y conexión a internet; localhost solo funciona en el equipo donde está abierto.

## Temas
Ingresa con tu acceso habitual de facilitador. Añade temas desde el catálogo; puedes editar diapositivas, imágenes, notas privadas y preguntas de opción múltiple. Los temas nuevos se guardan en este navegador y usuario. Usa Respaldar catálogo para guardar una copia JSON. Usa Descargar plataforma actualizada y publica ese ZIP para que los temas estén disponibles para todos los dispositivos. Los materiales originales conservan su contenido.

## Sesión en Meet
Abre una sesión, abre la ventana Meet y comparte esa ventana en la videollamada. Envía la diapositiva o actividad con los controles del facilitador. Muestra el QR grande para que entren desde el teléfono. Las actividades de opción múltiple duran 20 segundos; la cotización interactiva dura 60 segundos. Al cerrar la votación se muestra el podio de las tres primeras personas que respondieron, con su acierto y tiempo según las marcas de recepción del servidor. Una respuesta incorrecta también puede estar entre las primeras; este podio mide rapidez, no puntuación. Al abrir la vista Meet aparece la diapositiva actual. Al avanzar, regresar o elegir un tema del menú, la vista Meet se actualiza automáticamente. QR, actividades y podio se muestran con sus controles; al navegar vuelve a verse la diapositiva.

## Consulta y cierre
Copia la liga de consulta desde el tema o el panel: contiene `?consulta=1&curso=...` y muestra solo el material, sin notas ni controles del facilitador. Comparte esa liga en tu correo de cierre; la plataforma no envía correos automáticamente. Al terminar la sesión aparece el documento general con sus respuestas, participantes y resultados. Puedes descargarlo o imprimirlo como PDF. La evidencia local requiere conservar el mismo navegador; exporta el documento para guardar una copia duradera.

## Cambios de esta versión
La imagen Tu ventaja para vender más está inmediatamente después de la portada de Retroalimentación. Se retiró la página ¿Qué nos dicen estos resultados? El contenido de las demás diapositivas y de Mantenimiento se conserva.

## Validación
Se verificaron creación de temas, consulta, actividades de 20 y 60 segundos, cotización con cinco campos, ranking y cierre con datos de prueba. Valida una sesión con sus cuentas reales antes de impartirla. Se mantiene la conexión y los contratos de acceso existentes; no se migró el backend.

## Versión con PILOT e importación HTML/ZIP
El catálogo ofrece portadas, categorías, búsqueda y vista previa. PILOT se integra como un HTML completo: 17 diapositivas, guiones y actividades grupales originales, evaluación de 20 preguntas teóricas y 10 de aplicación, con 20 minutos por participante. Se conservan los mínimos de acreditación: 16/20 y 8/10. Desde Aula, PILOT reutiliza el acceso del facilitador. Sus participantes entran desde su propio QR de evaluación. Sus funciones training_v2 del backend deben estar disponibles, como en el HTML original.

Cierra la evaluación de PILOT para mostrar el documento general con resultados, preguntas y respuestas por participante. El podio de PILOT ordena los primeros envíos completos con fecha recibida del servidor: no mide las respuestas individuales ni los aciertos. Si el backend no devuelve submitted_at/finalized_at, el reporte indica que no existe fecha verificable y conserva los resultados sin inventar un orden. Las actividades grupales no se convierten en calificaciones individuales. Reportes PILOT recupera los documentos de este navegador y usuario. No cambies de tema sin cerrar la evaluación activa.

Importar HTML / ZIP acepta un HTML autónomo o un ZIP de hasta 35 MB, hasta 250 archivos y 45 MB descomprimidos. El ZIP debe incluir index.html o un único HTML; se incorporan imágenes, estilos y scripts referenciados por rutas locales. Los contenidos se abren en un documento aislado y conservan sus propias interacciones. No reciben el token del facilitador de Aula. Los módulos JavaScript o cargas dinámicas locales requieren adaptación. El importador no conecta por sí solo las respuestas de cualquier HTML al registro general: cada sistema de actividades necesita un adaptador. En esta versión PILOT sí tiene ese adaptador. Los HTML importados siguen utilizando su sistema propio si lo incluyen.

Los nuevos temas e importaciones siguen guardándose localmente hasta descargar y publicar la plataforma actualizada. Una liga de consulta ofrece el material de PILOT sin su evaluación, resultados de facilitador ni controles de Meet. Para un HTML genérico, la consulta muestra el material estático, con las diapositivas disponibles en el documento y sin scripts, formularios o botones. El contenido que se genera solo mediante JavaScript requiere un adaptador de consulta.

Para actualizar GitHub Pages sube todo el contenido del ZIP descomprimido, incluidas las carpetas vendor, assets, materiales y temas, al mismo nivel que index.html. No subas únicamente index.html o el ZIP. La nueva versión se entrega lista para publicar; no modifica automáticamente el repositorio.

Validación adicional: navegador real con backend de prueba, puente de acceso a PILOT, reporte de 30 respuestas, orden de envío con fecha, histórico local, importación HTML y ZIP con scripts/estilos, consulta sin llamadas de sesión. Los contratos originales training_v2 se preservan; es necesario comprobar una evaluación con usuarios reales.

El logo original VENTO Motorcycles, incluido en el material de PILOT, se incorporó al acceso, catálogo, barra de navegación y acceso de participantes. Se conservó su proporción y color original.

## Identidad visual actualizada
El inicio y catálogo utilizan superficies claras, rojo como acento y un mensaje de bienvenida más cercano. El logo se sustituyó por el SVG proporcionado: https://cdn.worldvectorlogo.com/logos/vento-1.svg. Se incluye localmente para evitar depender de la carga externa. Se comprobó el acceso y la presentación en escritorio y móvil. Las capturas de referencia se encuentran en vista-previa.

El inicio está dirigido a facilitadores. El comparativo de desempeño muestra agencias y calificaciones sin montos ni unidades vendidas. La cotización permite tocar o arrastrar tarjetas, liberar campos para corregirlos, conservar el borrador en el mismo navegador y enviar los cinco datos al reporte. El reloj de un minuto se cuenta desde la apertura de la actividad; al terminar se bloquea el envío.

Portada y catálogo con una paleta suave de azul luminoso y celeste. Se conserva el logo oficial y el inicio dirigido a facilitadores.


## Inducción a Calidad integrada
El catálogo incluye «Inducción a Calidad · Cómo se evaluará tu atención»: 30 diapositivas y 4 preguntas de comprensión, con texto e imágenes del HTML entregado. Se integra con sesión, QR, preguntas de 20 segundos, respuestas, podio y documento final. No establece nota de aprobación ni genera incidencias administrativas; el reporte lo aclara. La guía docente permanece en el panel privado. La consulta permite repasar las cuatro preguntas sin enviar datos al servidor.
Abre esta tarjeta integrada para impartir la plática. Una importación previa del HTML puede seguir apareciendo en tu catálogo local; esa copia conserva su comportamiento anterior.
La vista Meet se sincroniza al abrirla y al avanzar, regresar o navegar con el menú. Los controles de QR, actividades y podio siguen disponibles. Al navegar vuelve a la diapositiva.
El HTML original se conserva en temas/induccion-calidad-original.html como respaldo. Los nuevos recursos son quality-content.js y quality.css. Se verificó contenido de las 30 diapositivas, acceso al tema, lanzamiento, podio, reporte, consulta y sincronización en Chromium con datos simulados.

## Retos, participación y cronómetro
Preguntas breves: 20 segundos; texto de más de 60 palabras: 30; más de 100: 45. Cotización: 60 segundos. El tiempo se calcula con enunciado y opciones, igual para facilitador y participante. PILOT mantiene su evaluación de 20 minutos. En Meet, las opciones del reto y las preguntas de Calidad permiten seleccionar la respuesta grupal y mostrar su explicación; no crean respuestas individuales. El reporte muestra participación única por actividad sobre las actividades recuperadas de la sesión cuando la consulta está completa; si faltan datos indica Datos incompletos. Sin respuesta registrada no equivale a falta de atención. La cotización se probó con datos simulados: campos obligatorios, correcciones, borrador, envío, bloqueo tras confirmar o vencer y reintento después de fallo de conexión.
