import {SvgIcons} from "@core/constants/sideIcons";
import {ITechStack} from "@core/interfaces/techStack/techStack.interface";

export const techStack: ITechStack[] = [
  {
    iconUrl: SvgIcons.AngularIcon,
    name: 'Angular',
  },
  {
    iconUrl: SvgIcons.BootstrapIcon,
    name: 'Bootstrap',
  },
  {
    iconUrl: SvgIcons.NodeJsIcon,
    name: 'Node.js - Express',
  },
  {
    iconUrl: SvgIcons.DockerIcon,
    name: 'Docker',
  },
  {
    iconUrl: SvgIcons.NestJsIcon,
    name: 'Nest.js',
  },
  {
    iconUrl: SvgIcons.PostmanIcon,
    name: 'Postman',
  },
  {
    iconUrl: SvgIcons.TypeScriptIcon,
    name: 'TypeScript',
  },
];
