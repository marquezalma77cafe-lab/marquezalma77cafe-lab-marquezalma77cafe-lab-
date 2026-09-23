# Acervo Maestría en Derecho

App web (un solo archivo, sin dependencias) con la bibliografía base de una maestría en derecho con acentuaciones en **constitucional, penal, laboral, fiscal y corporativo**, más un tronco común de teoría del derecho y metodología.

## Secciones

- **Bibliografía**: obras básicas por acentuación.
- **Tratados**: DUDH, PIDCP, PIDESC, Convención Americana, Estatuto de Roma, Palermo, Mérida, convenios de la OIT, T-MEC, Convención de Nueva York, MLI/BEPS, entre otros.
- **Legislación**: CPEUM, Ley de Amparo, CPF, CNPP, LFT, LSS, CFF, LISR, LIVA, LGSM, LMV, Código de Comercio, etc. (enlaces a la Cámara de Diputados).
- **Jurisprudencia**: Radilla Pacheco vs. México, Varios 912/2010, Contradicción de tesis 293/2011, Semanario Judicial de la Federación.
- **Infotecas y organismos**: SCJN, Biblioteca Jurídica Virtual del IIJ-UNAM, DOF, Corte IDH, CIDH, ONU, OIT, OCDE, SAT, TFJA, PRODECON, INACIPE, SciELO, Redalyc, Dialnet, vLex, HeinOnline y más.
- **Mi plan de lectura**: guarda obras, marca su estado (por leer, leyendo, leído), mira tu avance por acentuación, agrega referencias propias y copia tu bibliografía en formato APA.

## Uso

Abre `index.html` en cualquier navegador. Tu lista se guarda en el navegador (`localStorage`).

Para publicarla en internet puedes activar GitHub Pages sobre esta carpeta.

## Cómo agregar o editar obras

Todo el acervo está en el arreglo `DATA` dentro de `index.html`. Cada entrada tiene `tipo` (`libro`, `tratado`, `ley`, `juris`, `recurso`), `areas` (`comun`, `constitucional`, `penal`, `laboral`, `fiscal`, `corporativo`), título, autor, año, editorial, enlace y una nota.

> La bibliografía es una propuesta base; verifica ediciones vigentes y el texto actualizado de las leyes antes de citar.
