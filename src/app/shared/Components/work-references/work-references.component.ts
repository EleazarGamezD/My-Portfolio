import {Component} from '@angular/core';
import {IWorkReferences} from '@core/interfaces/work-references/work-references.interface';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent {

  workReferences: IWorkReferences[] = [
    {
      name: 'Arian Valdivieso',
      position: 'COO',
      company: 'Meraki Office',
      testimonialEn: 'Eleazar proved to be an exceptional team member, standing out for his proactive nature and remarkable adaptive abilities. His commitment to projects and eagerness to learn significantly contributed to our success at Meraki.',
      testimonialEs: 'Eleazar demostró ser un miembro excepcional del equipo, destacándose por su naturaleza proactiva y sus notables habilidades de adaptación. Su compromiso con los proyectos y entusiasmo por aprender contribuyó significativamente a nuestro éxito en Meraki.',
    },
    {
      name: 'Wilhelm Flores',
      position: 'Full Stack Developer',
      company: 'Meraki Office',
      testimonialEn: 'Eleazar is an excellent problem solver. His ability to think outside the conventional and propose scalable solutions was key to the success of our projects.',
      testimonialEs: 'Eleazar es un excelente solucionador de problemas. Su capacidad para pensar fuera de lo convencional y proponer soluciones escalables fue clave para el éxito de nuestros proyectos.'
    },
    {
      name: 'Elvis Garcia',
      position: 'Backend Developer / DevOps',
      company: 'Meraki Office',
      testimonialEs: 'Trabajé con Eleazar resolviendo problemas técnicos de forma eficiente y profesional. Durante nuestro tiempo juntos, demostró ser sumamente efectivo generando soluciones escalables y robustas para el equipo.',
      testimonialEn: 'I worked with Eleazar solving technical problems efficiently and professionally. During our time together, he proved to be extremely effective at generating scalable and robust solutions for the team.'
    },
    {
      name: 'Xiover Aldana',
      position: 'Frontend Developer',
      company: 'Meraki Office',
      testimonialEs: 'Fue un placer trabajar con Eleazar, una persona altamente colaboradora e inteligente. Su capacidad para aprender rápido y adaptarse a nuevos desafíos lo hace invaluable. Siempre brinda apoyo con actitud positiva y profesionalismo.',
      testimonialEn: 'It was a pleasure to work with Eleazar, a highly collaborative and intelligent person. His ability to learn quickly and adapt to new challenges makes him invaluable. He always provides support with a positive attitude and professionalism.'
    },
    {
      name: 'Maria Salazar',
      position: 'Backend Developer',
      company: 'Meraki Office',
      testimonialEs: 'Trabajé con Eleazar desarrollando funcionalidades para una API de e-commerce. Es un profesional comprometido que enseña con el ejemplo y comparte su conocimiento generosamente, impulsando mi crecimiento profesional.',
      testimonialEn: 'I worked with Eleazar developing functionalities for an e-commerce API. He is a committed professional who teaches by example and shares his knowledge generously, driving my professional growth.'
    }
  ];

}
