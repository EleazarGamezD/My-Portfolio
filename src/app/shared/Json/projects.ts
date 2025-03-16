import {SvgIcons} from "@core/constants/sideIcons";
import {IProject} from "@core/interfaces/projects/projects.interfaces";

export const projects: IProject[] = [
  {
    "id": 1,
    "icon": SvgIcons.NodeJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Mailer App",
    "description": "Api Backend para envio de Email desde mi portafolio que envia dos(2) Emails uno mi y el otro para la persona que me escribe para notificar la recepción",
    resume: "",
    "technologies": "Stack de tecnologías : Nodejs, ExpressJS, JavaScript, Nodemailer, GoogleMails",
    "projectLink": "Link Privado",
    "codeLink": "https://github.com/EleazarGamezD/Mailer-Pf"
  },
  {
    "id": 2,
    "icon": SvgIcons.NodeJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Notes App",
    "description": "Api Backend para manejo de Notas tipo Pos sticks con manejo de usuarios, CRUD completo de Notas, manejo de Categorías asignadas a las notas",
    resume: "",
    "technologies": "Stack de tecnologías : Nodejs, ExpressJS, JavaScript, MongoDB, JsonWebToken (JTW), Html, CSS",
    "projectLink": "https://back-app-notas.vercel.app/",
    "codeLink": "https://github.com/EleazarGamezD/back-app-notas"
  },
  {
    "id": 3,
    "icon": SvgIcons.NestJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Tu Bodega Api",
    "description": "Api de un E-comerce escalable con funciones básicas como creación de usuarios, roles de usuarios, creación de productos, carrito de compras por usuario, control de compras, usando base de datos Relacional Postgres y TyORM para el manejo, sistema de autenticaciones y encriptado de passwords.",
    resume: "",
    "technologies": "Stack de tecnologías : Nodejs, NestJs, Typescript, Postgres Sql, TypeORM, JsonWebToken (JTW), Swagger(documentación)",
    "projectLink": "https://tu-bodega.vercel.app/",
    "codeLink": "https://github.com/EleazarGamezD/Tu-Bodega"
  },
  {
    "id": 4,
    "icon": SvgIcons.NestJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Pokedex",
    "description": "Backend con conexion al API pokeapi.co para implementación del seed, con conexión a MongoAtlas, usando el framework NestJs",
    resume: "",
    "technologies": "Stack de tecnologías : NestJs, NodeJs, MongoAtlas, Javascript, Typescript, docker",
    "projectLink": "",
    "codeLink": "https://github.com/EleazarGamezD/pokedex"
  },
  {
    "id": 5,
    "icon": SvgIcons.NestJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "GG-Shop",
    "description": "Backend de una app web tipo ecomerce realizada durante mis clases, con funciones básicas de productos y autenticación de usuarios, con conexión a base de datos Postgres uso de TypeOrm, e implementación de un chat por cliente usando Websockets.",
    resume: "",
    "technologies": "Stack de tecnologías : Nestjs, NodeJs, Postgres, TypeOrm, Javascript, Typescript, Websockets, Swagger (documentacion), Docker",
    "projectLink": "",
    "codeLink": "https://github.com/EleazarGamezD/gg-shop"
  },
  {
    "id": 6,
    "icon": SvgIcons.NestJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Proyecto WS-Client",
    "description": "Pequeño proyecto frontend que se conecta al api GG-shop para el servicio de websocket",
    resume: "",
    "technologies": "Stack de tecnologías : NodeJs, Typescript, Css, Html",
    "projectLink": "",
    "codeLink": "https://github.com/EleazarGamezD/ws-client"
  },
  {
    "id": 7,
    "icon": SvgIcons.AngularIcon,
    "images": ["assets/images/click.gif"],
    "title": "Rick-And-Morty-Angular-Test",
    "description": "Proyecto tipo ensayo, con conexión al api rickymortyapi.com realizado para aprender el uso de técnicas frontend a nivel junior",
    resume: "",
    "technologies": "Stack de tecnologías : NodeJs, Typescript,Javascript, Css, Html, Angular, Angular-Material.",
    "projectLink": "https://rickandmory-angulartest.netlify.app/",
    "codeLink": "https://github.com/EleazarGamezD/Rick-And-Morty-Angular-Test-"
  },
  {
    "id": 8,
    "icon": SvgIcons.NodeJsIcon,
    "images": ["assets/images/click.gif"],
    "title": "Cursos",
    "description": "Coleccion de proyectos realizados durante mis estudios de backend, divididos en carpetas segundo el ejercicio realizado donde tenemos: Auth, Compras, Mi-App, Proyecto-Mailer,Proyecto-Auth.",
    resume: "",
    "technologies": "Stack de tecnologías : NodeJs, Typescript,Javascript,MongoDB, Css, Html, React, Postman",
    "projectLink": "",
    "codeLink": "https://github.com/EleazarGamezD/CURSO"
  }
]
