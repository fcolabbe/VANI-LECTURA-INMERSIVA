import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fileToEdit = path.join(rootDir, 'src/data/vaniData.js');
let content = fs.readFileSync(fileToEdit, 'utf-8');

// This script safely extracts, parses, updates, and rewrites the vaniData.js

const kodaTexts = {
  koda_1: [
    "Al salir el sol radiante, un fuerte temblor sacude la húmeda tierra bajo los pies descalzos de Koda. El valiente niño nativo respira profundo, toma su tambor de bambú y camina despacio buscando el origen del ruido misterioso que asusta al bosque.",
    "Junto a una gran raíz antigua, descubre a un escarabajo gigante golpeando el suelo muy rápido con sus patas. El ruido es completamente desordenado, asusta a los pajaritos y lastima terriblemente los delicados oídos del verde y frondoso bosque profundo.",
    "Koda saca su tambor de bambú y toca una pauta lenta, suave y calmada. El gran escarabajo escucha atentamente, frena sus nerviosas patas y comienza a copiar el hermoso ritmo tranquilo. Finalmente, el suelo de la selva deja de temblar."
  ],
  koda_2: [
    "El escarabajo gigante agradece a Koda y lo guía valientemente hacia una oscura cueva cubierta de musgo verde. Al entrar en la caverna, el eco de sus pisadas suena como tambores lejanos que los invitan a pasar sin tener miedo.",
    "Frente a ellos en la oscuridad, una inmensa puerta de piedra bloquea el camino. Tiene antiguos grabados de animales sabios que piden una pausa de silencio total para poder abrirse mágicamente y revelar su gran secreto oculto al mundo.",
    "Koda y el simpático escarabajo respiran en perfecta sincronía, cerrando los ojos y guardando un profundo silencio. La gran puerta de piedra se desliza muy suavemente, revelando un túnel subterráneo brillante y húmedo que los invita a explorar juntos."
  ],
  koda_3: [
    "Al cruzar la misteriosa puerta, Koda descubre un gran río subterráneo muy furioso. El agua azul corre con tanta fuerza que choca violentamente contra las gruesas raíces del enorme árbol abuelo, haciéndolas vibrar como si estuvieran llorando de dolor.",
    "Las afiladas rocas del cauce están sueltas y provocan que el agua salte desordenadamente sin control. Koda comprende inmediatamente que este salvaje desorden acuático es el verdadero origen del molesto temblor que tanto asusta a todos en la selva.",
    "Para calmar el furioso torrente frío, Koda se sienta cerca de la mojada orilla. Cierra los ojos con mucha paciencia y comienza a golpear su tambor mágico simulando el sonido tranquilo de la lluvia suave cayendo sobre las hojas."
  ],
  koda_4: [
    "El río agitado escucha la hermosa melodía del tambor y baja su velocidad inmediatamente. El agua fresca ahora fluye en perfecta armonía, acariciando suavemente las grandes raíces del árbol abuelo sin lastimarlas ni sacudirlas con violencia nunca más.",
    "El gran árbol antiguo, sintiéndose muy feliz y aliviado, deja caer una pequeña hoja dorada brillante como ofrenda de amor. La hoja aterriza suavemente y con gracia sobre el cálido y sereno tambor de madera que sostiene Koda.",
    "Al tocar la madera sagrada, la hoja mágica comienza a brotar hermosamente transformándose en una semilla de luz pura. Koda sonríe porque sabe que el bosque profundo lo está llamando con cariño hacia un nuevo y emocionante misterio sonoro."
  ],
  koda_5: [
    "Siguiendo el brillante destello dorado de la pequeña semilla de luz, Koda desciende lentamente por un antiguo camino de grandes raíces retorcidas. Muy pronto llega a una inmensa laguna de aguas oscuras donde decenas de ranas verdes saltan y cantan en un desorden total. Ninguna rana escucha a la otra, y todas croan al mismo tiempo creando gran alboroto que asusta a los peces.",
    "El ruido incesante de la gran laguna es tan alto que resulta casi ensordecedor para Koda. Las pequeñas ranas están muy estresadas y asustadas porque perdieron su ritmo natural para cantar juntas. Koda sabe en su corazón que si no hacen algo rápido, todos los animales del bosque entero comenzarán a entrar en un terrible pánico por culpa de esta enorme y ruidosa confusión.",
    "Con muchísima paciencia y gran amor por la naturaleza, Koda se para valientemente sobre una gran hoja de nenúfar flotante. Levanta su Tambor de Bambú y se convierte en el sabio guía de la laguna. Toca un solo golpe fuerte y claro, seguido de un largo y respetuoso silencio, invitando a las tímidas ranas a imitar su hermosa pausa para poder calmarse por completo."
  ],
  koda_6: [
    "Más adelante en el espeso y húmedo bosque verde, Koda se encuentra con un enorme oso pardo de mirada triste. El gran animal sufre de un terrible insomnio debido al ruido que hacían las ranas. Camina en círculos sin descanso, pisando fuerte y rompiendo pesadas ramas secas con su gran peso, sin poder encontrar nada de paz para su profundo cansancio acumulado.",
    "De repente, el oso cansado y muy frustrado lanza un potente rugido hacia el cielo estrellado. El aterrador sonido asusta a los pajaritos azules que dormían plácidamente en las ramas más altas del bosque. Koda comprende inmediatamente que el gran oso no es malo, sino que simplemente está muy exhausto, profundamente frustrado y no sabe cómo volver a encontrar su añorada tranquilidad nocturna.",
    "Koda se sienta a una distancia segura sobre el pasto suave y comienza a tocar una hermosa y rítmica canción de cuna con su tambor. El patrón de golpes lentos, simulando el latido de un corazón relajado y feliz, hace que los pesados párpados del enorme oso se cierren poco a poco hasta quedar profundamente dormido bajo la brillante y mágica luz de la luna."
  ],
  koda_7: [
    "Con el gran oso descansando felizmente bajo los árboles, Koda retoma su camino hacia las oscuras profundidades de la misteriosa selva. Sin embargo, entra valientemente en una extraña zona llena de lianas coloridas que se mueven solas como serpientes. Estas lianas mágicas producen múltiples sonidos extraños y engañosos, creando una fuerte distracción para cualquier explorador desprevenido que intente cruzar por ese lugar.",
    "Koda es un niño muy sabio y sabe que para no perderse en la oscuridad necesita mantener la máxima concentración posible. Cierra sus ojos firmemente y decide ignorar por completo los crujidos falsos de las tramposas lianas. Se guía únicamente por el sutil y constante brillo cálido de la pequeña semilla de luz que el árbol abuelo le obsequió en la primera caverna del viaje.",
    "Entre todo el ruido falso y molesto de las plantas mágicas, Koda logra escuchar un verdadero y muy suave susurro de viento. Es el sonido de la naturaleza acariciando un pasadizo secreto escondido magistralmente tras una enorme roca cubierta de helechos verdes. Tocando un ritmo constante de marcha, el valiente niño avanza seguro y sin miedo hacia el corazón palpitante del gran bosque escondido."
  ],
  koda_8: [
    "Detrás del misterioso pasaje secreto, Koda descubre un enorme cañón vertical muy oscuro. Para descender sano y salvo, debe usar una antiquísima y frágil escalera colgante de cuerda. Cada vez que pisa la vieja madera, esta empieza a crujir amenazadoramente, como si estuviera a punto de romperse y caer al inmenso vacío oscuro de la montaña.",
    "Koda evalúa la peligrosa situación con mucha inteligencia. Se da cuenta rápidamente de que no puede bajar corriendo sin caerse. Decide probar cada peldaño tocando primero su tambor una sola vez con mucha suavidad. Si la madera resuena firme y sin grietas peligrosas, entonces Koda avanza dando un solo paso lento, seguro y cuidadosamente coordinado con la mágica música de su amado tambor ancestral.",
    "Este antiguo método lento pero sumamente infalible le exige al niño mantener un perfecto equilibrio tanto en su cuerpo físico como en su mente concentrada. Respirando al compás musical de sus propios pasos cautelosos, el niño desciende metro a metro sin equivocarse, acercándose cada vez más al profundo latido subterráneo que parece ser el mismísimo corazón mágico y protector de toda la inmensa selva verde."
  ],
  koda_9: [
    "Al llegar completamente sano y salvo al fondo profundo del gran cañón, Koda se encuentra maravillosamente en una inmensa caverna subterránea. Un hermoso resplandor de color esmeralda y oro baña todas las rocas húmedas del lugar con gran magia. El aire aquí abajo es impresionantemente fresco, muy limpio y huele dulcemente a tierra fértil mojada y a tiernas hojas recién nacidas en plena primavera colorida.",
    "En el centro exacto del inmenso claro iluminado, una enorme piedra cristalina late con una fuerza increíble e incontrolable. Esta es la gran pulsación mágica que viaja velozmente por las profundas raíces de los árboles y mueve la vida entera. Sin embargo, el ritmo vital del cristal está ligeramente acelerado y caótico, como si estuviera asustado por algo misterioso que nadie en el bosque comprende.",
    "El niño nativo se acerca respetuosamente, sabiendo con certeza que ha llegado al umbral más profundo y sagrado de su propio hogar. Prepara sus pequeñas manos sobre el suave cuero de su Tambor de Bambú. Sabe que la única forma de sanar a la inmensa selva es enseñarle nuevamente al asustado cristal la inmensa belleza del silencio puro, la paciencia infinita y el compás armónico."
  ],
  koda_10: [
    "Frente al majestuoso cristal central de la enorme cueva subterránea, Koda nota con mucha preocupación que la enorme piedra emite destellos completamente desordenados. Su latido es increíblemente frenético y descontrolado, golpeando el aire frío con intensas ondas de luz que confunden rápidamente los ojos. Koda entiende que este ritmo tan exagerado, rápido y muy violento es la causa principal de todo el terrible temblor que atormenta sin descanso y asusta terriblemente a los inocentes animales de la selva en la superficie iluminada por el brillante sol.",
    "Debido a la peligrosa vibración del gigantesco cristal verde, desde el altísimo techo de la gran cueva comienzan a desprenderse varios pequeños pedazos de roca. Cada fragmento que cae y choca violentamente contra el suelo genera un eco falso y engañoso que intenta interrumpir la música y distraer la mente del joven explorador. Sin embargo, el sabio Koda sabe perfectamente que debe mantenerse enfocado al máximo en su importante tarea sanadora sin mirar el fuerte ruido de las rocas al caer rápidamente a su alrededor.",
    "Con los ojos amablemente cerrados y el noble corazón lleno de una inmensa paciencia, Koda comienza a tocar suavemente su amado Tambor de Bambú. No intenta apurar al gran cristal ni tampoco golpea la madera con fuerza o desesperación alguna. En su lugar, ofrece un ritmo firme, totalmente seguro, constante y muy profundo, buscando conectar de verdad con el bosque. Es un hermoso ritmo protector que actúa exactamente como una amorosa madre abrazando tiernamente a un niño pequeño asustado en medio de la oscura tormenta."
  ],
  koda_11: [
    "El gran cristal brillante, sintiéndose temeroso de cambiar su velocidad descontrolada, muestra una fuerte e intensa resistencia a la dulce melodía sanadora de Koda. Para intentar asustar rápidamente al niño y hacer que se detenga por completo, la piedra comienza a proyectar destellos intensos y a emitir ruidos extraños que suenan exactamente igual al aullido feroz de los grandes lobos salvajes del bosque. El pesado ambiente de la inmensa caverna subterránea se vuelve repentinamente muy tenso, aterrador y frío para cualquier viajero que intente explorarla.",
    "El valiente Koda, sin embargo, es un auténtico hijo de la selva nativa y conoce a la perfección los múltiples sonidos reales de sus amados hermanos animales. Él reconoce fácil e inmediatamente que estos espeluznantes aullidos rebotando en la cueva son solamente una simple ilusión creada por el gran miedo del cristal herido. Sin inmutarse jamás, sin mover un solo músculo de su rostro, sigue tocando su tambor de bambú con un hermoso patrón de golpes medidos con enorme tranquilidad y exactitud musical para ayudar a la tierra.",
    "De manera muy repentina e inesperada, Koda se detiene por completo en medio de su relajante música. Deja de golpear el cuero del tambor y guarda inteligentemente un asombroso silencio absoluto durante varios largos y misteriosos segundos. Este silencio repentino es tan inmensamente profundo y verdaderamente poderoso que el enorme cristal gigante de la cueva se sorprende de inmediato. La luminosa piedra deja de latir frenéticamente por un breve y mágico instante, esperando escuchar ansiosamente cuál será el próximo sonido del niño sabio."
  ],
  koda_12: [
    "En ese preciso y maravilloso instante de total silencio reparador, Koda vuelve a acariciar dulcemente el antiguo cuero de su noble tambor. El valiente niño comienza a sincronizar a la perfección sus lentos y amorosos golpes con la nueva y muy calmada respiración profunda del enorme cristal mágico. Lentamente, la inmensa piedra esmeralda abandona por completo su molesta luz estroboscópica y agresiva, dejándose envolver, sanar y abrazar tiernamente por la más hermosa y relajante melodía de cuna proveniente del corazón de la milenaria selva nativa.",
    "La intensa luz de la profunda caverna subterránea se transforma lentamente en un hermoso resplandor muy suave, cálido y completamente apacible para los cansados ojos. La temperatura de la cueva de piedra se vuelve sumamente agradable y el fuerte viento que antes azotaba el lugar desaparece misteriosamente sin dejar ningún rastro, dejando únicamente un bellísimo silencio sanador que llena el joven corazón de pura y verdadera paz absoluta. Koda sonríe abiertamente al sentir con alegría que la magia musical por fin está funcionando de maravilla.",
    "El niño Koda se acerca caminando lentamente al cristal calmado y apoya muy suavemente sus dos pequeñas manos sobre la inmensa superficie tibia y brillante de la gran piedra. En ese exacto momento mágico, siente de pronto un inmenso y poderoso arraigo con toda la maravillosa naturaleza que lo rodea. Puede sentir claramente en su pecho cómo las gigantescas raíces cansadas del árbol abuelo vuelven a hidratarse felizmente y a descansar en paz, nutriéndose por fin de la energía calmada y curativa que ahora fluye libremente."
  ],
  koda_13: [
    "Con el latido de la gran piedra finalmente curado, el equilibrio de todo el inmenso bosque nativo vuelve a restaurar su curso tranquilo. Muy por encima de la cueva, en la lejana superficie soleada, el violento temblor de la tierra desaparece por completo. Todos los maravillosos animales de la inmensa selva abandonan valientemente sus oscuros escondites y regresan muy felices a los hermosos senderos iluminados por el cálido sol para celebrar pacíficamente la maravillosa tranquilidad y la paz que ha regresado finalmente a sus amados hogares.",
    "La profunda caverna iluminada por el mágico cristal esmeralda gigante ahora parece un grandioso y bellísimo santuario secreto de la naturaleza pacífica. Las pequeñas semillas esparcidas por el húmedo suelo de piedra comienzan a germinar lentamente frente a los ojos del niño feliz, pintando delicadamente la roca gris con preciosas y múltiples hojitas de brillante color verde, como si el inmenso corazón del gran bosque estuviera regalando hermosamente nueva vida fresca tras superar por fin el terrible gran susto del ruidoso temblor que los afectaba.",
    "El valiente Koda guarda con infinito amor y profundo respeto su querido Tambor de Bambú curativo dentro de su pequeño bolso de explorador de la selva. Siente de inmediato una inmensa y cálida gratitud verdadera llenando por completo todo su alegre pecho infantil. El niño comprende ahora que la gran solución a los difíciles problemas del ruidoso mundo no requiere de gran fuerza física ni de gritos molestos, sino simplemente saber escuchar con paciencia, pausar a tiempo y marcar sabiamente el dulce compás correcto para encontrar paz."
  ],
  koda_14: [
    "Antes de que Koda se despida alegremente de la mágica caverna subterránea, el inmenso cristal esmeralda sanado realiza un último, silencioso y hermosísimo parpadeo dorado como profundo agradecimiento al niño. De la punta superior más afilada de la gigantesca piedra, nace lentamente una perfecta, cristalina y mágica gota de rocío azul muy brillante. La pequeña gota de agua cae con una grandiosa delicadeza y tremenda elegancia, aterrizando limpiamente sin salpicar sobre una preciosa y antigua concha marina perlada que nadie sabe exactamente cómo llegó misteriosamente hasta ese lugar subterráneo.",
    "El curioso Koda recoge cuidadosamente la antigua concha marina abandonada y observa con maravilla la mágica gota de agua pura posada suavemente en el centro. El precioso líquido azulado es tan espectacularmente translúcido bajo la luz esmeralda que parece contener realmente un pequeño pedacito del inmenso cielo estrellado atrapado en su delicado interior. Al acercar la concha muy suavemente a su oído, el niño de la inmensa selva no escucha el familiar ruido de los vientos de su verde hogar, sino un hermoso sonido completamente nuevo y muy misterioso.",
    "El maravilloso sonido que emana desde el interior de la pequeña concha es el constante y rítmico ir y venir de una inmensa marea de agua infinita. El espectacular canto lejano de unas enormes ballenas resuena cristalino en su interior. Koda, el valiente niño de la tierra, sonríe con mucha alegría y guarda el valioso tesoro marino en su bolso, sabiendo profundamente en su corazón de héroe que este hermoso y dulce eco sonoro de los gigantescos mares profundos ahora llama a una nueva aventura en el inmenso mundo."
  ]
};

// Modificamos el contenido de vaniData.js usando expresiones regulares simples pero robustas para cada escena de Koda
for (let capNum = 1; capNum <= 14; capNum++) {
  const capKey = `koda_${capNum}`;
  const texts = kodaTexts[capKey];
  for (let escNum = 1; escNum <= 3; escNum++) {
    const text = texts[escNum - 1];
    // Find exactly the block for the scene and replace its text.
    // Escaping regex might be hard, so we do index based replacements.
    
    // We look for: 'id': 'koda_1' ... "id": 1, ... "texto": "..."
    const searchString = `"id": ${escNum},\n                "texto": "`;
    let startIdx = 0;
    
    // We first narrow down to the chapter
    let chapterIdx = content.indexOf(`"${capKey}": {`);
    if (chapterIdx === -1) {
        chapterIdx = content.indexOf(`'${capKey}': {`);
    }
    
    if (chapterIdx !== -1) {
        let sceneStart = content.indexOf(`"id": ${escNum},`, chapterIdx);
        let textPropStart = content.indexOf(`"texto": "`, sceneStart);
        if (textPropStart !== -1) {
            let textStart = textPropStart + `"texto": "`.length;
            let textEnd = content.indexOf(`",`, textStart);
            if (textEnd !== -1) {
                const before = content.substring(0, textStart);
                const after = content.substring(textEnd);
                content = before + text + after;
            }
        }
    }
  }
}

fs.writeFileSync(fileToEdit, content);
console.log("✅ Textos de KODA expandidos correctamente en vaniData.js");
