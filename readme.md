## Guaraiba 1.0.0

Es un marco de trabajo desarrollado en JavaScript y qooxdoo que permite la creación de aplicaciones web para NodeJS bajo el patrón arquitectónico Modelo Vista Controlador.
Está basado en el marco de trabajo “Ruby on Rails” y aprovecha las bondades de qooxdoo para el desarrollo, compilación y documentación de aplicaciones bajo el paradigma de programación orientada a objetos.

### Características:
* Una aplicación en Guaraiba se crea a partir de una aplicación servidora en qooxdoo que hereda de guaraiba.Application. De igual modo ofrece clases bases para la implementación de los controladores, las clases del modelo, el controlador de rutas y la configuración de la aplicación.
* Las clases bases del modelo de datos facilitan la interacción con bases de datos sobre los gestores MySQL, MariaDB, PostgreSQL, SQLite3 y Oracle.
* Ofrece múltiples servicios de autenticación tales como local, ldap, soap, facebook, google entre otros de la familia de los módulos passport de NodeJS.
* Contiene una capa de abstracción para el desarrollo de servicios REST completos.
* Permite la implementación de las vistas en los formatos ejs, handlebars, jade, jasper report, mustache y swig.
* Permite de forma nativa y en correspondencia con las vistas implementadas, generar las respuestas a las peticiones en los formatos txt, json, js, xml, html, xhtml, pdf, docx, rtf, pptx, xlsx, xls, csv, odt, ods, odp, swf y jpeg.
* Permite configurar y ejecutar la aplicación en forma de cluster en relación con el número de procesadores disponibles en el servidor.
* Permite la configuración de acceso cross-domain.

### Requerimientos:
* Compilador G++
* Java JRE o JDK
