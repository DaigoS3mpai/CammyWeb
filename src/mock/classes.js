export const defaultClasses = [
  {
    id: 'matematicas-avanzadas',
    name: 'Matemáticas Avanzadas',
    description: 'Explorando los confines del cálculo multivariable y la topología algebraica. ¡Prepárate para que te explote la cabeza!',
    sections: {
      bitacora: [
        {
          id: 'mat-bit-1',
          title: 'Introducción a las Ecuaciones Diferenciales',
          content: 'Las ecuaciones diferenciales son ecuaciones que involucran una o más funciones y sus derivadas. Se utilizan para modelar fenómenos en ciencia, ingeniería, economía y biología. Por ejemplo, el crecimiento de poblaciones, la desintegración radiactiva, el movimiento de objetos y los circuitos eléctricos pueden describirse mediante ecuaciones diferenciales. Existen varios tipos, como las ordinarias (EDO) y las parciales (EDP), y métodos para resolverlas, incluyendo la separación de variables, factores integrantes y transformadas de Laplace.',
          date: '2023-09-01',
          tags: ['EDO', 'Cálculo']
        },
        {
          id: 'mat-bit-2',
          title: 'Teorema Fundamental del Cálculo',
          content: 'El Teorema Fundamental del Cálculo es una piedra angular que conecta las dos ramas principales del cálculo: la diferenciación y la integración. Establece que la derivación y la integración son operaciones inversas. La primera parte del teorema relaciona la derivada de una integral definida con la función original, mientras que la segunda parte proporciona un método para calcular integrales definidas utilizando antiderivadas. Este teorema simplificó enormemente el cálculo de áreas y volúmenes, que antes requerían límites de sumas de Riemann.',
          date: '2023-09-15',
          tags: ['Integración', 'Derivación']
        }
      ],
      experimentos: [
        {
          id: 'mat-exp-1',
          title: 'Simulación de Crecimiento Poblacional',
          content: 'Se implementó un modelo de crecimiento logístico utilizando ecuaciones diferenciales para simular la dinámica de una población de bacterias en un entorno limitado. Los resultados mostraron una fase de crecimiento exponencial inicial seguida de una estabilización a medida que los recursos se agotaban. Se compararon los resultados con datos empíricos y se observó una buena correlación.',
          date: '2023-10-05',
          tags: ['Modelado', 'Biología', 'Python'],
          materials: ['Python', 'Jupyter Notebook', 'Datos de población']
        }
      ],
      galeria: [
        {
          id: 'mat-gal-1',
          title: 'Gráfica de Ecuación Diferencial',
          url: 'https://via.placeholder.com/400x300/FF5733/FFFFFF?text=EDO+Gráfica',
          description: 'Visualización de la solución de una ecuación diferencial de primer orden.',
          date: '2023-09-01'
        },
        {
          id: 'mat-gal-2',
          title: 'Modelo de Crecimiento Logístico',
          url: 'https://via.placeholder.com/400x300/33FF57/FFFFFF?text=Crecimiento+Logístico',
          description: 'Curva de crecimiento poblacional obtenida de la simulación.',
          date: '2023-10-05'
        }
      ]
    }
  },
  {
    id: 'historia-universal',
    name: 'Historia Universal',
    description: 'Un viaje épico desde el Big Bang hasta el último meme. ¡Prepárate para aprender que la historia se repite, pero con diferentes atuendos!',
    sections: {
      bitacora: [
        {
          id: 'hist-bit-1',
          title: 'La Revolución Francesa',
          content: 'La Revolución Francesa (1789-1799) fue un período de profundos cambios políticos y sociales en Francia que tuvo un impacto duradero en la historia mundial. Marcó el fin de la monarquía absoluta y el feudalismo, y el ascenso de la burguesía. Sus principios de "Libertad, Igualdad, Fraternidad" inspiraron movimientos revolucionarios en todo el mundo. Eventos clave incluyen la toma de la Bastilla, la Declaración de los Derechos del Hombre y del Ciudadano, el Reinado del Terror y el ascenso de Napoleón Bonaparte.',
          date: '2023-11-05',
          tags: ['Francia', 'Revolución']
        },
        {
          id: 'hist-bit-2',
          title: 'La Guerra Fría',
          content: 'La Guerra Fría (1947-1991) fue un período de tensión geopolítica entre Estados Unidos y sus aliados (el Bloque Occidental) y la Unión Soviética y sus estados satélites (el Bloque del Este). Aunque nunca hubo un conflicto militar directo a gran escala entre las dos superpotencias, la rivalidad se manifestó a través de guerras subsidiarias, una carrera armamentista nuclear, espionaje, propaganda y competencia ideológica. La caída del Muro de Berlín en 1989 y la disolución de la URSS en 1991 marcaron su fin.',
          date: '2023-11-20',
          tags: ['Siglo XX', 'Conflicto']
        }
      ],
      experimentos: [], // No hay experimentos en Historia, ¡a menos que viajes en el tiempo!
      galeria: [
        {
          id: 'hist-gal-1',
          title: 'Toma de la Bastilla',
          url: 'https://via.placeholder.com/400x300/3357FF/FFFFFF?text=Bastilla',
          description: 'Representación artística de la toma de la Bastilla, 14 de julio de 1789.',
          date: '2023-11-05'
        },
        {
          id: 'hist-gal-2',
          title: 'Caída del Muro de Berlín',
          url: 'https://via.placeholder.com/400x300/5733FF/FFFFFF?text=Muro+Berlín',
          description: 'Ciudadanos celebrando la caída del Muro de Berlín en 1989.',
          date: '2023-11-20'
        }
      ]
    }
  },
  {
    id: 'programacion-web',
    name: 'Programación Web',
    description: 'Aprende a construir el futuro de internet, o al menos, una página web que no se caiga cada dos por tres. ¡Conviértete en un mago del código!',
    sections: {
      bitacora: [
        {
          id: 'prog-bit-1',
          title: 'Fundamentos de HTML y CSS',
          content: 'HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web, definiendo la estructura del contenido. CSS (Cascading Style Sheets) se utiliza para estilizar esas páginas, controlando la presentación, el diseño y la apariencia visual. Juntos, permiten crear sitios web atractivos y funcionales. HTML usa etiquetas para elementos como encabezados, párrafos e imágenes, mientras que CSS usa selectores y propiedades para aplicar estilos como colores, fuentes y espaciado.',
          date: '2024-01-10',
          tags: ['Frontend', 'Diseño']
        },
        {
          id: 'prog-bit-2',
          title: 'Introducción a JavaScript',
          content: 'JavaScript es un lenguaje de programación de alto nivel, interpretado y multiparadigma, fundamental para el desarrollo web interactivo. Permite añadir dinamismo a las páginas HTML, como animaciones, validación de formularios y manipulación del DOM. Originalmente diseñado para el navegador, su uso se ha expandido al backend con Node.js y a aplicaciones móviles con frameworks como React Native. Es un lenguaje versátil y esencial para cualquier desarrollador web moderno.',
          date: '2024-01-25',
          tags: ['Frontend', 'Interactividad']
        }
      ],
      experimentos: [
        {
          id: 'prog-exp-1',
          title: 'Creación de un Componente Interactivo con React',
          content: 'Se desarrolló un componente de contador interactivo en React, demostrando el uso de estados, props y manejo de eventos. El experimento incluyó la implementación de botones para incrementar y decrementar el valor, y un botón para resetearlo. Se utilizó Framer Motion para añadir animaciones suaves a los cambios de estado, mejorando la experiencia de usuario.',
          date: '2024-02-15',
          tags: ['React', 'Frontend', 'Framer Motion'],
          materials: ['React', 'Node.js', 'VS Code', 'Framer Motion']
        },
        {
          id: 'prog-exp-2',
          title: 'Diseño Responsivo con Tailwind CSS',
          content: 'Se aplicaron principios de diseño responsivo a una página de aterrizaje utilizando las utilidades de Tailwind CSS. El experimento se centró en el uso de clases de breakpoint para adaptar el diseño a diferentes tamaños de pantalla (móvil, tablet, escritorio), asegurando una experiencia de usuario óptima en todos los dispositivos. Se probó la adaptabilidad con las herramientas de desarrollo del navegador.',
          date: '2024-03-01',
          tags: ['Tailwind CSS', 'Diseño Responsivo', 'CSS'],
          materials: ['Tailwind CSS', 'HTML', 'Navegador web']
        }
      ],
      galeria: [
        {
          id: 'prog-gal-1',
          title: 'Componente de Contador React',
          url: 'https://via.placeholder.com/400x300/FF33A1/FFFFFF?text=React+Contador',
          description: 'Captura de pantalla del componente de contador interactivo.',
          date: '2024-02-15'
        },
        {
          id: 'prog-gal-2',
          title: 'Diseño Responsivo Tailwind',
          url: 'https://via.placeholder.com/400x300/A133FF/FFFFFF?text=Tailwind+Responsive',
          description: 'Ejemplo de diseño adaptativo en diferentes tamaños de pantalla.',
          date: '2024-03-01'
        }
      ]
    }
  }
];