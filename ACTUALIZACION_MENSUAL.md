# Integración mensual del Follow Up con Aula VENTO 

La integración conserva septiembre de 2026 mientras el reporte fuente no incluya un nuevo bloque aprobado. El formato Excel fue proporcionado por Ale y se incorporó sin cambios.

## Instrucción fija para el chat que genera el reporte

Actualiza el reporte HTML con el Excel del cierre que te adjunto. Conserva su diseño. Incluye exactamente un bloque `<script type="application/json" id="vento-followup-data">` con los datos que también alimentarán Aula VENTO. El aula NO ejecutará código del reporte: solo leerá ese JSON.

Usa schemaVersion:1, published:true únicamente cuando el cierre esté revisado y aprobado, period:"AAAA-MM", publishedAt en fecha ISO 8601 con zona horaria y la fecha real de publicación, base con el denominador de las desviaciones, top5 con exactamente cinco rubros ordenados por número de incumplimientos de mayor a menor, destacadas y riesgo con diez agencias distintas cada uno. No inventes datos ni completes con los del mes anterior. Si faltan datos, usa published:false y explica qué falta. No uses null, ceros o cifras previas para cubrir información faltante.

Cada rubro debe incluir nombre, detalle, inc y pct, donde pct es el porcentaje entero redondeado de inc/base*100. Cada agencia debe incluir agencia (código de cinco dígitos y nombre) y cal (calificación real de 0 a 100). No incluyas montos de venta, unidades ni nombres de vendedores en el bloque de integración. Las cifras del JSON y las tablas visibles deben coincidir exactamente. Si los rubros tienen denominadores diferentes, no fuerces una base común: conserva published:false hasta adaptar el contrato.

Usa estos nombres de campos y esta estructura (el ejemplo es el cierre ya aprobado de septiembre; reemplaza TODAS las cifras y fechas con las del nuevo Excel). No conserves el ejemplo si no corresponde al nuevo periodo. Escapa los caracteres `<` dentro de textos JSON como `\u003c` para no cerrar el bloque accidentalmente.

```html
<script type="application/json" id="vento-followup-data">
{
  "schemaVersion": 1,
  "published": true,
  "period": "2026-09",
  "publishedAt": "2026-10-17T10:46:00-06:00",
  "base": 143,
  "top5": [
    {
      "num": 1,
      "nombre": "Sondeo / Villano (3 niveles de problema)",
      "detalle": "El sondeo no profundiza en los problemas externo, interno y filosófico del cliente.",
      "pct": 76,
      "inc": 109
    },
    {
      "num": 2,
      "nombre": "Plan de éxito (Moto ideal, ajuste a tu bolsillo y seguridad)",
      "detalle": "No se presentan de forma proactiva y completa los tres componentes: moto ideal, ajuste al bolsillo y seguridad.",
      "pct": 76,
      "inc": 108
    },
    {
      "num": 3,
      "nombre": "Script Maestro",
      "detalle": "La recomendación del producto no se vincula claramente con el problema detectado y el beneficio esperado.",
      "pct": 71,
      "inc": 101
    },
    {
      "num": 4,
      "nombre": "Garantía y Primer Servicio",
      "detalle": "Se omite o se comunica de forma incompleta la garantía de 3 años / 33 mil km y el primer servicio.",
      "pct": 57,
      "inc": 81
    },
    {
      "num": 5,
      "nombre": "Cierre Transicional (Cotización o preaprobación formal)",
      "detalle": "No se entrega una cotización o preaprobación formal, física o digital, para dar continuidad a la oportunidad de venta.",
      "pct": 48,
      "inc": 69
    }
  ],
  "destacadas": [
    {
      "agencia": "16036 Orizaba Ver",
      "cal": 100
    },
    {
      "agencia": "16178 Comitan Chp",
      "cal": 100
    },
    {
      "agencia": "16260 Ebano Slp",
      "cal": 100
    },
    {
      "agencia": "16267 Lazaro Cardenas Mic",
      "cal": 100
    },
    {
      "agencia": "16026 Tecamac Mex",
      "cal": 97
    },
    {
      "agencia": "16253 Puruandiro Mic",
      "cal": 97
    },
    {
      "agencia": "16192 Motozintla Chp",
      "cal": 96
    },
    {
      "agencia": "16245 Acatlan De Osorio Pue",
      "cal": 96
    },
    {
      "agencia": "16125 Penjamo Gto",
      "cal": 95
    },
    {
      "agencia": "16141 Tepexpan Mex",
      "cal": 93
    }
  ],
  "riesgo": [
    {
      "agencia": "16148 Silao Gto",
      "cal": 40
    },
    {
      "agencia": "16298 Agua Dulce Ver",
      "cal": 40
    },
    {
      "agencia": "16306 Kanasin Yuc",
      "cal": 40
    },
    {
      "agencia": "16043 Coatzacoalcos Ver",
      "cal": 38
    },
    {
      "agencia": "16301 Cardel Ver",
      "cal": 38
    },
    {
      "agencia": "16104 Acapulco Cuauhtemoc Gro",
      "cal": 36
    },
    {
      "agencia": "16041 San Andres Tuxtla Ver",
      "cal": 34
    },
    {
      "agencia": "16263 Aeropuerto Tampico Tam",
      "cal": 34
    },
    {
      "agencia": "16232 Chilpancingo Sur Gro",
      "cal": 33
    },
    {
      "agencia": "16095 Jojutla Mor",
      "cal": 32
    }
  ]
}
</script>
```

Al terminar, entrega el HTML completo listo para publicar en la misma liga de siempre. No generes un sitio nuevo ni cambies la ruta del reporte.

## Comportamiento del aula preparada

Lee una vez al abrir el aula; no consulta por intervalos. Acepta únicamente cierres aprobados con estructura y porcentajes válidos; no acepta periodos anteriores a septiembre de 2026 ni meses futuros. Conserva septiembre si la fuente no incluye el bloque, falla la conexión o los datos no son válidos. Usa el último cierre validado de este navegador cuando esté disponible. No sustituye datos mientras hay una sesión abierta o una ventana Meet abierta. Si una sesión comienza durante la descarga, conserva el nuevo cierre para la siguiente apertura.

## Descarga del formato oficial

El archivo proporcionado por Ale el 17/10/2026, FORMATO COTIZACIÓN 2(1).xlsx, se incorporó byte por byte como materiales/formato-cotizacion-oficial.xlsx. La configuración habilita «Materiales descargables» en la vista de consulta y «Descargar formato oficial de cotización (Excel)» en su diálogo. La ruta está incluida en el paquete exportable. No se modificaron celdas, fórmulas ni diseño del original. La sección no aparece en la vista del instructor ni en el acceso de participantes. La integración se publica con autorización de Ale. El reporte fuente debe incluir el bloque aprobado para habilitar futuras actualizaciones mensuales.
