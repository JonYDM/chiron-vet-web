import type { Variants, Transition } from "framer-motion";

/** Transición base expresiva (coincide con los easings de los tokens). */
export const transicionSuave: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

/** Entrada con fade + desplazamiento hacia arriba (para tarjetas y secciones). */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transicionSuave },
};

/** Fade simple. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

/**
 * Contenedor que anima a sus hijos en cascada (stagger). Úsalo con motion.ul/div
 * y elementos hijos que usen `itemStagger`.
 */
export const listaStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

/** Ítem de una lista con stagger. */
export const itemStagger: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transicionSuave },
};
