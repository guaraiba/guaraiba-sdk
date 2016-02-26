## Guaraiba

It is a framework developed in JavaScript and qooxdoo that allows the creation of web applications NodeJS under the
Model View Controller architectural pattern.

It is based on the framework "Ruby on Rails" and take advantage of the benefits of qooxdoo for the development,
compilation and documentation of applications under the paradigm of object-oriented programming.

### Characteristics:
* An guaraiba application  is created from a server application in qooxdoo that inherits from guaraiba.Application.
  Similarly this provides the basis classes for the implementation of the controllers, the model classes, the
  controller routing and the application configuration classes.
* The basis classes of the data model facilitate interaction with databases MySQL, MariaDB, PostgreSQL, SQLite3 and
  Oracle managers.
* It offers multiple authentication services such as local, ldap, soap, facebook, google and others of the family of
  the passport modules in NodeJS.
* It contains a layer of abstraction for the development of complete REST services.
* It allows the implementation of views on formats ejs, handlebars, jade, jasper report and mustache.
* Allows natively and in correspondence with the views implemented, generating responses to requests in formats txt,
  json, js, xml, html, xhtml, pdf, docx, rtf, pptx, xlsx, xls, csv, odt, ods ODP, swf and jpeg.
* Allows configure and run the application as a cluster in relation with number of processors available on the server.
* It allows configuration of cross-domain access.

### Requirements:
* G++ Compiler to install **java** module.
* Java JRE o JDK to install **java** module.

### Installation:

1.  Install globally modules **guaraiba**, **qooxdoo** and **jake**.

    **Install modules from GitLab repository of [Universidad de las Ciencias Informáticas](https://codecomunidades.uci.cu).**

    ```shell
    npm install -g git+ssh://git@codecomunidades.uci.cu:andypa/guaraiba.git
    npm install -g git+ssh://git@codecomunidades.uci.cu:yfsegredo/extra-libs.git#qooxdoo-5.0.1-sdk
    npm install -g jake
    ```

    **Install modules from [GitHub](https://github.com).**

    ```shell
    npm install -g git+https://github.com/yoandrypa/guaraiba.git
    npm install -g git+https://github.com/qooxdoo/qooxdoo.git
    npm install -g jake
    ```

2.  Generate new guaraiba server application.

    **Interactive mode:**
    
    ```shell
    guaraiba new-app
    ```
    
    **Quiet mode:**
    
    ```shell
    guaraiba new-app name=myproyect namespace=myproyect.test
    guaraiba new-app n=myproyect ns=myproyect.test
    ```

3.  The created application implements the data model on a SQLite database so you should install globally
    **sqlite3** module or turn off databese default scheme, with removing in class **myApp.Configuration** the line
    ``this.registerDBSchema (myApp.schemas.Default. getInstance ());``

    ```shell
    npm install -g sqlite3
    ```
    
    > You can use another database manager changing the data connection on **myApp.schemas.Default**.

4.  Change to directory of new application and compile the project with one of the following options.

    **Build in develop mode:**

    ```shell
    jake jake build:dev
    ```

    **Build in production mode:**

    ```shell
    python generate.py
    ```

    > You can view the list of available tasks by running the command **jake**, **jake -T** or
      **node source/script/myapp-server.js**.

5.  Run application with one of the following options.

    ```shell
    jake start
    ```

    ```shell
    node source/script/myapp-server.js start
    ```
