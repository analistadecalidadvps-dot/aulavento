
// ============================================================
// EDITABLE DATA
// ============================================================

var FOLLOWUP_DATA = { evaluaciones:0, colaboradores:0, agencias:0, cumplimientoGeneral:0, mejoraVsAnterior:0 };
var THRESHOLDS = { fortaleza:90, enDesarrollo:80 };
var FU_TOP5 = [
  { num:1, nombre:"SONDEO / VILLANO", detalle:"Identificar los 3 niveles de problema", pct:80, inc:115 },
  { num:2, nombre:"SCRIPT MAESTRO", detalle:"Modelo alineado con beneficio de éxito", pct:71, inc:102 },
  { num:3, nombre:"PLAN DE ÉXITO", detalle:"Moto ideal + ajuste a tu bolsillo + seguridad", pct:65, inc:93 },
  { num:4, nombre:"GARANTÍA", detalle:"Comunicar 3 años / 33,000 km e indicaciones del primer servicio", pct:55, inc:79 },
  { num:5, nombre:"VENTEC / OFRECER CASCO", detalle:"", pct:53, inc:77 }
];
var FU_DESTACADAS = [
  { agencia:"16094 Plaza Huehuetoca", cal:100, motos:122, monto:"$3,483,170.74" },
  { agencia:"16199 Mapastepec", cal:100, motos:32, monto:"$773,980.15" },
  { agencia:"16040 Nezahualcoyotl Oriente", cal:99, motos:64, monto:"$1,753,481.16" },
  { agencia:"16122 Boulevard De Los Aztecas", cal:99, motos:28, monto:"$726,282.54" },
  { agencia:"16076 Rio De Los Remedios", cal:97, motos:60, monto:"$1,660,847.84" },
  { agencia:"16100 Alfredo Del Mazo", cal:96, motos:80, monto:"$2,270,569.05" },
  { agencia:"16286 Teloloapan", cal:96, motos:28, monto:"$745,234.50" },
  { agencia:"16209 Progreso De Obregon", cal:96, motos:27, monto:"$717,485.95" },
  { agencia:"16150 Valle De Santiago", cal:95, motos:63, monto:"$1,707,193.29" },
  { agencia:"16073 San Mateo Atenco", cal:94, motos:50, monto:"$1,533,778.08" }
];
var FU_RIESGO = [{"agencia":"16145 Plaza Castillotla","cal":25,"motos":57,"monto":"$1,491,683.65"},{"agencia":"16186 Puebla Tecamachalco","cal":32,"motos":51,"monto":"$1,330,042.23"},{"agencia":"16249 Tlapacoyan","cal":32,"motos":23,"monto":"$704,290.51"},{"agencia":"16111 Xonacatlan","cal":34,"motos":58,"monto":"$1,719,518.96"},{"agencia":"16279 Playa Del Carmen","cal":35,"motos":70,"monto":"$1,877,799.63"},{"agencia":"16259 Altamira","cal":36,"motos":42,"monto":"$1,238,325.90"},{"agencia":"16191 Uruapan","cal":38,"motos":45,"monto":"$1,284,858.11"},{"agencia":"16069 San Juan de los Lagos","cal":38,"motos":39,"monto":"$1,117,795.94"},{"agencia":"16188 Paseo Poniente","cal":38,"motos":14,"monto":"$412,487.94"},{"agencia":"16109 Abasolo","cal":42,"motos":49,"monto":"$1,181,922.16"}];
var FU_TOT_DESTACADAS = { monto:"$15,372,023.30", uds:554 };
var FU_TOT_RIESGO = { monto:"$12,358,725.03", uds:448 };
var FOLLOWUP_RESULTS = [
  { nombre:"Plan de Éxito", porcentaje:0, evaluaciones:0 },
  { nombre:"Sondeo / Villano", porcentaje:0, evaluaciones:0 },
  { nombre:"Script Maestro", porcentaje:0, evaluaciones:0 },
  { nombre:"VENTEC", porcentaje:0, evaluaciones:0 },
  { nombre:"Garantía", porcentaje:0, evaluaciones:0 },
  { nombre:"Póliza contra robo con violencia", porcentaje:0, evaluaciones:0 },
  { nombre:"Seguros ANA", porcentaje:0, evaluaciones:0 },
  { nombre:"Cierre transicional", porcentaje:0, evaluaciones:0 },
  { nombre:"Registro en bitácora y PILOT", porcentaje:0, evaluaciones:0 }
];
var COMPARISON_DATA = FOLLOWUP_RESULTS.map(function(r){ return{rubro:r.nombre,inicial:0,followUp:0} });
var FINDINGS = {mejor:"Pendiente.",consolidar:"Pendiente.",prioridad:"Pendiente."};

var CONTENT = {
  planExito:{
    objetivo:"Ordenar la decisión de compra del cliente desde el inicio y reducir su incertidumbre, presentando la ruta de acompañamiento de VENTO.",
    header:"PUEDES DECIRLO CON TUS PROPIAS PALABRAS.",
    headerSub:"Lo importante es comunicar los tres pilares.",
    pilares:[
      {nombre:"MODELO IDEAL",img:"modelo-ideal.png",frases:["Vamos a encontrar la motocicleta ideal para ti.","Te ayudaré a encontrar el modelo que mejor se adapte a lo que necesitas.","Vamos a revisar cuál es la mejor opción para ti."]},
      {nombre:"SE AJUSTA A TU BOLSILLO",img:"ajuste-bolsillo.png",frases:["Vamos a buscar una opción que se ajuste a tu bolsillo.","Revisaremos una alternativa que funcione para tu presupuesto.","Vamos a encontrar una forma de compra que te resulte viable."]},
      {nombre:"SAL A RODAR PROTEGIDO",img:"rodar-protegido.png",frases:["También vamos a ayudarte a salir a rodar protegido.","Además de elegir tu motocicleta, veremos cómo puedes salir protegido.","Queremos que encuentres tu moto y también puedas salir a rodar con mayor tranquilidad."]}
    ],
    ejemplo:"Bienvenido a VENTO. Vamos a ayudarte a encontrar la motocicleta ideal para ti, buscar una opción que se ajuste a tu bolsillo y ayudarte a salir a rodar protegido.",
    callout:"NO TIENES QUE MEMORIZAR UNA FRASE EXACTA.",
    calloutSub:"Puedes decirlo con tus propias palabras; solo asegúrate de comunicar los 3 pilares.",
    reto:{q:"Un cliente entra a la agencia y te dice: «Quiero ver motos». Después de darle la bienvenida, ¿qué deberías comunicarle antes de comenzar el sondeo?",opts:["Preguntarle inmediatamente qué uso le dará a la motocicleta y cuánto tiene pensado gastar.","Decirle que primero puede recorrer la agencia y después preguntarle qué modelo le gustó.","Explicarle que lo ayudarás a encontrar su modelo ideal, buscarán una opción que se ajuste a su bolsillo y podrá salir a rodar protegido.","Comenzar explicándole las características y promociones del modelo más vendido."],correct:2,exp:"Antes de sondear, presentar modelos o hablar de características, debes comunicar el Plan de Éxito: modelo ideal + se ajusta a tu bolsillo + salir a rodar protegido.",fbOk:"¡Correcto! Antes de comenzar el sondeo, comunica el Plan de Éxito. El cliente debe saber desde el inicio que lo ayudarás a encontrar su modelo ideal, buscar una opción que se ajuste a su bolsillo y salir a rodar protegido.",fbNo:"Todavía no. Antes de sondear, presentar modelos o hablar de características, debes comunicar el Plan de Éxito: modelo ideal + se ajusta a tu bolsillo + salir a rodar protegido.",seq:["BIENVENIDA","PLAN DE ÉXITO","SONDEO"],seqBold:1}
  },
  sondeo:{
    objetivo:"Identificar los 3 niveles de problemas que motivan al cliente a buscar una motocicleta.",
    niveles:[
      {nombre:"PROBLEMA EXTERNO",def:"Lo que está ocurriendo.",ejemplos:["Tráfico","Largos tiempos de traslado","Gasto elevado de combustible","Dependencia del transporte público","Falta de movilidad","Necesidad de trabajar o repartir"],preguntas:["¿Cómo te trasladas actualmente?","¿Qué es lo más complicado de tu trayecto diario?","¿Cuánto tiempo inviertes en trasladarte?","¿Qué situación quieres resolver con una motocicleta?"]},
      {nombre:"PROBLEMA INTERNO",def:"Cómo hace sentir al cliente.",ejemplos:["Frustración","Estrés","Cansancio","Inseguridad","Preocupación","Incomodidad","Miedo"],preguntas:["¿Cómo te hace sentir esa situación?","¿Qué es lo que más te molesta?","¿Qué es lo que más te preocupa de seguir así?"]},
      {nombre:"PROBLEMA FILOSÓFICO",def:"Lo que realmente quiere cambiar o conseguir.",ejemplos:["Mayor independencia","Pasar más tiempo con su familia","Mayor tranquilidad","Ahorrar","Mejorar su calidad de vida","Aumentar sus ingresos","Sentirse más seguro","Disponer de más tiempo"],preguntas:["¿Qué te gustaría mejorar con esta compra?","¿Qué cambiaría en tu día si tuvieras una motocicleta?","¿Qué sería diferente para ti?","¿Qué es importante para ti lograr?"]}
    ],
    logica:["PROBLEMA EXTERNO","¿QUÉ LE GENERA?","PROBLEMA INTERNO","¿QUÉ QUIERE CAMBIAR?","PROBLEMA FILOSÓFICO"],
    ejemploProblema:["Me hago casi dos horas para llegar al trabajo.","Ya estoy cansado de perder tanto tiempo y llegar agotado.","Quiero recuperar tiempo para estar con mi familia, no solo llegar rápido."],
    convo:[
      {who:"asesor",txt:"¿Cómo te trasladas actualmente?"},
      {who:"cliente",txt:"Me hago casi dos horas para llegar al trabajo."},
      {who:"asesor",txt:"¿Y cómo te hace sentir pasar tanto tiempo en el trayecto?"},
      {who:"cliente",txt:"Ya estoy cansado de perder tanto tiempo y llegar agotado."},
      {who:"asesor",txt:"¿Qué cambiaría en tu día si tuvieras una motocicleta?"},
      {who:"cliente",txt:"Llegaría no tan cansado y podría pasar más tiempo con mi familia."}
    ],
    impacto:["Entender realmente al cliente","Dejar de vender solo especificaciones","Recomendar un modelo con sentido","Construir un Script Maestro","Generar conexión","Identificar argumentos relevantes para cerrar la venta"],
    impactoFrase:"SI SOLO PREGUNTAS «¿QUÉ MOTO BUSCA?», VENDES MODELOS. SI SONDEAS, CONECTAS NECESIDADES.",
    reto:{q:"El cliente comenta que tarda hora y media en llegar al trabajo, llega frustrado y quiere pasar más tiempo con sus hijos. ¿Cuál de las siguientes opciones identifica correctamente los tres niveles de su Villano?",opts:["Externo: llega frustrado / Interno: tarda hora y media / Problema filosófico: pasar tiempo con sus hijos","Externo: tarda hora y media / Interno: llega frustrado / Problema filosófico: pasar tiempo con sus hijos","Externo: pasar tiempo con sus hijos / Interno: llega frustrado / Problema filosófico: tarda hora y media","Externo: tarda hora y media / Interno: quiere una moto / Problema filosófico: llegar antes"],correct:1,exp:"El problema externo es la situación concreta (el trayecto), el interno es cómo lo hace sentir (frustración) y el problema filosófico es lo que quiere lograr (tiempo con sus hijos)."}
  },
  scriptMaestro:{
    objetivo:"Convertir una característica técnica en una solución relevante para ese cliente específico.",
    formula:["PROBLEMA IDENTIFICADO","CARACTERÍSTICA","BENEFICIO / TRANSFORMACIÓN"],
    notaRelacion:"No se trata de concatenar tres conceptos. Debe existir una relación lógica entre lo que el cliente vive y lo que el producto ofrece.",
    pasos:[
      {titulo:"RETOMAR EL PROBLEMA",desc:"Usar algo que el cliente realmente expresó durante el sondeo. Ese es el punto de partida.",ejemplo:"Cliente: «Gasto demasiado en gasolina cada semana.»"},
      {titulo:"SELECCIONAR LA CARACTERÍSTICA",desc:"Elegir una característica del modelo que pueda relacionarse con ese problema. No inventar especificaciones.",ejemplo:"«Este modelo ofrece un buen rendimiento de combustible.»"},
      {titulo:"EXPLICAR EL BENEFICIO",desc:"Decir qué significa esa característica para el cliente y conectarla con lo que le importa.",ejemplo:"«Esto puede ayudarte a reducir el gasto que tienes actualmente en combustible.»"}
    ],
problemas:[
      {p:"Invierte demasiado tiempo en sus traslados",ctx:"inviertes demasiado tiempo en tus traslados",rel:[1,2,5]},
      {p:"Gasta demasiado en combustible",ctx:"el gasto de combustible está afectando tu presupuesto",rel:[0]},
      {p:"Termina agotado por trayectos largos o caminos irregulares",ctx:"los trayectos largos o los caminos irregulares te dejan agotado",rel:[3,10,5]},
      {p:"Depende del transporte público",ctx:"dependes completamente del transporte público",rel:[1,2]},
      {p:"Necesita transportar objetos o herramientas para trabajar",ctx:"necesitas transportar herramientas u objetos durante tu jornada",rel:[9]},
      {p:"Usa constantemente el teléfono para ubicarse y moverse",ctx:"utilizas constantemente tu teléfono durante tus traslados",rel:[8]},
      {p:"Le preocupa la respuesta de frenado en la ciudad",ctx:"te preocupa tener una frenada segura en recorridos urbanos",rel:[4,11]},
      {p:"Le cuesta consultar la información de la moto al conducir",ctx:"te gustaría tener la información principal de la moto siempre visible",rel:[6]},
      {p:"Le preocupa la seguridad y el robo",ctx:"te preocupa la seguridad y el riesgo de robo",rel:[7,11]}
    ],
    caracteristicas:[
      {label:"Motor 4 tiempos / rendimiento",description:"Motor de 4 tiempos pensado para ofrecer un buen rendimiento de combustible.",scriptText:"un motor de 4 tiempos pensado para ofrecer un buen rendimiento de combustible",compatibleProblems:[1],compatibleBenefits:[0]},
      {label:"Tanque de combustible amplio",description:"Tanque con capacidad suficiente para reducir la frecuencia de carga en recorridos cotidianos.",scriptText:"un tanque de combustible con capacidad suficiente para reducir la frecuencia de carga en recorridos cotidianos",compatibleProblems:[0,3],compatibleBenefits:[7]},
      {label:"Transmisión de 5 velocidades",description:"Transmisión manual de 5 velocidades que aprovecha mejor la respuesta del motor.",scriptText:"una transmisión manual de 5 velocidades que permite aprovechar mejor la respuesta del motor",compatibleProblems:[0,3],compatibleBenefits:[8]},
      {label:"Suspensión trasera monoshock",description:"Sistema de suspensión trasera diseñado para absorber irregularidades del camino.",scriptText:"una suspensión trasera tipo monoshock que ayuda a mantener una conducción más estable",compatibleProblems:[2],compatibleBenefits:[1]},
      {label:"Freno delantero de disco hidráulico",description:"Freno de disco con accionamiento hidráulico para una respuesta de frenado controlada.",scriptText:"un freno delantero de disco hidráulico que proporciona una respuesta de frenado más controlada",compatibleProblems:[6],compatibleBenefits:[4]},
      {label:"Rines de 17 pulgadas",description:"Rines de 17 pulgadas que favorecen una conducción estable en trayectos urbanos.",scriptText:"rines de 17 pulgadas que favorecen una conducción estable en trayectos urbanos",compatibleProblems:[0,2],compatibleBenefits:[8]},
      {label:"Tablero digital",description:"Tablero digital que muestra la información principal de conducción de forma clara.",scriptText:"un tablero digital que permite consultar la información principal de conducción de forma clara",compatibleProblems:[7],compatibleBenefits:[5]},
      {label:"Alarma y encendido remoto",description:"Funciones de alarma y encendido remoto que facilitan el uso cotidiano de la motocicleta.",scriptText:"funciones de alarma y encendido remoto que facilitan el uso cotidiano de la motocicleta",compatibleProblems:[8],compatibleBenefits:[6]},
      {label:"Tecnología VENTEC",description:"Tecnología VENTEC que integra funciones de conectividad durante la conducción.",scriptText:"tecnología VENTEC que integra funciones de conectividad durante la conducción",compatibleProblems:[5],compatibleBenefits:[3]},
      {label:"Parrilla de carga",description:"Parrilla trasera que permite transportar objetos con mayor practicidad.",scriptText:"una parrilla de carga que permite transportar objetos con mayor practicidad",compatibleProblems:[4],compatibleBenefits:[2]},
      {label:"Asiento amplio",description:"Asiento diseñado para ofrecer una posición cómoda durante los recorridos.",scriptText:"un asiento diseñado para ofrecer una posición cómoda durante los recorridos",compatibleProblems:[2],compatibleBenefits:[1,8]},
      {label:"Iluminación LED",description:"Iluminación LED que mejora la visibilidad y aporta una imagen más moderna.",scriptText:"iluminación LED que mejora la visibilidad y aporta una imagen más moderna",compatibleProblems:[6,8],compatibleBenefits:[9,6]}
    ],
    beneficios:[
      {b:"reducir sus gastos de traslado",f:"lo que puede ayudarte a reducir parte de tus gastos cotidianos de traslado"},
      {b:"mayor comodidad en los recorridos",f:"lo que puede hacer tus recorridos cotidianos más cómodos"},
      {b:"transportar con mayor practicidad",f:"lo que te permite llevar tus objetos con mayor practicidad y adaptar la moto a tus actividades de trabajo"},
      {b:"mayor practicidad y conectividad",f:"lo que puede hacer más práctica tu experiencia de conducción"},
      {b:"una respuesta de frenado más controlada",f:"lo que te da una respuesta de frenado más controlada en la ciudad"},
      {b:"información clara al conducir",f:"lo que te permite tener la información principal siempre clara al conducir"},
      {b:"más sensación de seguridad",f:"lo que puede ayudarte a sentirte más protegido"},
      {b:"optimizar el tiempo de traslado",f:"lo que puede ayudarte a optimizar el tiempo de tus traslados"},
      {b:"más estabilidad al manejar",f:"lo que te da más estabilidad y confianza al manejar"},
      {b:"mejor visibilidad al conducir",f:"lo que te da mejor visibilidad, incluso de noche"}
    ],
    combinacionInvalida:"Esa combinación no es coherente. El Script Maestro necesita que la característica responda directamente a la situación del cliente y que el beneficio se desprenda de esa característica. Elige opciones que tengan una relación lógica.",
    convo:[
      {who:"cliente",txt:"Lo que más me pesa es lo que gasto en gasolina todas las semanas."},
      {who:"asesor",txt:"Entiendo. Tomando en cuenta que actualmente el gasto de combustible está afectando tu presupuesto, este modelo cuenta con un buen rendimiento de combustible, lo que puede ayudarte a reducir ese gasto y tener una opción más eficiente para tus traslados diarios."}
    ],
    impacto:["Personaliza la presentación","Demuestra que el asesor escuchó","Convierte especificaciones en beneficios","Evita una presentación genérica","Incrementa el valor percibido del producto"],
    impactoFrase:"LA CARACTERÍSTICA EXPLICA QUÉ TIENE LA MOTO. EL SCRIPT MAESTRO EXPLICA POR QUÉ LE IMPORTA AL CLIENTE.",
    reto:{q:"El cliente te comenta que gasta demasiado combustible. ¿Cuál de los siguientes Scripts Maestros conecta correctamente problema, característica y beneficio?",opts:["«Esta moto es rápida y se ve bien, seguro te va a gustar.»","«Como me comentas que el gasto de combustible afecta tu presupuesto, este modelo tiene un motor eficiente con buen rendimiento, lo que puede ayudarte a reducir tus gastos diarios.»","«Gastas mucho, la moto es buena, te ahorras dinero.»","«Tiene tecnología de conectividad que suena muy innovadora.»"],correct:1,exp:"El Script Maestro correcto retoma el problema expresado, lo conecta con una característica relacionada (rendimiento) y termina con el beneficio concreto para el cliente."}
  },
  ventec:{
    objetivo:"El asesor debe asociar VENTEC con dos acciones que SIEMPRE debe realizar: explicar qué aporta la tecnología y aprovechar la conversación para la venta cruzada de casco.",
    card1:{
      t:"EXPLICA VENTEC",
      f:"No basta con decir que la moto tiene VENTEC.",
      s:"El cliente debe entender qué hace la tecnología y qué beneficio representa para él.",
      def:"VENTEC permite integrar funciones compatibles del teléfono con la experiencia de conducción, facilitando el acceso a determinadas funciones de conectividad.",
      no:"«Esta moto trae VENTEC.»",
      si:"«Este modelo incorpora tecnología VENTEC, que te permite aprovechar funciones de conectividad de una manera más práctica durante la conducción.»",
      nota:"No inventar funciones ni compatibilidades específicas."
    },
    card2:{
      t:"VENTA CRUZADA DE CASCO",
      f:"AL EXPLICAR VENTEC, SIEMPRE OFRECE UN CASCO.",
      s:"VENTEC abre una oportunidad natural para complementar la venta con un casco y aumentar el valor del ticket.",
      tag:"NO TERMINES DE EXPLICAR VENTEC SIN OFRECER EL CASCO."
    },
    formula:{l1:"VENTEC",l2:"CASCO",r:"OPORTUNIDAD DE VENTA CRUZADA"},
    chips:["DIFERENCIACIÓN","VALOR","VENTA CRUZADA"],
    cierre:"EXPLICA VENTEC Y OFRECE EL CASCO.",
    cierreSub:"Más valor para el cliente y una oportunidad adicional de venta.",
    reto:{q:"Estás mostrando una motocicleta con VENTEC. ¿Cuál es la mejor forma de aprovechar esta característica durante la venta?",opts:["Solo mencionar que incluye VENTEC y continuar con el siguiente tema.","Explicar brevemente qué aporta VENTEC al cliente y aprovechar la conversación para ofrecer un casco.","Explicar todas las funciones técnicas durante varios minutos.","Esperar a que el cliente pregunte por VENTEC o por un casco."],correct:1,exp:"No basta con mencionar VENTEC. El asesor debe explicar su valor y utilizar la conversación para ofrecer un casco.",fbOk:"Correcto. VENTEC debe explicarse como un diferenciador y también debe aprovecharse para realizar venta cruzada de casco.",fbNo:"No basta con mencionar VENTEC. El asesor debe explicar su valor y utilizar la conversación para ofrecer un casco."}
  },
  garantia:{
    objetivo:"Comunicar la garantía (3 años o 33,000 km) y el primer servicio (30 días o 300 km) como argumento de confianza: si no se explican, el respaldo no se percibe.",
    c1:{t:"GARANTÍA",v1:"3 AÑOS",v2:"33,000 KM",txt:"Respaldo para generar confianza en la compra."},
    c2:{t:"PRIMER SERVICIO",v1:"30 DÍAS",v2:"300 KM",txt:"Información que el cliente debe conocer desde su compra."},
    callout:"LA GARANTÍA GENERA CONFIANZA.",
    calloutSub:"No basta con que exista. El cliente debe conocer el respaldo que recibe con su compra.",
    eqR:"CONFIANZA Y RESPALDO",
    reto:{q:"¿Qué información debes comunicar correctamente para reforzar la confianza del cliente en su compra?",opts:["Solo mencionar que la motocicleta tiene garantía.","Garantía de 3 años o 33,000 km y primer servicio a los 30 días o 300 km.","Que el primer servicio puede realizarse cuando el cliente quiera.","Solo explicar la garantía si el cliente pregunta."],correct:1,exp:"Comunicar la garantía junto con el primer servicio transmite respaldo real en la compra.",fbOk:"Correcto. Comunicar la garantía y el primer servicio ayuda a transmitir respaldo y generar confianza.",fbNo:"Recuerda comunicar ambos datos: garantía de 3 años o 33,000 km y primer servicio a los 30 días o 300 km."}
  },
  poliza:{
    objetivo:"Grabar el concepto exacto: póliza contra ROBO CON VIOLENCIA, con vigencia de 3 meses en compra de contado y 1 año con VENTOCREDIT, mencionada como elemento de protección.",
    heroSub:"Un beneficio de protección que debes comunicar durante la venta.",
    badge:"APLICA A ROBO CON VIOLENCIA.",
    c1:{t:"ROBO CON VIOLENCIA",txt:"Es importante especificar que la póliza corresponde a robo CON VIOLENCIA."},
    c2:{t:"DE CONTADO",num:"3 MESES"},
    c3:{t:"VENTOCREDIT",num:"1 AÑO"},
    end1:"NO DIGAS SOLO «PÓLIZA CONTRA ROBO».",
    end2:"ES PÓLIZA CONTRA ROBO CON VIOLENCIA.",
    endFrase:"MENCIÓNALA: ES UN ELEMENTO DE PROTECCIÓN QUE AGREGA VALOR A LA COMPRA.",
    reto:{q:"¿Cuál es la forma correcta de comunicar este beneficio?",opts:["«VENTO incluye protección contra cualquier tipo de robo.»","«Tu motocicleta tiene una póliza contra robo.»","«Tu compra cuenta con una póliza contra ROBO CON VIOLENCIA: 3 meses en compra de contado y 1 año con VENTOCREDIT.»","«Solo aplica protección cuando compras con VENTOCREDIT.»"],correct:2,exp:"Se debe especificar ROBO CON VIOLENCIA y la vigencia según la forma de compra.",fbOk:"Correcto. Recuerda especificarlo siempre: ROBO CON VIOLENCIA. Contado = 3 meses. VENTOCREDIT = 1 año.",fbNo:"Recuerda: ROBO CON VIOLENCIA. De contado = 3 meses. Con VENTOCREDIT = 1 año.",fbOpts:["","Incompleto. No digas solamente «contra robo». Debes especificar: ROBO CON VIOLENCIA."]}
  },
  seguroANA:{
    objetivo:"Ofrecer Seguro ANA durante la atención sin omitirlo: si no se ofrece, el cliente no puede considerarlo en sus opciones de protección.",
    hero:"NO OLVIDES OFRECERLO.",
    cardTitle:"OFRECE SEGURO ANA",
    cardTxt:"Durante la atención, presenta al cliente la opción de Seguro ANA.",
    quote:"Si no lo ofreces, el cliente no puede considerarlo dentro de sus opciones de protección.",
    chain:["PLAN DE ÉXITO","SAL A RODAR PROTEGIDO","OFRECE SEGURO ANA"],
    reto:{q:"Durante la atención, ¿qué acción no debes omitir respecto al Seguro ANA?",opts:["Esperar a que el cliente pregunte por un seguro.","Ofrecer al cliente Seguro ANA como una opción de protección.","Hablar del seguro únicamente después de concretar la compra.","No mencionarlo para evitar agregar información a la venta."],correct:1,exp:"Seguro ANA debe ofrecerse durante la atención.",fbOk:"Correcto. Seguro ANA debe ofrecerse durante la atención.",fbNo:"Recuerda: no esperes a que el cliente pregunte. Debes OFRECER Seguro ANA."}
  },
  cierre:{
    objetivo:"Convertir el interés en un siguiente paso: entregar la cotización correcta en el momento correcto.",
    heroK:"La acción clave",
    heroA:"ENTREGA LA COTIZACIÓN CORRECTA",
    heroB:"EN EL MOMENTO CORRECTO",
    c1:{t:"COTIZACIÓN CORRECTA",txt:"Entrega al cliente una cotización clara y con la información correspondiente a la opción que está considerando."},
    c2:{t:"MOMENTO CORRECTO",txt:"Cuando el cliente ya mostró interés, la cotización ayuda a convertir la conversación en un siguiente paso."},
    flujo:["CLIENTE INTERESADO","COTIZACIÓN","SIGUIENTE PASO","SEGUIMIENTO"],
    callout:"NO DEJES IR UNA OPORTUNIDAD SIN GENERAR UN SIGUIENTE PASO.",
    calloutSub:"Entrega la cotización correcta en el momento adecuado.",
    chain:["COTIZACIÓN ENTREGADA","AHORA HAY QUE DAR SEGUIMIENTO","PILOT"],
    reto:{q:"Un cliente ya encontró un modelo que le interesa, conoce la información de compra, pero todavía no está listo para decidir. ¿Qué acción ayuda a generar el siguiente paso?",opts:["Despedirlo y esperar a que regrese.","Seguir mostrándole modelos aunque ya eligió uno.","Entregarle la cotización correcta para facilitar el seguimiento.","Esperar a que el cliente solicite una cotización en otra visita."],correct:2,exp:"La cotización correcta convierte el interés en un siguiente paso concreto de seguimiento.",fbOk:"Correcto. La cotización funciona como cierre transicional porque convierte el interés en un siguiente paso que posteriormente podemos dar seguimiento.",fbNo:"Recuerda: la cotización correcta, entregada en el momento adecuado, es el siguiente paso que mantiene viva la oportunidad."}
  },
  pilot:{
    objetivo:"Registrar correctamente al cliente en PILOT: sin registro no hay seguimiento, y sin seguimiento no hay cierre.",
    visual:["REGISTRA AL CLIENTE","DA SEGUIMIENTO","BUSCA EL CIERRE"],
    c1:{t:"REGISTRA CORRECTAMENTE",txt:"Después de la atención, registra correctamente al cliente y la información necesaria para continuar la oportunidad."},
    c2:{t:"DA SEGUIMIENTO",txt:"Utiliza el registro para retomar la conversación y continuar el proceso comercial."},
    callout:"SI NO REGISTRAS AL CLIENTE, NO PUEDES DAR UN SEGUIMIENTO CONSISTENTE.",
    calloutSub:"PILOT ayuda a que una oportunidad no termine cuando el cliente sale de la agencia.",
    flujo:["INTERÉS","COTIZACIÓN","REGISTRO EN PILOT","SEGUIMIENTO","VENTA"],
    reto:{q:"Entregaste una cotización y el cliente te dice que lo contactes posteriormente. ¿Qué debes hacer?",opts:["Esperar a que el cliente regrese.","Guardar la cotización y continuar con otro cliente.","Registrar correctamente al cliente en PILOT para generar y dar seguimiento a la oportunidad.","Contactarlo únicamente si recuerdas hacerlo."],correct:2,exp:"El registro correcto en PILOT genera la oportunidad y permite darle seguimiento.",fbOk:"Correcto. Después de generar un siguiente paso, el cliente debe quedar correctamente registrado para poder darle seguimiento.",fbNo:"Recuerda: si no registras al cliente en PILOT, no puedes dar un seguimiento consistente."}
  },
  ruta:{
    pasos:[{n:"PLAN DE ÉXITO",sub:"Decimos cómo lo vamos a ayudar"},{n:"SONDEO",sub:"Entendemos qué necesita y qué quiere cambiar"},{n:"SCRIPT MAESTRO",sub:"Conectamos su problema con el producto"},{n:"VENTEC",sub:"Mostramos diferenciación tecnológica"},{n:"GARANTÍA",sub:"Generamos confianza y respaldo"},{n:"PÓLIZA + ANA",sub:"Reforzamos protección"},{n:"COTIZACIÓN",sub:"Generamos un siguiente paso"},{n:"PILOT",sub:"Registramos y damos seguimiento"},{n:"CIERRE",sub:"Convertimos la oportunidad"}]
  }
};

// ============================================================
// SLIDE DEFINITIONS
// ============================================================
var SLIDES = [
  {id:"portada",title:"Portada"},
  {id:"ventaja",title:"Tu ventaja para vender más"},
  {id:"fuintro",title:"Follow Up Mystery Shopper"},
  {id:"fucomp",title:"Comparativo de Desempeño"},
  {id:"mod01",title:"Plan de Éxito"},
  {id:"mod02",title:"Sondeo / Villano"},
  {id:"mod03",title:"Script Maestro"},
  {id:"mod04",title:"VENTEC"},
  {id:"mod05",title:"Garantía"},
  {id:"mod06",title:"Póliza contra robo"},
  {id:"mod07",title:"Seguros ANA"},
  {id:"dif",title:"Diferenciadores"},
  {id:"mod08",title:"Cierre transicional"},
  {id:"mod09",title:"Bitácora y PILOT"},
  {id:"cierre",title:"Cierre"}
];

var currentSlide = 0;
var visitedSlides = new Set([0]);

// ============================================================
// INIT
// ============================================================
function init(){
  buildSlides();
  buildThemePanel();
  goSlide(0);
  setupEvents();
  setupScrollListener();
}

// ============================================================
// HELPERS
// ============================================================
function getEstado(p){
  if(p>=THRESHOLDS.fortaleza)return{cls:"f",label:"Fortaleza"};
  if(p>=THRESHOLDS.enDesarrollo)return{cls:"d",label:"En desarrollo"};
  return{cls:"p",label:"Prioridad"};
}
function delta(ini,fol){
  var dif=fol-ini;
  return{text:(dif>=0?"+":"")+dif+"%",cls:dif>0?"pos":dif<0?"neg":"neu"};
}

// ============================================================
// SLIDE RENDERING
// ============================================================
function buildSlides(){
  var c = document.getElementById("slides");
  var h = "";
  h += slidePortada();
  h += slideVentaja();
  h += slideFuIntro();
  h += slideFuComp();
  h += slideMod01();
  h += slideMod02();
  h += slideMod03();
  h += slideMod04();
  h += slideMod05();
  h += slideMod06();
  h += slideMod07();
  h += slideDif();
  h += slideMod08();
  h += slideMod09();
  h += slideCierre();
  c.innerHTML = h;
}

// ============================================================
// MODULE BUILDING HELPERS
// ============================================================
var RETOS = {};

function secHTML(num,title,sub){
  return '<div class="mod-sec"><div class="mod-sec-num">'+num+'</div><h3>'+title+(sub?'<small>'+sub+'</small>':'')+'</h3></div>';
}
function objHTML(txt){
  return '<div class="objetivo"><div class="objetivo-ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div><div class="ob-lb">Objetivo del módulo</div><p>'+txt+'</p></div></div>';
}
function convoHTML(convo){
  var h='<div class="convo">';
  convo.forEach(function(l){
    h+='<div class="convo-line"><div class="convo-who '+l.who+'">'+(l.who==="cliente"?"Cliente":"Asesor")+'</div><div class="convo-txt">'+l.txt+'</div></div>';
  });
  h+='</div>';
  return h;
}
function impCardHTML(frase,list){
  var h='<div class="imp-card"><div class="imp-lb">Impacto en la venta</div><div class="imp-tx">'+frase+'</div>';
  if(list&&list.length){
    h+='<div class="imp-list">'+list.map(function(i){return'<span>'+i+'</span>'}).join('')+'</div>';
  }
  h+='</div>';
  return h;
}
function retoHTML(prefix,ret){
  var letters=["A","B","C","D"];
  RETOS[prefix]=ret;
  var h='<div class="reto" id="'+prefix+'"><div class="reto-hd"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Reto de aplicación</div><div class="reto-q">'+ret.q+'</div><div class="reto-opts">';
  ret.opts.forEach(function(o,i){
    h+='<button class="reto-opt" onclick="answerReto(\''+prefix+'\','+i+')"><span class="qo-l">'+letters[i]+'</span><span>'+o+'</span></button>';
  });
  h+='</div><div class="reto-fb" id="'+prefix+'FB"></div></div>';
  return h;
}
function answerReto(prefix,idx){
  var box=document.getElementById(prefix);
  if(box.dataset.answered)return;
  box.dataset.answered="true";
  var ret=RETOS[prefix];
  var btns=box.querySelectorAll(".reto-opt");
  btns.forEach(function(b,i){if(i===idx)b.classList.add(ret.correct===idx?"correct":"wrong")});
  if(ret.correct!==idx)btns[ret.correct].classList.add("show-correct");
  var ok=ret.correct===idx;
  var fb=document.getElementById(prefix+"FB");
  fb.className="reto-fb show "+(ok?"fb-g":"fb-r");
  var txt=(ok?ret.fbOk:((ret.fbOpts&&ret.fbOpts[idx])||ret.fbNo))||("<strong>"+(ok?"¡Correcto!":"Incorrecto.")+"</strong>"+ret.exp);
  fb.innerHTML=txt;
  if(ok)fb.innerHTML+=retoSeqHTML(ret);
}
function retoSeqHTML(ret){
  if(!ret.seq||!ret.seq.length)return "";
  var h='<div style="font-weight:700;font-size:.72rem;letter-spacing:.6px;text-transform:uppercase;color:var(--g400);margin:10px 0 2px">Secuencia de la atención</div><div class="step-flow" style="margin:4px 0 2px">';
  ret.seq.forEach(function(s,i){
    if(ret.seqBold===i)h+='<div class="step-node" style="border-color:var(--bl);color:var(--bl);background:var(--bla)">'+s+'</div>';
    else h+='<div class="step-node">'+s+'</div>';
    if(i<ret.seq.length-1)h+='<div class="step-ar">&rarr;</div>';
  });
  h+='</div>';
  return h;
}
function slideIndex(id){
  for(var i=0;i<SLIDES.length;i++)if(SLIDES[i].id===id)return i;
  return 0;
}
var ICO={
  con:'<svg viewBox="0 0 80 80"><path d="M18 10h32a6 6 0 0 1 6 6v48a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z"/><path d="M25 20h14"/><path d="M27 30h10"/><path d="M44 36h16"/><path d="M52 24c4-3 9-3 12 0"/><path d="M52 32c7-5 13-5 18 0"/><path d="M52 40c5-3 9-3 12 0"/></svg>',
  ctrl:'<svg viewBox="0 0 80 80"><path d="M12 44h56"/><path d="M14 44l-7 10M66 44l7 10"/><rect x="26" y="14" width="28" height="18" rx="6"/><circle cx="34" cy="23" r="2"/><circle cx="40" cy="23" r="2"/><circle cx="46" cy="23" r="2"/></svg>',
  foco:'<svg viewBox="0 0 80 80"><rect x="28" y="8" width="26" height="52" rx="8"/><path d="M36 15h10"/><line x1="16" y1="30" x2="64" y2="52"/><circle cx="56" cy="22" r="8"/><path d="M56 10v4M56 30v4M44 22h4M64 22h4"/></svg>',
  tech:'<svg viewBox="0 0 80 80"><rect x="24" y="24" width="32" height="32" rx="6"/><rect x="34" y="34" width="12" height="12" rx="2"/><path d="M32 12v8M40 12v8M48 12v8M32 60v8M40 60v8M48 60v8M12 32h8M12 40h8M12 48h8M60 32h8M60 40h8M60 48h8"/></svg>',
  shield:'<svg viewBox="0 0 80 80"><path d="M40 6l28 9v19c0 14-12 28-28 34C24 62 12 48 12 34V15z"/></svg>',
  shieldck:'<svg viewBox="0 0 80 80"><path d="M40 6l28 9v19c0 14-12 28-28 34C24 62 12 48 12 34V15z"/><path d="M30 40l7 7 13-16"/></svg>',
  heart:'<svg viewBox="0 0 80 80"><path d="M40 66C20 52 12 42 12 30a14 14 0 0 1 28-6 14 14 0 0 1 28 6c0 12-8 22-28 36z"/></svg>',
  tag:'<svg viewBox="0 0 80 80"><path d="M56 10l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/></svg>',
  star:'<svg viewBox="0 0 80 80"><path d="M40 8l8 18 20 3-14 14 3 20-17-9-17 9 3-20L12 29l20-3z" stroke-width="2.4 " stroke-linejoin="round"/></svg>',
  spark:'<svg viewBox="0 0 80 80"><path d="M40 6c2 14 18 30 34 34-16 4-32 20-34 34-2-14-18-30-34-34C22 36 38 20 40 6z"/></svg>',
  target:'<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26"/><circle cx="40" cy="40" r="16"/><circle cx="40" cy="40" r="6"/></svg>',
  flag:'<svg viewBox="0 0 80 80"><path d="M16 12v56"/><path d="M16 14h34l-6 10 6 10H16"/></svg>',
  helmet:'<svg viewBox="0 0 80 80"><path d="M16 42a24 24 0 0 1 48 0v10a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V42z"/><path d="M28 34a14 6 0 0 1 24 0"/><circle cx="40" cy="26" r="3"/><path d="M24 52h32"/><path d="M18 58h44"/></svg>',
  plus:'<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26"/><path d="M40 28v24M28 40h24"/></svg>',
  link:'<svg viewBox="0 0 80 80"><circle cx="28" cy="40" r="14"/><circle cx="52" cy="40" r="14"/><path d="M40 32c3 3 3 13 0 16"/></svg>',
  msg:'<svg viewBox="0 0 80 80"><path d="M12 14h56v40H30l-12 10v-10H12z"/></svg>',
  user:'<svg viewBox="0 0 80 80"><circle cx="40" cy="26" r="14"/><path d="M14 66c2-18 12-26 26-26s24 8 26 26"/></svg>',
  cal:'<svg viewBox="0 0 80 80"><rect x="14" y="16" width="52" height="48" rx="8"/><path d="M14 32h52M28 8v18M52 8v18"/></svg>',
  clock:'<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26"/><path d="M40 22v18l12-8"/></svg>',
  doc:'<svg viewBox="0 0 80 80"><path d="M16 8h32l12 12v52H16z"/><path d="M48 8v12h12"/><path d="M27 36h24M27 48h24"/></svg>',
  check:'<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="27"/><path d="M27 41l9 9 17-18"/></svg>',
  eye:'<svg viewBox="0 0 80 80"><path d="M8 40c8-14 20-20 32-20s24 6 32 20c-8 14-20 20-32 20S16 54 8 40z"/><circle cx="40" cy="40" r="10"/></svg>',
  trend:'<svg viewBox="0 0 80 80"><path d="M8 58l16-16 12 8 20-20"/><path d="M42 30h14v14"/></svg>',
  bell:'<svg viewBox="0 0 80 80"><path d="M40 12a16 16 0 0 1 16 16v12l6 10H18l6-10V28a16 16 0 0 1 16-16z"/><path d="M32 52v3a8 8 0 0 0 16 0v-3"/></svg>',
  lock:'<svg viewBox="0 0 80 80"><rect x="22" y="34" width="36" height="30" rx="6"/><path d="M30 34v-8a10 10 0 0 1 20 0v8"/></svg>',
  x:'<svg viewBox="0 0 80 80"><line x1="24" y1="24" x2="56" y2="56"/><line x1="56" y1="24" x2="24" y2="56"/></svg>'
};
function mCardHTML(c){
  var h='<div class="m-card">';
  if(c.num)h+='<span class="m-num">'+c.num+'</span>';
  if(c.img)h+='<div class="m-img">'+c.img+'</div>';
  if(c.ico)h+='<div class="m-ico">'+c.ico+'</div>';
  if(c.title)h+='<div class="m-title">'+c.title+'</div>';
  if(c.desc)h+='<div class="m-desc">'+c.desc+'</div>';
  if(c.detail)h+='<button class="m-more" onclick="mToggle(this)"><span class="mm-lbl">Ver más</span><span class="mm-ico">+</span></button><div class="m-detail">'+c.detail+'</div>';
  h+='</div>';
  return h;
}
function mToggle(btn){
  var card=btn.closest(".m-card");
  var detail=card.querySelector(".m-detail");
  var expanded=card.classList.toggle("expanded");
  var lbl=btn.querySelector(".mm-lbl");
  if(expanded){
    lbl.textContent="Ver menos";
    detail.style.maxHeight=detail.scrollHeight+"px";
  }else{
    lbl.textContent="Ver más";
    detail.style.maxHeight="0px";
  }
}
function mGridHTML(cards){
  var h='<div class="m-grid">';
  cards.forEach(function(c){h+=mCardHTML(c)});
  h+='</div>';
  return h;
}
function whyHTML(items,cls){
  var h='<div class="why-grid'+(cls?" "+cls:"")+'">';
  items.forEach(function(w){
    h+='<div class="why-card">'+(w.ico?'<div class="why-ico">'+w.ico+'</div>':'')+'<div class="why-t">'+w.t+'</div>'+(w.s?'<div class="why-s">'+w.s+'</div>':'')+'</div>';
  });
  h+='</div>';
  return h;
}
function focusHTML(lb,tx){
  return '<div class="focus"><div class="fo-lb">'+lb+'</div><div class="fo-tx">'+tx+'</div></div>';
}
function sideExHTML(noLb,noTxt,noNote,yesLb,yesTxt,yesNote){
  var h='<div class="side-ex">';
  h+='<div class="se-card no"><div class="se-hd"><span class="se-ico">'+ICO.x+'</span><span class="se-lb">'+noLb+'</span></div><div class="se-tx">'+noTxt+'</div>'+(noNote?'<div class="se-note">'+noNote+'</div>':'')+'</div>';
  h+='<div class="se-card yes"><div class="se-hd"><span class="se-ico">'+ICO.check+'</span><span class="se-lb">'+yesLb+'</span></div><div class="se-tx">'+yesTxt+'</div>'+(yesNote?'<div class="se-note">'+yesNote+'</div>':'')+'</div>';
  h+='</div>';
  return h;
}
function vFlowHTML(steps){
  var h='<div class="v-flow">';
  steps.forEach(function(s,i){
    h+='<div class="vf-row"><div class="vf-num">'+(i+1)+'</div><div class="vf-bd"><h4>'+s.t+'</h4>'+(s.s?'<p>'+s.s+'</p>':'')+'</div></div>';
  });
  h+='</div>';
  return h;
}
function chipHTML(items){
  var h='<div class="chip-grid">';
  items.forEach(function(c){
    h+='<div class="chip-card"><span class="cc-ico">'+(c.ic||ICO.check)+'</span><span class="cc-t">'+c.t+'</span></div>';
  });
  h+='</div>';
  return h;
}

function slidePortada(){
  var h = '<div class="slide" id="s_portada"><div class="slide-inner portada-inner">';
  h += '<div class="port-mark">VENTO</div>';
  h += '<h1 class="port-title">Retroalimentación<br></h1>';
  h += '<p class="slide-sub port-objective">Revisaremos qué está ocurriendo después del Follow Up y reforzaremos los puntos que aún necesitan mayor consistencia.</p>';
  h += '<div class="port-sep"></div>';
  h += '<div class="port-grid">';
  var fs=[
    {l:"Fase 1",t:"OBSERVAMOS",s:"Revisamos los resultados."},
    {l:"Fase 2",t:"REFORZAMOS",s:"Fortalecemos lo que aún falla."},
    {l:"Fase 3",t:"EJECUTAMOS",s:"Lo llevamos a la venta."}
  ];
  fs.forEach(function(f){
    h += '<div class="port-card"><div class="pc-lb">'+f.l+'</div><div class="pc-t">'+f.t+'</div><p>'+f.s+'</p></div>';
  });
  h += '</div>';
  h += '<div class="port-next">Siguiente <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>';
  h += '</div></div>';
  return h;
}

function slideFuIntro(){
  var h = '<div class="slide" id="s_fuintro"><div class="slide-inner">';
  h += '<div class="fu-kicker">RETROALIMENTACIÓN</div><h2 style="font-size:clamp(1.6rem,3.6vw,2.6rem);letter-spacing:.5px">FOLLOW UP MYSTERY SHOPPER</h2><div class="fu-agosto">'+(window.FOLLOWUP_PERIOD||'AGOSTO 2026')+'</div><p class="slide-sub" style="margin-top:18px">Resultados que explican qué debemos reforzar en piso de venta.</p>';
  h += '<div class="fu-sec-t">Top 5 &mdash; Desviaciones cr&iacute;ticas en atenci&oacute;n al cliente</div>';
  h += '<div class="fu-rank fu-intro-rank">';
  FU_TOP5.forEach(function(r){
    h += '<div class="fr-row"><div class="fr-num">#'+r.num+'</div><div class="fr-bd"><div class="fr-nm">'+r.nombre+'</div>'+(r.detalle?'<div class="fr-dt">'+r.detalle+'</div>':'')+'</div><div class="fr-inc">'+r.inc+' de 144 no cumplen</div><div class="fr-pct">'+r.pct+'%</div><div class="fr-bar"><div class="fr-fill" style="width:'+r.pct+'%"></div></div></div>';
  });
  h += '</div>';
  h += '<div class="fu-puente"><div class="fp-t">ESTOS RESULTADOS DEFINEN LOS TEMAS QUE REFORZAREMOS HOY.</div><div class="fp-chips">SONDEO &rarr; SCRIPT MAESTRO &rarr; PLAN DE ÉXITO &rarr; GARANTÍA &rarr; VENTEC</div></div>';
  h += '</div></div>';
  return h;
}

function slideFuComp(){
  function col(classR,ttl,badge,numbered,rows,tot){
    var h='<div class="fc-col'+(classR?' risk':'')+'"><div class="fc-hd"><div class="fc-t">'+ttl+'</div><div class="fc-badge'+(classR?' risk':'')+'">'+badge+'</div></div>';
    h+='<table class="fc-tbl"><thead><tr><th></th><th>Agencia</th><th class="c">Cal</th></tr></thead><tbody>';
    rows.forEach(function(r,i){
      var agn=numbered?r.agn+' '+(i<9?"0"+(i+1):(i+1)):r.agn;
      h+='<tr><td class="fc-idx">'+(i+1)+'</td><td class="fc-agn">'+agn+'</td><td class="c"><span class="fc-cal'+(classR?' risk':'')+'">'+r.cal+'</span></td></tr>';
    });
    h+='</tbody></table></div>';
    return h;
  }
  var h = '<div class="slide" id="s_fucomp"><div class="slide-inner"><div class="slide-label">Resultados</div><h2>Comparativo de Desempeño</h2><p class="slide-sub">Top 10 Agencias Destacadas vs. Top 10 Mayor Riesgo.</p>';
  h += '<div class="fu-compare">';
  h += col(false,"Top 10 Destacadas","\u2265 85 Puntos",false,FU_DESTACADAS.map(function(r){return{agn:r.agencia,cal:r.cal,motos:r.motos,monto:r.monto}}),FU_TOT_DESTACADAS);
  h += col(true,"Top 10 Mayor Riesgo","Alerta",true,FU_RIESGO.map(function(r){return{agn:r.agencia||'AGENCIA',cal:r.cal,motos:r.motos,monto:r.monto}}),FU_TOT_RIESGO);
  h += '</div>';
  h += '<div class="fc-note">UN ALTO VOLUMEN DE VENTA NO GARANTIZA UNA EJECUCIÓN CORRECTA DEL ESTÁNDAR.</div>';
  h += '</div></div>';
  return h;
}



// ============================================================
// RECURSOS VISUALES INCRUSTADOS · V11.4
// Evita dependencias de rutas locales/GitHub Pages.
// ============================================================
const RETRO_ASSETS = {"problema-filosofico.png":"assets/7251894ecfc6d710.png","problema-externo.png":"assets/3dd95241c00f8c73.png","ajuste-bolsillo.png":"assets/d3d24b727a057a5d.png","pilot.png":"assets/b9842b9fefa729ac.png","rodar-protegido.png":"assets/346cea66290a1fb3.png","modelo-ideal.png":"assets/8253cf0c43113203.png","ventec-logo.png":"assets/67cab61db9d9411b.png","poliza-robo-violencia.jpg":"assets/1f52a73bc2d364fa.jpg","plan de exito.png":"assets/249645b81383fca3.png","garantia.png":"assets/b0676d68c6f5ac33.png","ventec.png":"assets/65b507653b6d9cd6.png","logo-pilot-solution-3.svg":"assets/4da8bac15c38b155.svg","formato-cotizacion.png":"assets/b3fd2fffcd52de64.png","cierre-sesion.png":"assets/08a366fec588a9cf.png","logotipo-seguro-ana.svg":"assets/d00038bbdb642533.svg","problema-interno.png":"assets/461bcef17ac23166.png"};
function assetUrl(name){ return RETRO_ASSETS[name] || name; }

function slideMod01(){
  var C = CONTENT.planExito;
  var h = '<div class="slide" id="s_mod01"><div class="slide-inner"><div class="slide-label">Módulo 01</div><h2>Plan de Éxito</h2><p class="slide-sub">La ruta inicial que le explica al cliente cómo lo vamos a ayudar durante su proceso de compra.</p>';
  h += objHTML(C.objetivo);
  h += secHTML("1","¿Cómo decírselo al cliente?","Puedes decirlo con tus propias palabras");
  h += '<div class="pe-hd"><div class="pe-hd-t">'+C.header+'</div><div class="pe-hd-s">'+C.headerSub+'</div></div>';
  var pk=["MODELO IDEAL","BOLSILLO","PROTECCIÓN"];
  var pcards=C.pilares.map(function(p,i){
    return {num:"0"+(i+1),img:p.img,nombre:p.nombre,frases:p.frases};
  });
  h += '<div class="pe-grid">';
  pcards.forEach(function(c){
    h += '<div class="pe-card"><div class="pe-num">'+c.num+'</div><div class="pe-img"><img src="'+assetUrl(c.img)+'" alt="'+c.nombre+'"></div><div class="pe-t">'+c.nombre+'</div><div class="pe-lb">FORMAS DE DECIRLO</div><div class="pe-says">'+c.frases.map(function(f){return'<div class="pe-say">“'+f+'”</div>'}).join('')+'</div></div>';
  });
  h += '</div>';
  h += secHTML("2","Ejemplo completo","Un mensaje que comunica los tres pilares");
  h += '<div class="pe-eg"><div class="pe-eg-txt">“'+C.ejemplo+'”</div><div class="pe-eg-f">'+pk.map(function(k,i){return(i>0?'<span class="pe-op">+</span>':'')+'<span class="pe-chip">'+k+'</span>'}).join('')+'</div></div>';
  h += '<div class="pe-call"><div class="pe-call-t">'+C.callout+'</div><div class="pe-call-s">'+C.calloutSub+'</div></div>';
  h += secHTML("3","Reto","Aplica lo aprendido");
  h += retoHTML("ret01",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod02(){
  var C = CONTENT.sondeo;
  var h = '<div class="slide" id="s_mod02"><div class="slide-inner"><div class="slide-label">Módulo 02</div><h2>Sondeo / Villano</h2><p class="slide-sub">Descubre los 3 niveles del cliente: externo, interno y filosófico.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="niv-grid">';
  var nImgs=["problema-externo.png","problema-interno.png","problema-filosofico.png"];
  var nTitles=["PROBLEMA EXTERNO","PROBLEMA INTERNO","PROBLEMA FILOSÓFICO"];
  var nShorts=[C.niveles[0].def,C.niveles[1].def,C.niveles[2].def];
  [0,1,2].forEach(function(i){
    h += '<div class="niv-card"><div class="niv-num">0'+(i+1)+'</div><div class="niv-img"><img src="'+assetUrl(nImgs[i])+'" alt="'+nTitles[i]+'"></div><div class="niv-t">'+nTitles[i]+'</div><div class="niv-s">'+nShorts[i]+'</div></div>';
  });
  h += '</div>';
  h += '<div class="step-flow sondeo-flow">SITUACIÓN ACTUAL'+'<div class="step-ar">&rarr;</div><div class="step-node">PROBLEMA EXTERNO</div><div class="step-ar">&rarr;</div><div class="step-node">PROBLEMA INTERNO</div><div class="step-ar">&rarr;</div><div class="step-node">PROBLEMA FILOSÓFICO</div></div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret02",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod03(){
  var C = CONTENT.scriptMaestro;
  var h = '<div class="slide" id="s_mod03"><div class="slide-inner"><div class="slide-label">Módulo 03</div><h2>Script Maestro</h2><p class="slide-sub">Convertir una característica técnica en una solución relevante. No es repetir datos: es conectar lo que el modelo hace con lo que el cliente vive.</p>';
  h += objHTML(C.objetivo);
  h += secHTML("1","¿Qué debo entender?","La fórmula del Script Maestro");
  h += '<div class="steps-vert">';
  C.formula.forEach(function(f,i){
    var col = i===0?"var(--red)":i===1?"var(--bl)":"var(--grn)";
    h += '<div class="stp-v"><div class="stp-v-num" style="background:'+col+';border-color:'+col+';color:#fff">'+(i+1)+'</div><div class="stp-v-bd" style="padding-top:6px"><div style="font-weight:700;font-size:.9rem;color:'+col+'">'+f+'</div></div></div>';
  });
  h += '</div>';
  h += '<p class="dr-nota" style="margin-top:10px">'+C.notaRelacion+'</p>';
  h += secHTML("2","¿Cómo lo hago?","Tres momentos para armarlo");
  h += '<div class="steps-vert">';
  C.pasos.forEach(function(p){
    h += '<div class="stp-v"><div class="stp-v-num">&#10003;</div><div class="stp-v-bd"><h4>'+p.titulo+'</h4><p>'+p.desc+'</p><div class="stp-v-ex">'+p.ejemplo+'</div></div></div>';
  });
  h += '</div>';
  h += '<h3 style="margin:22px 0 8px">Constructor de Script Maestro</h3>';
  h += '<div class="script-note"><div class="sn-t">NO LEAS LA FICHA TÉCNICA. TRADÚCELA EN VALOR PARA EL CLIENTE.</div><div class="sn-sub">Característica = qué tiene la moto.&nbsp;&nbsp;Beneficio = por qué le importa al cliente.</div></div>';
  h += '<div class="grid-3" style="margin-bottom:16px"><div><label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--g400);margin-bottom:6px">Problema del cliente</label><select id="smProb" onchange="genScript()" style="width:100%;padding:12px;border:2px solid var(--g200);border-radius:var(--rs);font-family:inherit;font-size:.85rem;color:var(--bk);background:var(--w)"><option value="">Seleccionar...</option>'+C.problemas.map(function(p,i){return'<option value="'+i+'">'+p.p+'</option>'}).join('')+'</select></div><div><label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--g400);margin-bottom:6px">Característica</label><select id="smCarac" onchange="genScript()" style="width:100%;padding:12px;border:2px solid var(--g200);border-radius:var(--rs);font-family:inherit;font-size:.85rem;color:var(--bk);background:var(--w)"><option value="">Seleccionar...</option>'+C.caracteristicas.map(function(c,i){return'<option value="'+i+'">'+c.label+'</option>'}).join('')+'</select></div><div><label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--g400);margin-bottom:6px">Beneficio</label><select id="smBen" onchange="genScript()" style="width:100%;padding:12px;border:2px solid var(--g200);border-radius:var(--rs);font-family:inherit;font-size:.85rem;color:var(--bk);background:var(--w)"><option value="">Seleccionar...</option>'+C.beneficios.map(function(b,i){return'<option value="'+i+'">'+b.b+'</option>'}).join('')+'</select></div></div>';
  h += '<div class="script-out"><div class="script-out-label">Script Maestro resultante</div><div class="script-out-txt" id="smOut" style="white-space:normal">Selecciona los tres elementos para construir tu Script Maestro.</div></div>';
  h += secHTML("3","Ejemplo en piso de venta","");
  h += convoHTML(C.convo);
  h += impCardHTML(C.impactoFrase,C.impacto);
  h += secHTML("4","Reto","Aplica lo aprendido");
  h += retoHTML("ret03",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod04(){
  var C = CONTENT.ventec;
  var h = '<div class="slide" id="s_mod04"><div class="slide-inner"><div class="slide-label">Módulo 04</div><h2>VENTEC</h2><p class="slide-sub">Explica la tecnología y ofrece el casco.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="ven-logo"><img src="assets/67cab61db9d9411b.png" alt="VENTEC"></div>';
  h += '<div class="ven-hero"><div class="img-frame"><img src="assets/65b507653b6d9cd6.png" alt="VENTEC"></div><div class="ven-big"><b>EXPLICA VENTEC</b> <span class="vb-or">+</span> <b>OFRECE EL CASCO</b></div></div>';
  h += '<div class="ven-line">'+C.cierre+'</div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret04",C.reto);
  h += '</div></div>';
  return h;
}
function vcToggle(btn){
  var card=btn.closest(".vc-card");
  var detail=card.querySelector(".vc-detail");
  var expanded=card.classList.toggle("expanded");
  var lbl=btn.querySelector(".vc-mlbl");
  if(expanded){lbl.textContent="Ver menos";detail.style.maxHeight=detail.scrollHeight+"px";}
  else{lbl.textContent="Ver ejemplo";detail.style.maxHeight="0px";}
}

function slideMod05(){
  var C = CONTENT.garantia;
  var h = '<div class="slide" id="s_mod05"><div class="slide-inner"><div class="slide-label">Módulo 05</div><h2>Garantía VENTO</h2><p class="slide-sub">Respaldo que se percibe cuando se comunica.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="gar-layout">';
  h += '<div class="img-frame image-garantia iz-open" onclick="openImg(\'assets/b0676d68c6f5ac33.png\')"><img src="assets/b0676d68c6f5ac33.png" alt="Póliza de Garantía VENTO"><span class="iz-tag">Ampliar</span></div>';
  h += '<div class="gar-datos">';
  h += '<div class="gar-data"><div class="gd-lb">'+C.c1.t+'</div><div class="gd-big">'+C.c1.v1+' <span class="gd-or">O</span> '+C.c1.v2+'</div></div>';
  h += '<div class="gar-data"><div class="gd-lb">'+C.c2.t+'</div><div class="gd-big">'+C.c2.v1+' <span class="gd-or">O</span> '+C.c2.v2+'</div></div>';
  h += '</div>';
  h += '</div>';
  h += '<div class="gar-msg">GENERA CONFIANZA.</div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret05",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod06(){
  var C = CONTENT.poliza;
  var h = '<div class="slide" id="s_mod06"><div class="slide-inner"><div class="slide-label">Módulo 06</div><h2>Póliza contra robo <span style="color:var(--bl);font-size:clamp(1.4rem,3.4vw,2.3rem)">CON VIOLENCIA</span></h2><p class="slide-sub">'+C.heroSub+'</p>';
  h += objHTML(C.objetivo);
  h += '<div class="pol-layout">';
  h += '<div class="img-frame"><img src="assets/1f52a73bc2d364fa.jpg" alt="Póliza contra robo con violencia"></div>';
  h += '<div class="pol-vig">';
  h += '<div class="pv-item"><div class="pv-lb">'+C.c2.t+'</div><div class="pv-num">'+C.c2.num+'</div></div>';
  h += '<div class="pv-item vy"><div class="pv-lb">'+C.c3.t+'</div><div class="pv-num">'+C.c3.num+'</div></div>';
  h += '</div>';
  h += '</div>';
  h += '<div class="pol-line">LA PÓLIZA ES CONTRA <b>ROBO CON VIOLENCIA</b>.</div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret06",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod07(){
  var C = CONTENT.seguroANA;
  var h = '<div class="slide" id="s_mod07"><div class="slide-inner"><div class="slide-label">Módulo 07</div><h2>Seguro ANA</h2><p class="slide-sub">OFRÉCELO.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="ana-logo"><img src="assets/d00038bbdb642533.svg" alt="Seguro ANA" title="Seguro ANA"></div>';
  h += '<div class="seg-line">Presenta al cliente Seguro ANA como una opción de protección.</div>';
  h += '<div class="plan-chain"><div class="chl">'+C.chain[0]+'</div><div class="ch-arrow">&darr;</div><div class="chl">'+C.chain[1]+'</div><div class="ch-arrow">&darr;</div><div class="ch-fin">'+C.chain[2]+'</div></div>';
  h += secHTML("2","Reto","Aplica lo aprendido");
  h += retoHTML("ret07",C.reto);
  h += '</div></div>';
  return h;
}

function slideDif(){
  var h = '<div class="slide" id="s_dif"><div class="slide-inner"><div class="slide-label">Diferenciadores</div><h2>Los 4 diferenciadores</h2><p class="slide-sub">Cada módulo suma un argumento comercial. El cliente no puede valorar un beneficio que el asesor nunca le explicó.</p>';
  h += secHTML("1","¿Qué debo entender?","Cómo conectan los módulos 04 a 07");
  h += '<div class="diff-grid">';
  var ds=[
    {img:"ventec.png",alt:"VENTEC",t:"VENTEC",k:"Tecnología",main:"Explícala y conviértela en valor.",add:"+ Venta cruzada de casco"},
    {img:"garantia.png",alt:"Póliza de Garantía VENTO",t:"GARANTÍA",k:"Respaldo",main:"3 años o 33,000 km",sub:"Genera confianza."},
    {img:"poliza-robo-violencia.jpg",alt:"Póliza contra robo con violencia",t:"PÓLIZA",k:"Protección",main:'ROBO <span class="dc-v">CON VIOLENCIA</span>',sub:'No es solo «robo».'},
    {img:"logotipo-seguro-ana.svg",alt:"Seguro ANA",t:"SEGURO ANA",k:"Protección",main:"OFRÉCELO.",sub:"Complementa el objetivo de salir protegido."}
  ];
  ds.forEach(function(d){
    h += '<div class="diff-card"><div class="diff-img"><img src="'+assetUrl(d.img)+'" alt="'+d.alt+'" loading="lazy"></div><div class="diff-title">'+d.t+'</div><div class="diff-k">'+d.k+'</div><div class="diff-main">'+d.main+'</div>'+(d.add?'<div class="diff-add">'+d.add+'</div>':(d.sub?'<div class="diff-sub">'+d.sub+'</div>':''))+'</div>';
  });
  h += '</div>';
  h += secHTML("2","La fórmula","Qué suma cada argumento");
  h += '<div class="diff-cnx"><div class="cnx-item">VENTEC</div><div class="cnx-op">+</div><div class="cnx-item">GARANTÍA</div><div class="cnx-op">+</div><div class="cnx-item">PÓLIZA</div><div class="cnx-op">+</div><div class="cnx-item">SEGURO ANA</div><div class="cnx-eq">=</div><div class="cnx-res">MÁS VALOR PARA LA VENTA</div></div>';
  h += '</div></div>';
  return h;
}

function slideMod08(){
  var C = CONTENT.cierre;
  var h = '<div class="slide" id="s_mod08"><div class="slide-inner"><div class="slide-label">Módulo 08</div><h2>Cierre transicional</h2><p class="slide-sub">COTIZA.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="ct-cols">';
  h += '<div class="ct-doc"><div class="doc-frame iz-open" onclick="openImg(\'assets/b3fd2fffcd52de64.png\')"><img src="assets/b3fd2fffcd52de64.png" alt="Formato de Cotización"><span class="iz-tag">Ampliar</span></div></div>';
  h += '<div class="focus" style="margin:0"><div class="fo-lb">Clave</div><div class="fo-tx">'+C.callout+'</div></div>';
  h += '</div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret08",C.reto);
  h += '</div></div>';
  return h;
}

function slideMod09(){
  var C = CONTENT.pilot;
  var h = '<div class="slide" id="s_mod09"><div class="slide-inner"><div class="slide-label">Módulo 09</div><h2>Bitácora y PILOT</h2><p class="slide-sub">REGISTRA PARA DAR SEGUIMIENTO.</p>';
  h += objHTML(C.objetivo);
  h += '<div class="pilot-hd"><img src="assets/4da8bac15c38b155.svg" alt="PILOT"></div>';
  h += '<div class="plan-chain"><div class="chl">'+C.visual[0]+'</div><div class="ch-arrow">&darr;</div><div class="chl">'+C.visual[1]+'</div><div class="ch-arrow">&darr;</div><div class="ch-fin">'+C.visual[2]+'</div></div>';
  h += '<div class="pilot-app iz-open" onclick="openImg(\'assets/b9842b9fefa729ac.png\')"><img src="assets/b9842b9fefa729ac.png" alt="PILOT"><span class="iz-tag">Ampliar</span></div>';
  h += secHTML("1","Reto","Aplica lo aprendido");
  h += retoHTML("ret09",C.reto);
  h += '</div></div>';
  return h;
}

function slideCierre(){
  var resumen=[
    ["Plan de Éxito","Dilo."],
    ["Sondeo","Descubre."],
    ["Script Maestro","Conecta."],
    ["VENTEC","Explícalo + ofrece casco."],
    ["Garantía","Genera confianza."],
    ["Póliza","Robo con violencia."],
    ["Seguro ANA","Ofrécelo."],
    ["Cierre transicional","Cotiza."],
    ["PILOT","Registra y da seguimiento."]
  ];
  var h = '<div class="slide" id="s_cierre"><div class="slide-inner" style="display:flex;flex-direction:column;justify-content:center;min-height:calc(100vh - 160px);text-align:center">';
  h += '<h2 style="margin-bottom:6px;font-size:clamp(1.3rem,2.8vw,1.9rem)"></h2>';
  h += '<div class="cierre-img"><img src="assets/08a366fec588a9cf.png" alt="Cierre de sesión"></div>';
  h += '<div class="cierre-msg">AHORA<br><span>LLÉVALO A LA VENTA.</span></div>';
  h += '<div class="res-grid">';
  resumen.forEach(function(r){
    h += '<div class="res-chip"><div class="rc-n">'+r[0]+'</div><div class="rc-a">'+r[1]+'</div></div>';
  });
  h += '</div>';
  h += '</div></div>';
  return h;
}

var COMMITMENTS = ["Preguntar antes de recomendar.","Conectar el producto con la necesidad.","Registrar y dar seguimiento."];

// ============================================================
// NAVIGATION
// ============================================================
function goSlide(idx){
  if(idx<0||idx>=SLIDES.length)return;
  var prev = document.querySelector(".slide.active");
  var next = document.getElementById("s_"+SLIDES[idx].id);
  if(prev){prev.classList.remove("active");prev.classList.add("exit-left");setTimeout(function(){prev.classList.remove("exit-left")},400)}
  if(next){next.classList.add("active");next.scrollTop=0}
  currentSlide=idx;
  visitedSlides.add(idx);
  try{var sid=SLIDES[idx].id;if(window.setDetectedModule && window.LIVE_EXERCISES && LIVE_EXERCISES[sid])setDetectedModule(sid,true);}catch(e){}
  document.getElementById("navInfo").textContent=(idx+1)+" / "+SLIDES.length;
  document.getElementById("tbTitle").textContent=SLIDES[idx].title;
  document.getElementById("prevBtn").disabled=idx===0;
  document.getElementById("nextBtn").disabled=idx===SLIDES.length-1;
  var pct=Math.round((idx/(SLIDES.length-1))*100);
  document.getElementById("progressFill").style.width=pct+"%";
  updateThemePanel();
  closeMenu();
  animateBars();
  // update query param for refreshing
  try{history.replaceState(null,"","#"+SLIDES[idx].id)}catch(e){}
}

// ============================================================
// THEME PANEL
// ============================================================
function buildThemePanel(){
  var h='';
  h+='<div class="tp-sep">Inicio</div>';
  h+='<div class="tp-item" data-idx="0" onclick="goSlide(0)"><span class="tp-num">&bull;</span>Portada</div>';
  h+='<div class="tp-item" data-idx="1" onclick="goSlide(1)"><span class="tp-num">&bull;</span>Tu ventaja para vender más</div>';
  h+='<div class="tp-sep">Resultados</div>';
  h+='<div class="tp-item" data-idx="'+slideIndex("fuintro")+'" onclick="goSlide(slideIndex(\'fuintro\'))"><span class="tp-num">&bull;</span>Follow Up Mystery Shopper</div>';
  h+='<div class="tp-item" data-idx="'+slideIndex("fucomp")+'" onclick="goSlide(slideIndex(\'fucomp\'))"><span class="tp-num">&bull;</span>Comparativo de Desempeño</div>';
  h+='<div class="tp-sep">Material de Refuerzo</div>';
  var modulos=["Plan de Éxito","Sondeo / Villano","Script Maestro","VENTEC","Garantía","Póliza contra robo","Seguros ANA"];
  modulos.forEach(function(m,i){
    h+='<div class="tp-item" data-idx="'+slideIndex("mod0"+(i+1))+'" onclick="goSlide(slideIndex(\'mod0'+(i+1)+'\'))"><span class="tp-num">'+(i<9?"0"+(i+1):(i+1))+'</span>'+m+'</div>';
  });
  h+='<div class="tp-item" data-idx="'+slideIndex("dif")+'" onclick="goSlide(slideIndex(\'dif\'))"><span class="tp-num">&bull;</span>Diferenciadores</div>';
  h+='<div class="tp-item" data-idx="'+slideIndex("mod08")+'" onclick="goSlide(slideIndex(\'mod08\'))"><span class="tp-num">08</span>Cierre transicional</div>';
  h+='<div class="tp-item" data-idx="'+slideIndex("mod09")+'" onclick="goSlide(slideIndex(\'mod09\'))"><span class="tp-num">09</span>Bitácora y PILOT</div>';
  h+='<div class="tp-sep">Cierre</div>';
  h+='<div class="tp-item" data-idx="'+slideIndex("cierre")+'" onclick="goSlide(slideIndex(\'cierre\'))"><span class="tp-num">&blacksquare;</span>Cierre</div>';
  document.getElementById("tpList").innerHTML=h;
}

function updateThemePanel(){
  document.querySelectorAll(".tp-item").forEach(function(el){
    el.classList.remove("active");
    var idx=parseInt(el.dataset.idx);
    if(visitedSlides.has(idx))el.classList.add("visited");
    if(idx===currentSlide)el.classList.add("active");
  });
}

function toggleMenu(){
  document.getElementById("themePanel").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("open");
}
function closeMenu(){
  document.getElementById("themePanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

// ============================================================
// INTERACTIVITY
// ============================================================
function genScript(){
  var pi=document.getElementById("smProb").value;
  var ci=document.getElementById("smCarac").value;
  var bi=document.getElementById("smBen").value;
  var out=document.getElementById("smOut");
  if(pi===""||ci===""||bi===""){out.textContent="Selecciona los tres elementos para construir tu Script Maestro.";return}
  out.classList.remove("ok","bad");
  var C=CONTENT.scriptMaestro;
  var p=C.problemas[+pi],c=C.caracteristicas[+ci],b=C.beneficios[+bi];
  var pcInvalida=p.rel.indexOf(+ci)<0;
  var cbInvalida=c.compatibleBenefits.indexOf(+bi)<0;
  if(pcInvalida||cbInvalida){
    out.classList.add("bad");
    out.textContent=C.combinacionInvalida;
    return;
  }
  out.classList.add("ok");
  var conectores=["Como me comentabas que ","Por lo que me mencionas, ","Tomando en cuenta que "];
  var c1=conectores[pi%conectores.length];
  out.textContent='"'+c1+p.ctx+", este modelo cuenta con "+c.scriptText+", "+b.f+".\"";
}

function openSov(){document.getElementById("sov").classList.add("open");document.getElementById("sovI").focus()}
function closeSov(){document.getElementById("sov").classList.remove("open");document.getElementById("sovI").value="";document.getElementById("sovR").innerHTML=""}

function openModal(title,body){document.getElementById("modTt").textContent=title;document.getElementById("modBd").innerHTML=body;document.getElementById("modalO").classList.add("open")}
function closeModal(){document.getElementById("modalO").classList.remove("open")}
function openImg(src){
  document.getElementById("imgZoomImg").src=src;
  document.getElementById("imgZoom").classList.add("open");
  izState={z:1,tx:0,ty:0};
  applyZoom(true);
  var tb=document.querySelector(".topbar"),pv=document.querySelector(".progress-line"),nb=document.querySelector(".nav-bar");
  if(tb)tb.classList.remove("reveal");if(pv)pv.classList.remove("reveal");if(nb)nb.classList.remove("reveal");
}
function closeImg(){
  document.getElementById("imgZoom").classList.remove("open");
  izState={z:1,tx:0,ty:0};
  if(izWrap)izWrap.classList.remove("dragging");
}
function isImgZoomOpen(){return document.getElementById("imgZoom").classList.contains("open")}
function closeAll(){closeMenu();closeSov();closeModal();closeImg();var fp=document.getElementById("fabPanel");if(fp)fp.classList.remove("open")}

/* ZOOM DE IMAGEN */
var izWrap=null,izState={z:1,tx:0,ty:0},izDrag=null,izMin=.5,izMax=3;
function imgZoomRect(){
  var img=document.getElementById("imgZoomImg");
  return{sw:img.offsetWidth,sh:img.offsetHeight};
}
function applyZoom(instant){
  if(!izWrap)return;
  izWrap.style.transition=instant?"none":"transform .18s ease";
  var s=izState;
  izWrap.style.transform="translate("+s.tx+"px,"+s.ty+"px) scale("+s.z+")";
  document.getElementById("izVal").textContent=Math.round(s.z*100)+"%";
}
function setZoom(z){
  z=Math.min(izMax,Math.max(izMin,z));
  var r=imgZoomRect();
  var vw=window.innerWidth-48,vh=window.innerHeight-48;
  var sw=r.sw*z,sh=r.sh*z;
  var mx=Math.max(0,(sw-vw)/2),my=Math.max(0,(sh-vh)/2);
  izState.z=z;
  izState.tx=Math.min(mx,Math.max(-mx,izState.tx));
  izState.ty=Math.min(my,Math.max(-my,izState.ty));
  applyZoom();
}
function zoomImg(d){
  setZoom(izState.z+d*.25);
}
function zoomImgTo(z){
  izState.tx=0;izState.ty=0;
  setZoom(z);
}
function initImgZoom(){
  izWrap=document.getElementById("izWrap");
  if(!izWrap)return;
  var wrap=izWrap,img=document.getElementById("imgZoomImg");
  wrap.addEventListener("pointerdown",function(e){
    if(izState.z<=1)return;
    if(e.target!==img&&!wrap.contains(e.target))return;
    e.preventDefault();
    izDrag={x:e.clientX,y:e.clientY,tx:izState.tx,ty:izState.ty};
    wrap.classList.add("dragging");
    wrap.style.cursor="grabbing";
    try{wrap.setPointerCapture(e.pointerId)}catch(ex){}
  });
  wrap.addEventListener("pointermove",function(e){
    if(!izDrag)return;
    e.preventDefault();
    var r=imgZoomRect();
    var vw=window.innerWidth-48,vh=window.innerHeight-48;
    var sw=r.sw*izState.z,sh=r.sh*izState.z;
    var mx=Math.max(0,(sw-vw)/2),my=Math.max(0,(sh-vh)/2);
    izState.tx=Math.min(mx,Math.max(-mx,izDrag.tx+(e.clientX-izDrag.x)));
    izState.ty=Math.min(my,Math.max(-my,izDrag.ty+(e.clientY-izDrag.y)));
    applyZoom(true);
  });
  function endDrag(){
    izDrag=null;
    wrap.classList.remove("dragging");
    wrap.style.cursor=izState.z>1?"grab":"";
  }
  wrap.addEventListener("pointerup",endDrag);
  wrap.addEventListener("pointercancel",endDrag);
  wrap.addEventListener("dblclick",function(e){e.preventDefault();zoomImgTo(izState.z>1?1:2)});
  wrap.addEventListener("wheel",function(e){
    if(!isImgZoomOpen())return;
    e.preventDefault();
    setZoom(izState.z+(e.deltaY<0?.25:-.25));
  },{passive:false});
  wrap.addEventListener("click",function(e){
    if(izDrag)return;
    e.stopPropagation();
    if(izState.z<=1)return;
  });
}

function syncPresentation(){
  var fs=!!document.fullscreenElement;
  document.body.classList.toggle("presentation-mode",fs);
}
function toggleFS(){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen()}
function toggleFab(){var fp=document.getElementById("fabPanel");if(fp)fp.classList.toggle("open")}

// Timer
var tmI=null,tmS=0,tmT=0;
function setTimer(m){tmT=m*60;tmS=tmT;updTm();document.querySelectorAll(".tm-btns button").forEach(function(b){b.classList.remove("active")});document.getElementById("t"+m).classList.add("active");if(tmI){clearInterval(tmI);tmI=null}document.getElementById("tmStart").textContent="Iniciar"}
function startTimer(){if(tmI){clearInterval(tmI);tmI=null;document.getElementById("tmStart").textContent="Iniciar";return}if(tmS<=0)return;document.getElementById("tmStart").textContent="Pausar";tmI=setInterval(function(){tmS--;updTm();if(tmS<=0){clearInterval(tmI);tmI=null;document.getElementById("tmStart").textContent="Iniciar"}},1000)}
function pauseTimer(){if(tmI){clearInterval(tmI);tmI=null;document.getElementById("tmStart").textContent="Reiniciar"}}
function resetTimer(){if(tmI)clearInterval(tmI);tmI=null;tmS=tmT;updTm();document.getElementById("tmStart").textContent="Iniciar"}
function updTm(){var m=Math.floor(tmS/60),s=tmS%60;document.getElementById("tmD").textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s}

function revealAll(){document.querySelectorAll(".reto").forEach(function(r){if(!r.dataset.answered){r.dataset.answered="true";var rc=RETOS[r.id];var btns=r.querySelectorAll(".reto-opt");btns[rc.correct].classList.add("correct");var fb=document.getElementById(r.id+"FB");if(fb){fb.className="reto-fb show fb-g";fb.innerHTML="<strong>Respuesta correcta:</strong> "+(rc.fbOk||rc.exp)+retoSeqHTML(rc)}}});var cr=document.getElementById("cierreResp");if(cr)cr.style.display="block"}
function resetActivities(){document.querySelectorAll(".reto").forEach(function(r){delete r.dataset.answered;r.querySelectorAll(".reto-opt").forEach(function(o){o.classList.remove("correct","wrong","show-correct")});var fb=r.querySelector(".reto-fb");if(fb){fb.className="reto-fb";fb.innerHTML=""}})}

// ============================================================
// EVENTS
// ============================================================
function setupEvents(){
  document.addEventListener("fullscreenchange",syncPresentation);
  document.addEventListener("keydown",function(e){
    if(e.target && e.target.closest && e.target.closest("input,textarea,select,[contenteditable=true],#aulaEditor"))return;
    if(isImgZoomOpen()){
      if(e.key==="Escape"){e.preventDefault();closeImg();return}
      if(e.key==="+"||e.key==="="){e.preventDefault();zoomImg(1);return}
      if(e.key==="-"){e.preventDefault();zoomImg(-1);return}
      if(e.key==="0"){e.preventDefault();zoomImgTo(1);return}
      return;
    }
    if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();goSlide(currentSlide+1)}
    if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();goSlide(currentSlide-1)}
    if(e.key==="Escape")closeAll();
    if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();openSov()}
  });
  document.getElementById("sov").addEventListener("click",function(e){if(e.target===this)closeSov()});
  document.getElementById("modalO").addEventListener("click",function(e){if(e.target===this)closeModal()});
  document.getElementById("imgZoom").addEventListener("click",function(e){if(e.target===this)closeImg()});

  // Zonas activadoras del modo presentación
  var hdrTimer=null,navTimer=null;
  var top=document.getElementById("presTop"),bottom=document.getElementById("presBottom");
  var topbar=document.querySelector(".topbar"),prog=document.querySelector(".progress-line"),navbar=document.querySelector(".nav-bar");
  function showTopBar(){clearTimeout(hdrTimer);topbar.classList.add("reveal");prog.classList.add("reveal")}
  function hideTopBar(){clearTimeout(hdrTimer);hdrTimer=setTimeout(function(){if(!topbar.matches(":hover"))topbar.classList.remove("reveal");prog.classList.remove("reveal")},400)}
  function showNavBar(){clearTimeout(navTimer);navbar.classList.add("reveal")}
  function hideNavBar(){clearTimeout(navTimer);navTimer=setTimeout(function(){if(!navbar.matches(":hover"))navbar.classList.remove("reveal")},400)}
  top.addEventListener("pointerenter",function(){if(isImgZoomOpen())return;showTopBar()});
  top.addEventListener("pointerleave",function(){hideTopBar()});
  bottom.addEventListener("pointerenter",function(){if(isImgZoomOpen())return;showNavBar()});
  bottom.addEventListener("pointerleave",function(){hideNavBar()});
  topbar.addEventListener("pointerenter",function(){showTopBar()});
  topbar.addEventListener("pointerleave",function(){hideTopBar()});
  navbar.addEventListener("pointerenter",function(){showNavBar()});
  navbar.addEventListener("pointerleave",function(){hideNavBar()});
  initImgZoom();
  document.getElementById("sovI").addEventListener("input",function(){
    var q=this.value.toLowerCase().trim();
    var r=document.getElementById("sovR");
    if(!q){r.innerHTML="";return}
    var items=[
      {s:"Portada",i:0,t:"Retroalimentación FOLLOW UP OBSERVAMOS REFORZAMOS EJECUTAMOS"},
      {s:"Follow Up Mystery Shopper",i:1,t:"resultados agosto 2026 desviaciones sondeo script maestro plan de exito garantia ventec"},
      {s:"Comparativo de Desempeño",i:2,t:"comparativo top 10 destacadas mayor riesgo agencias calificacion ventas"},
      {s:"¿Qué nos dicen estos resultados?",i:3,t:"hallazgos desviaciones venta estandar habito"},
      {s:"01 Plan de Éxito",i:4,t:"tres pilares encontrar modelo ajustar presupuesto salir protegido"},
      {s:"02 Sondeo / Villano",i:5,t:"problema externo interno problema filosofico villano sondeo"},
      {s:"03 Script Maestro",i:6,t:"problema caracteristica tecnica beneficio constructor"},
      {s:"04 VENTEC",i:7,t:"VENTEC tecnologia conectividad telefono manubrio funciones compatibilidad beneficio"},
      {s:"05 Garantía",i:8,t:"garantia 3 anos 33000 km primer servicio 30 dias 300 km"},
      {s:"06 Póliza contra robo",i:9,t:"poliza robo violencia garantia seguro comparativa"},
      {s:"07 Seguros ANA",i:10,t:"seguro ANA cobertura proteccion tercer pilar"},
      {s:"08 Cierre transicional",i:12,t:"cierre transicional cotizacion seguimiento siguiente paso"},
      {s:"09 Bitácora y PILOT",i:13,t:"bitacora PILOT registro trazabilidad seguimiento tarea"},
      {s:"Cierre",i:14,t:"el estandar termina ejecutar compromisos"}
    ];
    var f=items.filter(function(it){return it.t.toLowerCase().indexOf(q)!==-1||it.s.toLowerCase().indexOf(q)!==-1});
    if(!f.length){r.innerHTML='<div class="sov-empty">No se encontraron resultados.</div>';return}
    r.innerHTML=f.map(function(it){
      var hl=it.s.replace(new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>");
      return '<div class="sov-ri" onclick="goSlide('+it.i+');closeSov()"><div class="sov-rm">'+it.s+'</div><div class="sov-rt">'+hl+'</div></div>';
    }).join("");
  });
}

function setupScrollListener(){
  document.querySelectorAll(".slide").forEach(function(s){
    s.addEventListener("scroll",function(){
      var btn=document.getElementById("stBtn");
      btn.classList.toggle("visible",s.scrollTop>200);
    });
  });
}

function animateBars(){
  document.querySelectorAll(".pr-fill[data-width]").forEach(function(bar){
    bar.style.width=bar.dataset.width+"%";
  });
}


// Si algún recurso visual no carga, muestra una tarjeta diagnóstica en lugar de un espacio vacío.
document.addEventListener("error",function(ev){
  var img=ev.target;
  if(img && img.tagName==="IMG" && !img.dataset.retroErrorHandled){
    img.dataset.retroErrorHandled="1";
    console.error("No se pudo cargar imagen:", img.getAttribute("src"));
    img.alt=(img.alt||"Imagen")+" · recurso no disponible";
    img.style.minHeight="80px";
    img.style.background="#f8fafc";
    img.style.border="1px dashed #cbd5e1";
  }
},true);

// ============================================================
// START
// ============================================================
if(isConsultationView() || !(new URLSearchParams(location.search).get("participant")==="1")){init();}
function slideVentaja(){return '<section class="slide advantage-slide" id="s_ventaja"><div class="slide-inner"><img class="advantage-image" src="assets/tu-ventaja-vender-mas.jpg" alt="Manual de Ventas 2.0: tu ventaja para vender más. Conectar con el cliente, presentar con propósito, generar confianza y cerrar más ventas." onclick="openImg(this.src)"><p class="advantage-caption">Toca la imagen para ampliarla.</p></div></section>';}
